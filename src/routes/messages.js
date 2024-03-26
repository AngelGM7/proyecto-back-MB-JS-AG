import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.js'
import { MessagesModel } from '../models/Messages.js'

const router = Router()

router.get('/', verifyToken, (req, res, next) => {
	const messages = MessagesModel.findAll({ where: { receiver: req.user.id } })
	res.json({ messages })
})

router.get('/:id', verifyToken, (req, res) => {})

router.post('/new', verifyToken, (req, res) => {})

export default router
