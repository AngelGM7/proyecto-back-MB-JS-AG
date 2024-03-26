import {
	randomBytes,
	createCipheriv,
	createDecipheriv,
	scryptSync,
	createDiffieHellman,
} from 'crypto'
const algorithm = 'aes-256-cbc'
export function generateDHKeys(size) {
	// Paso 1: Generar los parámetros Diffie-Hellman
	const dh = createDiffieHellman(size) // Selecciona el tamaño de la clave según tus necesidades

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
	return { iv: iv.toString('hex'), encryptedData: encrypted }
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
