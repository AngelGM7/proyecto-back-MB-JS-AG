import {
	randomBytes,
	createCipheriv,
	createDecipheriv,
	scryptSync,
	createDiffieHellman,
	timingSafeEqual,
	hkdf,
	diffieHellman,
	KeyObject,
	createSecretKey,
} from 'crypto'
const { PRIME, GENERATOR } = process.env
const prime = Buffer.from(PRIME, 'hex')
const generator = Buffer.from(GENERATOR, 'hex')
const algorithm = 'aes-256-cbc'
export function generateDHKeys() {
	// Paso 1: Generar los parámetros Diffie-Hellman
	const dh = createDiffieHellman(prime, generator) // Selecciona el tamaño de la clave según tus necesidades

	// Paso 2: Generar una clave pública y privada para tu lado
	const publicKey = dh.generateKeys('hex') // Genera tu clave pública en hexadecimal
	const privateKey = dh.getPrivateKey('hex') // Genera tu clave privada en hexadecimal
	return { publicKey, privateKey }
}

// Función para cifrar un mensaje con AES
export function encryptMessage(message, key) {
	const iv = randomBytes(16)
	const cipher = createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)
	let encrypted = cipher.update(message, 'utf8', 'hex')
	encrypted += cipher.final('hex')
	return `${iv.toString('hex')}:${encrypted}`
}

// Función para descifrar un mensaje con AES
export function decryptMessage(encryptedData, iv, key) {
	const decipher = createDecipheriv(
		algorithm,
		Buffer.from(key, 'hex'),
		Buffer.from(iv, 'hex')
	)
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
	decrypted += decipher.final('utf8')
	return decrypted
}

export function encryptPrivateKey(privateKey, password) {
	const key = scryptSync(password, 'salt', 32) // Genera una clave a partir de la contraseña
	const iv = randomBytes(16) // Genera un vector de inicialización

	const cipher = createCipheriv(algorithm, key, iv)
	let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex')
	encryptedPrivateKey += cipher.final('hex')

	return iv.toString('hex') + ':' + encryptedPrivateKey
}

// Función para descifrar la clave privada
export function decryptPrivateKey(encryptedPrivateKey, password) {
	const key = scryptSync(password, 'salt', 32) // Genera una clave a partir de la contraseña
	const [ivHex, encryptedKey] = encryptedPrivateKey.split(':')
	const iv = Buffer.from(ivHex, 'hex')

	const decipher = createDecipheriv(algorithm, key, iv)
	let decryptedPrivateKey = decipher.update(encryptedKey, 'hex', 'utf8')
	decryptedPrivateKey += decipher.final('utf8')

	return decryptedPrivateKey
}
export function comparePasswords(password, dbPassword) {
	const [salt, key] = dbPassword.split(':')

	const hashedBuffer = scryptSync(password, salt, 64)
	const keyBuffer = Buffer.from(key, 'hex')
	return timingSafeEqual(hashedBuffer, keyBuffer)
}

export function derivedKey(key, salt, info, keyLength) {
	const ikm = Buffer.from(key, 'hex')
	const bufferSalt = Buffer.from(salt, 'hex')
	const bufferInfo = Buffer.from(info, 'hex')
	return new Promise((resolve, reject) => {
		hkdf(
			'sha512',
			ikm,
			bufferSalt,
			bufferInfo,
			keyLength,
			(err, derivedKey) => {
				if (err) {
					reject(err)
				} else {
					resolve(Buffer.from(derivedKey).toString('hex'))
				}
			}
		)
	})
}

export async function getEncryptedMessage({
	message,
	privateKey,
	publicKey,
	info,
}) {
	const dh = createDiffieHellman(prime, generator)
	dh.setPrivateKey(privateKey, 'hex')
	const dhKey = dh.computeSecret(publicKey, 'hex', 'hex')
	const dvKey = await derivedKey(dhKey, 'salt', info, 32)
	const encryptedMessage = encryptMessage(message, dvKey)
	return encryptedMessage
}

export async function getDecryptedMessage({
	message,
	privateKey,
	publicKey,
	info,
}) {
	const dh = createDiffieHellman(prime, generator)
	dh.setPrivateKey(privateKey, 'hex')
	const dhKey = dh.computeSecret(publicKey, 'hex', 'hex')
	const dvKey = await derivedKey(dhKey, 'salt', info, 32)

	const [iv, em] = message.split(':')
	const decryptedMessage = decryptMessage(em, iv, dvKey)
	return decryptedMessage
}
