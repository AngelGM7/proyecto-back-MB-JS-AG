import { Router } from 'express'
import { UsersModel } from '../models/Users.js'
import { randomBytes, scryptSync } from 'node:crypto'
import { nanoid } from 'nanoid'
import { validateData } from '../middlewares/validation.js'
import {
	secretPassSchema,
	userLoginSchema,
	userRegistrationSchema,
} from '../models/validation.js'
import { generateToken } from '../lib/jwt.js'
import { verifyToken } from '../middlewares/auth.js'
import {
	comparePasswords,
	decryptPrivateKey,
	encryptPrivateKey,
	generateDHKeys,
} from '../lib/encrypt.js'
const router = Router()
router.post(
	'/register',
	validateData(userRegistrationSchema),
	async (req, res) => {
		try {
			const { email, username, password, name, lastName } = req.body
			const [isEmail, isUsername] = await Promise.all([
				UsersModel.findOne({ where: { email } }),
				UsersModel.findOne({ where: { username } }),
			])
			if (isEmail) {
				res
					.status(400)
					.json({ error: 'Email already registered', registered: true })
				return
			}
			if (isUsername) {
				res
					.status(400)
					.json({ error: 'Username already taken', usernameTaken: true })
				return
			}

			const salt = randomBytes(16).toString('hex')
			const hashedPassword = scryptSync(password, salt, 64).toString('hex')
			const user = {
				id: nanoid(),
				email,
				username,
				name,
				lastName,
				password: `${salt}:${hashedPassword}`,
			}
			await UsersModel.create(user)
			const token = generateToken({ id: user.id, username, role: 'USER' })
			res.json({ token, message: 'Registration successfully' })
		} catch (error) {
			console.error(e)
			res.status(500).json({ message: 'Internal server error' })
		}
	}
)

router.post('/login', validateData(userLoginSchema), async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await UsersModel.findOne({ where: { email } })

		if (!user) {
			res.status(400).json({ message: 'Invalid email' })
			return
		}
		const match = comparePasswords(password, user.password)

		if (match) {
			const token = generateToken({
				id: user.id,
				role: user.role,
				username: user.username,
			})
			res.json({ token, message: 'Logged successfully', valid: true })
		} else {
			res.json({ message: 'Invalid password' })
		}
	} catch (error) {
		console.error(e)
		res.status(500).json({ message: 'Internal server error' })
	}
})
router.post(
	'/generate-secret',
	verifyToken,
	validateData(secretPassSchema),
	async (req, res) => {
		try {
			const { password } = req.body
			const user = await UsersModel.findByPk(req.user.id)
			if (user.public_key || user.private_key) {
				res.status(400).json({ message: 'User already has keys ' })
				return
			}
			const { privateKey, publicKey } = generateDHKeys()
			const encryptedPVK = encryptPrivateKey(privateKey, password)
			await UsersModel.update(
				{
					private_key: encryptedPVK,
					public_key: publicKey,
				},
				{ where: { id: req.user.id } }
			)
			res.json({ message: 'Private and public keys created' })
		} catch (error) {
			console.error(e)
			res.status(500).json({ message: 'Internal server error' })
		}
	}
)
router.put(
	'/change-secret',
	verifyToken,
	validateData(secretPassSchema),
	async (req, res) => {
		try {
			const { password } = req.body
			const user = await UsersModel.findByPk(req.user.id)
			if (!user.public_key || !user.private_key) {
				res.status(400).json({ message: `User doesn't have keys` })
				return
			}
			const decryptedPrivateKey = decryptPrivateKey(user.private_key, password)
			const encryptedPVK = encryptPrivateKey(decryptedPrivateKey, password)
			await UsersModel.update(
				{
					private_key: encryptedPVK,
				},
				{ where: { id: req.user.id } }
			)
			res.json({ message: 'Private key updated' })
		} catch (error) {
			console.error(e)
			res.status(500).json({ message: 'Internal server error' })
		}
	}
)
router.get(
	'/get-secret',
	verifyToken,
	validateData(secretPassSchema),
	async (req, res) => {
		try {
			const { password } = req.body
			const user = await UsersModel.findByPk(req.user.id, {
				attributes: ['private_key', 'public_key'],
			})
			if (!user.public_key || !user.private_key) {
				res.status(400).json({ message: `User doesn't have keys` })
				return
			}
			const decryptedPVK = decryptPrivateKey(user.private_key, password)
			res.json({ key: decryptedPVK })
		} catch (e) {
			console.error(e)
			res.status(500).json({ message: 'Internal server error' })
		}
	}
)

router.post('/validate-token', verifyToken, (req, res) => {
	res.status(200).send({ valid: true })
})

export default router
