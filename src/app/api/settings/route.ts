import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import * as api from '@/lib/api'

const settingsSchema = z.object({
    name: z.string().min(2).optional(),
    bio: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    isPublic: z.boolean().optional(),
    hideRatings: z.boolean().optional(),
    hideActivity: z.boolean().optional(),
    showSteamProfile: z.boolean().optional(),
    language: z.string().optional(),
    theme: z.enum(['LIGHT', 'DARK', 'CYBERPUNK', 'RETROWAVE']).optional(),
})

export async function GET(_req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return api.unauthorized()

    try {
        let settings = await prisma.userSettings.findUnique({
            where: { userId: session.user.id }
        })

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId: session.user.id }
            })
        }

        return api.ok({ settings })
    } catch (e) {
        console.error('[SETTINGS GET]', e)
        return api.serverError('Failed to fetch settings')
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return api.unauthorized()

    try {
        const body = await req.json()
        const { name, ...settingsData } = settingsSchema.parse(body)

        // Run both updates in a transaction
        const [updatedSettings] = await prisma.$transaction([
            prisma.userSettings.upsert({
                where: { userId: session.user.id },
                update: settingsData,
                create: { ...settingsData, userId: session.user.id }
            }),
            ...(name ? [prisma.user.update({
                where: { id: session.user.id },
                data: { name }
            })] : [])
        ])

        return api.ok({ settings: updatedSettings })
    } catch (e) {
        if (e instanceof z.ZodError) {
            return api.badRequest(e.errors[0].message)
        }
        console.error('[SETTINGS PATCH]', e)
        return api.serverError('Failed to update settings')
    }
}
