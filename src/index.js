import http from 'node:http'
import express from 'express'

import { sequelize } from './database/database.js'
import pino from 'pino-http'
import pinoPretty from 'pino-pretty'

import usersRouter from './routes/users.js'
import messagesRouter from './routes/messages.js'

import './models/Messages.js'
import './models/Users.js'
import { socket } from './Socket.js'

const app = express()
const server = http.createServer(app)
socket.setServer(server)
app.use(express.json())
app.use(pino(pinoPretty()))

app.use('/api/users', usersRouter)
app.use('/api/messages', messagesRouter)

async function init() {
	try {
		await sequelize.sync({ alter: true })
		server.listen(3000, () => console.log('server ready on port 3000'))
	} catch (e) {
		console.error(e)
	}
}
init()
