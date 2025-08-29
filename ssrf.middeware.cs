using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.RegularExpressions;

public class SsrfProtectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly bool isDevelopment;

    private static readonly Regex UrlRegex = new(@"https?:\/\/[^\s""'<>]+", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public SsrfProtectionMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        isDevelopment = env.IsDevelopment();
    }

    public async Task Invoke(HttpContext context)
    {
        var urlsToCheck = new List<string>();

        // Query string URL tarama
        foreach (var q in context.Request.Query)
        {
            if (UrlRegex.IsMatch(q.Value))
                urlsToCheck.AddRange(UrlRegex.Matches(q.Value).Select(m => m.Value));
        }

        // Header URL tarama
        foreach (var h in context.Request.Headers)
        {
            if (UrlRegex.IsMatch(h.Value))
                urlsToCheck.AddRange(UrlRegex.Matches(h.Value).Select(m => m.Value));
        }

        // Body URL tarama
        if (context.Request.ContentLength > 0 &&
            context.Request.ContentType != null &&
            context.Request.ContentType.Contains("application/json", StringComparison.OrdinalIgnoreCase))
        {
            context.Request.EnableBuffering();

            using var memoryStream = new MemoryStream();
            await context.Request.Body.CopyToAsync(memoryStream);
            memoryStream.Position = 0;
            context.Request.Body.Position = 0;

            using var reader = new StreamReader(memoryStream);
            var bodyStr = await reader.ReadToEndAsync();

            try
            {
                var jsonDoc = JsonDocument.Parse(bodyStr);
                ExtractUrlsFromJson(jsonDoc.RootElement, urlsToCheck);
            }
            catch (JsonException)
            {
                // Ignore malformed JSON
            }
        }

        // Her URL'yi doğrula
        foreach (var url in urlsToCheck.Distinct())
        {
            if (!await IsUrlSafeAsync(url))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync($"Blocked unsafe URL: {url}");
                return;
            }
        }

        await _next(context);
    }

    private void ExtractUrlsFromJson(JsonElement element, List<string> foundUrls)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                foreach (var prop in element.EnumerateObject())
                    ExtractUrlsFromJson(prop.Value, foundUrls);
                break;
            case JsonValueKind.Array:
                foreach (var item in element.EnumerateArray())
                    ExtractUrlsFromJson(item, foundUrls);
                break;
            case JsonValueKind.String:
                var str = element.GetString();
                if (str != null && UrlRegex.IsMatch(str))
                    foundUrls.AddRange(UrlRegex.Matches(str).Select(m => m.Value));
                break;
        }
    }

    private async Task<bool> IsUrlSafeAsync(string urlStr)
    {
        try
        {
            var uri = new Uri(urlStr);
            if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                return false;

            IPAddress[] addresses = await Dns.GetHostAddressesAsync(uri.Host);

            foreach (var ip in addresses)
            {
                if (IsPrivateIp(ip) && !isDevelopment)
                {
                    return false;
                }
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    private bool IsPrivateIp(IPAddress ip)
    {
        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            var bytes = ip.GetAddressBytes();
            return
                bytes[0] == 10 ||
                (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) ||
                (bytes[0] == 192 && bytes[1] == 168) ||
                bytes[0] == 127 ||
                (bytes[0] == 169 && bytes[1] == 254);
        }

        if (ip.AddressFamily == AddressFamily.InterNetworkV6)
        {
            return ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal || IPAddress.IsLoopback(ip);
        }

        return true;
    }
}