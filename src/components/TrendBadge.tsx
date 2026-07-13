'use client'

import { useEffect, useState } from 'react'
import { Flame, TrendingUp, TrendingDown, Trophy } from 'lucide-react'

interface TrendStats {
    weeklyRank: number | null
    lastWeekRank: number | null
    weeksInTop10: number
    trendScore: number
    rankType: string | null
    rankDelta: number | null
    useRawgFallback: boolean
}

interface TrendBadgeProps {
    /** The Media.id (internal cuid) used to look up stats */
    mediaId: string | null | undefined
    /** The type from MediaItem (MOVIE, TVSHOW, ANIME, GAME, BOOK) */
    mediaType: string
}

export function TrendBadge({ mediaId, mediaType }: TrendBadgeProps) {
    const [stats, setStats] = useState<TrendStats | null>(null)
    const [loading, setLoading] = useState(false)

    // Books are never ranked; skip fetch entirely
    const isBook = mediaType === 'BOOK'

    useEffect(() => {
        if (!mediaId || isBook) return
        setLoading(true)
        fetch(`/api/trending/${mediaId}`)
            .then((r) => r.json())
            .then((data) => {
                setStats(data.stats ?? null)
            })
            .catch(() => setStats(null))
            .finally(() => setLoading(false))
    }, [mediaId, isBook])

    if (isBook || loading || !stats || stats.weeklyRank == null) return null

    const rank = stats.weeklyRank
    const delta = stats.rankDelta // positive = improved (rose in ranking)

    // Tier-based glow color
    const tierColor =
        rank <= 3
            ? 'border-[#ffd700]/40 bg-[#ffd700]/5 text-[#ffd700]'
            : rank <= 7
            ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan'
            : 'border-accent-purple/40 bg-accent-purple/5 text-accent-purple'

    const deltaColor = delta != null && delta > 0 ? 'text-[#00ff9d]' : delta != null && delta < 0 ? 'text-red-400' : 'text-text-muted'
    const deltaIcon = delta != null && delta > 0 ? <TrendingUp size={10} /> : delta != null && delta < 0 ? <TrendingDown size={10} /> : null
    const deltaLabel =
        delta == null ? null
        : delta === 0 ? 'Same as last week'
        : delta > 0 ? `+${delta} this week`
        : `${delta} this week`

    return (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {/* Main rank badge */}
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm ${tierColor}`}
                title={`Trending #${rank} this week`}
            >
                <Flame size={10} />
                {rank <= 3 ? `🔥 ` : ''}Trending #{rank}
            </span>

            {/* Delta badge */}
            {delta != null && deltaLabel && (
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-border/30 bg-bg-secondary/50 ${deltaColor}`}
                    title={deltaLabel}
                >
                    {deltaIcon}
                    {deltaLabel}
                </span>
            )}

            {/* Weeks in Top 10 badge */}
            {stats.weeksInTop10 >= 2 && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-[#ffd700]/20 bg-[#ffd700]/5 text-[#ffd700]"
                    title={`In Top 10 for ${stats.weeksInTop10} consecutive weeks`}
                >
                    <Trophy size={10} />
                    Top 10 for {stats.weeksInTop10} {stats.weeksInTop10 === 1 ? 'week' : 'weeks'}
                </span>
            )}

            {/* RAWG fallback for games with no internal score */}
            {stats.useRawgFallback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-border/30 bg-bg-secondary/50 text-text-muted">
                    📊 RAWG popularity data
                </span>
            )}
        </div>
    )
}
