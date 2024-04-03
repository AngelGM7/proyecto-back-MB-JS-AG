import { socket as socketInstance } from '../Socket.js'

const socket = socketInstance.getInstance()
export function sendMessageToUser({ userId, data }) {
	const socketId = socket.users[userId]
	if (socketId) {
		socket.io.to(socketId).emit('new-message', data)
	}
}
