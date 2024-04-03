import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.js'
import { MessagesModel } from '../models/Messages.js'
import { validateData } from '../middlewares/validation.js'
import { messageSchema } from '../models/validation.js'
import { UsersModel } from '../models/Users.js'
import { nanoid } from 'nanoid'
import { getDecryptedMessage, getEncryptedMessage } from '../lib/encrypt.js'
import { format } from 'date-fns'
import { sendMessageToUser } from '../lib/socket.js'
const router = Router()

router.get('/', verifyToken, async (req, res) => {
	try {
		const messages = await MessagesModel.findAll({
			where: { receiver: req.user.id },
			attributes: ['id', 'sender', 'subject', 'sent_date'],
		})
		res.json({ messages, total: messages.length })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Internal server error' })
	}
})
router.post(
	'/new',
	verifyToken,
	validateData(messageSchema),
	async (req, res) => {
		try {
			const { subject, message, receiverId, privateKey } = req.body
			if (receiverId === req.user.id) {
				res.status(400).json({ message: `You can't send message to your self` })
				return
			}
			const receiver = await UsersModel.findByPk(receiverId, {
				attributes: ['id', 'public_key'],
			})
			if (!receiver) {
				res.status(400).json({ message: `The receiver doesn't exists` })
				return
			}

			const encryptedMessage = await getEncryptedMessage({
				publicKey: receiver.public_key,
				privateKey,
				message,
				info: req.user.id,
			})

			const newMessage = {
				id: nanoid(25),
				subject,
				message: encryptedMessage,
				senderId: req.user.id,
				receiverId: receiver.id,
				viewed: false,
				sent_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
			}
			await MessagesModel.create(newMessage)
			res.json({ message: 'message created' })
			sendMessageToUser({ userId: receiverId, data: { sender: req.user } })
		} catch (e) {
			console.error(e)
			res.status(500).json({ message: 'Internal server error' })
		}
	}
)
router.post('/:id', verifyToken, async (req, res) => {
	try {
		const { privateKey } = req.body
		const messageId = req.params.id
		const message = await MessagesModel.findByPk(messageId, {
			include: [
				{
					model: UsersModel,
					as: 'sender',
					attributes: ['public_key'],
				},
			],
		})
		if (!message) {
			res.status(400).json({ message: `The message doesn't exists` })
			return
		}
		if (
			message.receiverId !== req.user.id &&
			message.senderId !== req.user.id
		) {
			res.status(401).json({ message: `You don't have access to this message` })
			return
		}
		const decryptedMessage = await getDecryptedMessage({
			message: message.message,
			info: message.senderId,
			privateKey,
			publicKey: message.sender.public_key,
		})
		console.log(decryptedMessage)
		res.json({ message: decryptedMessage, subject: message.subject })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Internal server error' })
	}
})

export default router
