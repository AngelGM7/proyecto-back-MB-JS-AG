import jwt from 'jsonwebtoken'
const { SECRET } = process.env

export const generateToken = (userInfo, expiresIn = 604800) => {
	return jwt.sign(userInfo, SECRET, { expiresIn })
}
