export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trending/[mediaId]
// Returns MediaStats for a single media item (used by TrendBadge on detail pages).
export async function GET(
    _req: Request,
    { params }: { params: { mediaId: string } }
) {
    const { mediaId } = params

    try {
        const stats = await prisma.mediaStats.findUnique({
            where: { mediaId },
            select: {
                weeklyRank: true,
                lastWeekRank: true,
                weeksInTop10: true,
                trendScore: true,
                rankType: true,
            },
        })

        if (!stats) {
            return NextResponse.json({ stats: null })
        }

        const rankDelta =
            stats.lastWeekRank != null && stats.weeklyRank != null
                ? stats.lastWeekRank - stats.weeklyRank
                : null

        return NextResponse.json({
            stats: {
                ...stats,
                rankDelta,
                useRawgFallback: stats.rankType === 'game' && stats.trendScore === 0,
            },
        })
    } catch (error) {
        console.error('[TRENDING SINGLE ERROR]', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
