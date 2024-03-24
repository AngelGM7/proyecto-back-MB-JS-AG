import { z } from 'zod'

export const userRegistrationSchema = z.object({
	username: z.string(),
	email: z.string().email(),
	password: z.string().min(12),
	firstName: z.string(),
	lastName: z.string(),
})

export const userLoginSchema = z.object({
	username: z.string(),
	password: z.string().min(12),
})
