import jwt from 'jsonwebtoken'
const { SECRET } = process.env

/**
 * @function
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

export const verifyToken = (req, res, next) => {
	// Extract the token from the Authorization header
	const authHeader = req.headers.authorization
	const token = authHeader?.split(' ')[1]

	// If no token is provided, return an error
	if (!token) {
		return res.status(401).json({ message: 'Authorization header missing' })
	}

	// Secret key used to sign the JWT token

	try {
		// Verify the token
		const decodedToken = jwt.verify(token, SECRET)
		// Attach the decoded token to the request object
		req.user = decodedToken
		// Proceed to the next middleware
		next()
	} catch (error) {
		// If the token is invalid, return an error
		return res.status(401).json({ message: 'Invalid or expired token' })
	}
}

/**
 * @function
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const checkAdmin = (req, res, next) => {
	// Assuming the verifyToken middleware has already attached the decoded token to req.user
	if (req.user && req.user.role === 'admin') {
		// Proceed to the next middleware or route handler
		next()
	} else {
		// If the user is not an admin, return a 403 Forbidden error
		return res
			.status(403)
			.json({ message: 'Forbidden: Only admins can access this resource' })
	}
}
