# Hop-by-hop header’ları strip et

proxy_set_header Connection "";
proxy_hide_header Transfer-Encoding;

# İstekleri tam buffer’la (CL/TE uyumsuzluk riskini düşürür):

proxy_request_buffering on;
proxy_buffering on;

# Allowed hosts (host header’ı kısıtla):

if ($host !~* ^(www\.)?example\.com$) { return 400; }