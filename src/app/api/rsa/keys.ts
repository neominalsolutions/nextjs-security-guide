import crypto from 'crypto';

export const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
	modulusLength: 2048,
	publicKeyEncoding: {
		type: 'spki',
		format: 'pem',
	},
	privateKeyEncoding: {
		type: 'pkcs8',
		format: 'pem',
	},
});

// PRIVATE KEY Oluşturma (2048 Bit)
// openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
// PUBLİC KEY Oluşturma
// openssl rsa -in private.pem -pubout -out public.pem
