import { Server } from 'socket.io'
import { verifyTokenSocket } from './middlewares/auth.js'

class Socket {
	users = {}
	static io = null
	constructor() {
		if (!Socket.io) {
			Socket.io = new Server()
		}
	}

	setServer(server) {
		this.io = new Server(server, { cors: true })
		this.io.use(verifyTokenSocket)
		this.io.on('connection', (socket) => {
			console.log('connected to socket server')
			const userId = socket.user.id // or any other unique identifier
			this.users[userId] = socket.id
			console.log(this.users)
			socket.on('disconnect', () => {
				delete this.users[userId]
			})
		})
	}
	getInstance() {
		return this
	}
	emit(event, data) {
		this.io.emit(event, data)
	}
}

export const socket = new Socket()
