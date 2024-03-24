import {
	generateKeyPairSync,
	publicEncrypt,
	privateEncrypt,
	randomBytes,
	privateDecrypt,
	createDecipheriv,
} from 'crypto'

// Generate RSA keys for sender and recipient
const senderKeys = generateKeyPairSync('rsa', { modulusLength: 2048 })
const recipientKeys = generateKeyPairSync('rsa', { modulusLength: 2048 })

// Function to encrypt a message
function encryptMessage(message, recipientPublicKey) {
	const bufferMessage = Buffer.from(message, 'utf8')
	const encryptedMessage = publicEncrypt(recipientPublicKey, bufferMessage)
	return encryptedMessage.toString('base64')
}

// Function to encrypt a symmetric key
function encryptSymmetricKey(symmetricKey, senderPrivateKey) {
	const encryptedSymmetricKey = privateEncrypt(senderPrivateKey, symmetricKey)
	return encryptedSymmetricKey.toString('base64')
}

// Example usage
const message = 'Hello'
const symmetricKey = randomBytes(32) // Example symmetric key

// Encrypt the message with the recipient's public key
const encryptedMessage = encryptMessage(message, recipientKeys.publicKey)

// Encrypt the symmetric key with the sender's private key
const encryptedSymmetricKey = encryptSymmetricKey(
	symmetricKey,
	senderKeys.privateKey
)

console.log('Encrypted Message:', encryptedMessage)
console.log('Encrypted Symmetric Key:', encryptedSymmetricKey)

// Decrypt the symmetric key with the sender's private key
const decryptedSymmetricKey = privateDecrypt(
	senderKeys.privateKey,
	Buffer.from(encryptedSymmetricKey, 'base64')
)

// Decrypt the message with the symmetric key
const decryptedMessage = createDecipheriv(
	'aes-256-cbc',
	decryptedSymmetricKey,
	Buffer.alloc(16, 0)
).update(Buffer.from(encryptedMessage, 'base64'), 'base64', 'utf8')

console.log('Decrypted Message:', decryptedMessage)
