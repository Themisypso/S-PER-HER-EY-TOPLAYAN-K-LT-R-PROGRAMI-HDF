export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import * as api from '@/lib/api'

const registerSchema = z.object({
    name: z.string().min(2, 'Name too short').max(50),
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, username, email, password } = registerSchema.parse(body)

        const existingEmail = await prisma.user.findUnique({ where: { email } })
        if (existingEmail) {
            return api.conflict('An account with this email already exists')
        }

        const existingUsername = await prisma.user.findUnique({ where: { username } })
        if (existingUsername) {
            return api.conflict('This username is already taken')
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
            data: { name, username, email, password: hashedPassword },
            select: { id: true, username: true, name: true, email: true, createdAt: true },
        })

        return api.created({ user, message: 'Account created successfully' })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return api.badRequest(error.errors[0].message)
        }
        console.error('[REGISTER ERROR]', error)
        return api.serverError()
    }
}
