export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trending?type=movie&limit=10
// Returns the top-N items ranked by weeklyRank for a given type.
// Books (BOOK) are excluded from the response.
// Games: fall back to RAWG popularity-based label when trendScore === 0.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || 'movie').toLowerCase() // movie | tv | anime | game
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)

    // Books never show rankings
    if (type === 'book') {
        return NextResponse.json({ items: [] })
    }

    try {
        const stats = await prisma.mediaStats.findMany({
            where: {
                rankType: type,
                weeklyRank: { not: null },
            },
            orderBy: { weeklyRank: 'asc' },
            take: limit,
            include: {
                media: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        posterUrl: true,
                        backdropUrl: true,
                        releaseDate: true,
                        popularity: true,
                        externalId: true,
                        source: true,
                    },
                },
            },
        })

        const items = stats.map((s) => {
            const rankDelta =
                s.lastWeekRank != null && s.weeklyRank != null
                    ? s.lastWeekRank - s.weeklyRank // positive = improved (rose)
                    : null

            return {
                mediaId: s.mediaId,
                weeklyRank: s.weeklyRank,
                lastWeekRank: s.lastWeekRank,
                weeksInTop10: s.weeksInTop10,
                trendScore: s.trendScore,
                rankDelta,
                // Game fallback: if trendScore is 0, signal that there's no platform data
                useRawgFallback: s.rankType === 'game' && s.trendScore === 0,
                media: {
                    id: s.media.id,
                    title: s.media.title,
                    type: s.media.type,
                    posterUrl: s.media.posterUrl,
                    backdropUrl: s.media.backdropUrl,
                    releaseYear: s.media.releaseDate
                        ? new Date(s.media.releaseDate).getFullYear()
                        : null,
                    externalId: s.media.externalId,
                    source: s.media.source,
                },
            }
        })

        return NextResponse.json({ items })
    } catch (error) {
        console.error('[TRENDING GET ERROR]', error)
        return NextResponse.json({ error: 'Failed to fetch trending data' }, { status: 500 })
    }
}
