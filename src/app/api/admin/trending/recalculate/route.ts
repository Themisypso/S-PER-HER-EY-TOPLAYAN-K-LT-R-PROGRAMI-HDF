import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/trending/recalculate
// Admin-only weekly job that:
//   1. Fetches all Media items in the shared catalogue
//   2. Counts activity signals for each via their linked MediaItems
//   3. Computes trendScore (views*0.3 + quotes*0.2 + discussions*0.2 + listAppearances*0.15 + favorites*0.15)
//   4. Ranks within each type (top 10 per category: movie, tv, anime, game)
//   5. Upserts MediaStats with new weeklyRank, lastWeekRank, weeksInTop10

const RANK_TYPES = ['movie', 'tv', 'anime', 'game'] as const

// Map Media.type (stored as lowercase) to MediaItem.type (uppercase enum)
const mediaTypeToCatalogueKey: Record<string, string> = {
    movie: 'MOVIE',
    tv: 'TVSHOW',
    anime: 'ANIME',
    game: 'GAME',
}

export async function POST(_req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // ── 1. Fetch all Media items with their linked data ──────────────────
        const allMedia = await prisma.media.findMany({
            where: { type: { in: ['movie', 'tv', 'anime', 'game'] } },
            select: {
                id: true,
                type: true,
                externalId: true,
                mediaItems: {
                    select: {
                        id: true,
                        userId: true,
                        quotes: { select: { id: true } },
                    },
                },
                listItems: { select: { id: true } },
                discussions: { select: { id: true } },
                stats: {
                    select: { weeklyRank: true, weeksInTop10: true },
                },
            },
        })

        // ── 2. Fetch favorites (FavoriteMedia.tmdbId maps to Media.externalId) ─
        const allFavorites = await prisma.favoriteMedia.findMany({
            select: { tmdbId: true, type: true },
        })

        // Build a map: externalId → favorite count
        const favoriteCountMap = new Map<string, number>()
        for (const fav of allFavorites) {
            const key = fav.tmdbId
            favoriteCountMap.set(key, (favoriteCountMap.get(key) ?? 0) + 1)
        }

        // ── 3. Fetch legacy DiscussionThreads linked by tmdbId ────────────────
        const tmdbDiscussions = await prisma.discussionThread.findMany({
            where: { tmdbId: { not: null } },
            select: { tmdbId: true },
        })
        const tmdbDiscCountMap = new Map<string, number>()
        for (const d of tmdbDiscussions) {
            if (!d.tmdbId) continue
            tmdbDiscCountMap.set(d.tmdbId, (tmdbDiscCountMap.get(d.tmdbId) ?? 0) + 1)
        }

        // ── 4. Compute trendScore per Media item ──────────────────────────────
        interface ScoredItem {
            mediaId: string
            type: string
            trendScore: number
            views: number
            quotes: number
            discussions: number
            favorites: number
            listAppearances: number
            existingRank: number | null
            existingWeeksInTop10: number
        }

        const scored: ScoredItem[] = allMedia.map((m) => {
            const views = m.mediaItems.length
            const quotes = m.mediaItems.reduce((acc, mi) => acc + mi.quotes.length, 0)
            const catalogueDiscussions = m.discussions.length
            const legacyDiscussions = tmdbDiscCountMap.get(m.externalId ?? '') ?? 0
            const discussions = catalogueDiscussions + legacyDiscussions
            const favorites = favoriteCountMap.get(m.externalId ?? '') ?? 0
            const listAppearances = m.listItems.length

            const trendScore =
                views * 0.3 +
                quotes * 0.2 +
                discussions * 0.2 +
                listAppearances * 0.15 +
                favorites * 0.15

            return {
                mediaId: m.id,
                type: m.type,
                trendScore,
                views,
                quotes,
                discussions,
                favorites,
                listAppearances,
                existingRank: m.stats?.weeklyRank ?? null,
                existingWeeksInTop10: m.stats?.weeksInTop10 ?? 0,
            }
        })

        // ── 5. Rank per type (top 10 each) ────────────────────────────────────
        let totalUpdated = 0

        for (const rankType of RANK_TYPES) {
            const group = scored.filter((s) => s.type === rankType)
            group.sort((a, b) => b.trendScore - a.trendScore)
            const top10 = group.slice(0, 10)

            for (let i = 0; i < top10.length; i++) {
                const item = top10[i]
                const newRank = i + 1
                const wasInTop10 = item.existingRank != null && item.existingRank <= 10
                const newWeeksInTop10 = wasInTop10 ? item.existingWeeksInTop10 + 1 : 1

                await prisma.mediaStats.upsert({
                    where: { mediaId: item.mediaId },
                    create: {
                        mediaId: item.mediaId,
                        trendScore: item.trendScore,
                        weeklyRank: newRank,
                        lastWeekRank: null,
                        weeksInTop10: newWeeksInTop10,
                        rankType,
                        views: item.views,
                        quotes: item.quotes,
                        discussions: item.discussions,
                        favorites: item.favorites,
                        listAppearances: item.listAppearances,
                    },
                    update: {
                        lastWeekRank: item.existingRank,
                        trendScore: item.trendScore,
                        weeklyRank: newRank,
                        weeksInTop10: newWeeksInTop10,
                        rankType,
                        views: item.views,
                        quotes: item.quotes,
                        discussions: item.discussions,
                        favorites: item.favorites,
                        listAppearances: item.listAppearances,
                    },
                })
                totalUpdated++
            }

            // Items that fell out of top 10 — clear their rank
            const droppedOut = group.slice(10)
            for (const item of droppedOut) {
                if (item.existingRank != null) {
                    await prisma.mediaStats.upsert({
                        where: { mediaId: item.mediaId },
                        create: {
                            mediaId: item.mediaId,
                            trendScore: item.trendScore,
                            weeklyRank: null,
                            lastWeekRank: item.existingRank,
                            weeksInTop10: 0,
                            rankType,
                            views: item.views,
                            quotes: item.quotes,
                            discussions: item.discussions,
                            favorites: item.favorites,
                            listAppearances: item.listAppearances,
                        },
                        update: {
                            lastWeekRank: item.existingRank,
                            trendScore: item.trendScore,
                            weeklyRank: null,
                            weeksInTop10: 0,
                            views: item.views,
                            quotes: item.quotes,
                            discussions: item.discussions,
                            favorites: item.favorites,
                            listAppearances: item.listAppearances,
                        },
                    })
                }
            }
        }

        return NextResponse.json({
            ok: true,
            processed: allMedia.length,
            ranked: totalUpdated,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('[TRENDING RECALCULATE ERROR]', error)
        return NextResponse.json({ error: 'Recalculation failed' }, { status: 500 })
    }
}
