import { z } from 'zod'

export const userRegistrationSchema = z.object({
	username: z.string(),
	email: z.string().email(),
	password: z.string().min(12),
	name: z.string(),
	lastName: z.string().optional(),
})

export const userLoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(12),
})

export const secretPassSchema = z.object({
	password: z.string().min(12),
})

export const messageSchema = z.object({
	subject: z.string().min(1),
	message: z.string().min(1),
	receiverId: z.string().min(21),
})
