import { Router } from 'express'
import { UsersModel } from '../models/Users.js'
import {
	randomBytes,
	scryptSync,
	generateKeyPairSync,
	timingSafeEqual,
} from 'node:crypto'
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
		req.log.info()
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
	}
)

router.post('/login', validateData(userLoginSchema), async (req, res) => {
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
		res.json({ token, message: 'Logged successfully' })
	} else {
		res.json({ message: 'Invalid password' })
	}
})

router.post(
	'/change-secret',
	verifyToken,
	validateData(secretPassSchema),
	async (req, res) => {
		const { password } = req.body
		const user = await UsersModel.findByPk(req.user.id)
		if (!user.public_key || !user.private_key) {
			const { privateKey, publicKey } = generateDHKeys(2048)
			const encryptedPVK = encryptPrivateKey(privateKey, password)
			await UsersModel.update(
				{
					private_key: encryptedPVK,
					public_key: publicKey,
				},
				{ where: { id: req.user.id } }
			)
			res.json({ message: 'Private and public keys created' })
		} else {
			const encryptedPVK = encryptPrivateKey(privateKey, password)
			await UsersModel.update(
				{
					private_key: encryptedPVK,
				},
				{ where: { id: req.user.id } }
			)
			res.json({ message: 'Private key updated' })
		}
	}
)
router.get(
	'/get-secret',
	verifyToken,
	validateData(secretPassSchema),
	async (req, res) => {
		const { password } = req.body
		const { private_key } = await UsersModel.findByPk(req.user.id, {
			attributes: ['private_key'],
		})
		const decryptedPVK = decryptPrivateKey(private_key, password)
		res.json({ key: decryptedPVK })
	}
)

export default router
