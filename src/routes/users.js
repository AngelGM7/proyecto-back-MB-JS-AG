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
import { userRegistrationSchema } from '../models/validation.js'
import { generateToken } from '../lib/jwt.js'
const router = Router()

router.post(
	'/register',
	validateData(userRegistrationSchema),
	async (req, res) => {
		req.log.info()
		const { email, username, password, firstName, lastName } = req.body
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
		const hashedPassword = scryptSync(password, salt, 64)
		const { publicKey, privateKey } = generateKeyPairSync('rsa', {
			modulusLength: '4096',
		})
		const user = {
			id: nanoid(),
			email,
			username,
			firstName,
			lastName,
			password: `${salt}:${hashedPassword}`,
			publicKey,
			privateKey,
		}
		await UsersModel.create(user)
		const token = generateToken({ id: user.id, role: 'USER' })
		res.json({})
	}
)

router.post('/login', async (req, res) => {
	const { email, password } = req.body
	const user = await UsersModel.findOne({ where: { email } })

	const [salt, key] = user.password.split(':')
	const hashedBuffer = scryptSync(password, salt, 64)
	const keybuffer = Buffer.from(key, 'hex')
	const match = timingSafeEqual(hashedBuffer, keybuffer)
	const token = generateToken({})
	if (match) {
		res.json({ token })
	} else {
	}
})

export default router
