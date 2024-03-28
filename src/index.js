import express from 'express'
import usersRouter from './routes/users.js'
import messagesRouter from './routes/messages.js'
import { sequelize } from './database/database.js'
import pino from 'pino-http'
import pinoPretty from 'pino-pretty'
import './models/Messages.js'
import './models/Users.js'
const app = express()

app.use(express.json())
app.use(pino(pinoPretty()))

app.use('/api/users', usersRouter)
app.use('/api/messages', messagesRouter)
async function init() {
	try {
		await sequelize.sync({ alter: true })
		app.listen(3000, () => console.log('server ready on port 3000'))
	} catch (e) {
		console.error(e)
	}
}
init()
