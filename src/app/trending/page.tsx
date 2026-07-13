'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { Flame, TrendingUp, TrendingDown, Trophy, Minus, Film, Tv, Sparkles, Gamepad2, Loader2, Star, Info } from 'lucide-react'

type Tab = 'movie' | 'tv' | 'anime' | 'game'

interface TrendingItem {
    mediaId: string
    weeklyRank: number
    lastWeekRank: number | null
    weeksInTop10: number
    trendScore: number
    rankDelta: number | null
    useRawgFallback: boolean
    media: {
        id: string
        title: string
        type: string
        posterUrl: string | null
        backdropUrl: string | null
        releaseYear: number | null
        externalId: string | null
        source: string
    }
}

const TABS: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'movie',  label: 'Movies',   icon: <Film size={15} />,      color: 'text-[#00d4ff] border-[#00d4ff]/50 bg-[#00d4ff]/10' },
    { key: 'tv',     label: 'TV Shows', icon: <Tv size={15} />,        color: 'text-accent-purple border-accent-purple/50 bg-accent-purple/10' },
    { key: 'anime',  label: 'Anime',    icon: <Sparkles size={15} />,  color: 'text-[#ff6b9d] border-[#ff6b9d]/50 bg-[#ff6b9d]/10' },
    { key: 'game',   label: 'Games',    icon: <Gamepad2 size={15} />,  color: 'text-[#00ff9d] border-[#00ff9d]/50 bg-[#00ff9d]/10' },
]

function rankColor(rank: number) {
    if (rank === 1) return 'text-[#ffd700]'
    if (rank === 2) return 'text-[#c0c0c0]'
    if (rank === 3) return 'text-[#cd7f32]'
    if (rank <= 7)  return 'text-accent-cyan'
    return 'text-text-muted'
}

function rankBg(rank: number) {
    if (rank <= 3)  return 'border-[#ffd700]/30 bg-[#ffd700]/5'
    if (rank <= 7)  return 'border-accent-cyan/20 bg-accent-cyan/5'
    return 'border-border/30 bg-bg-secondary/30'
}

function DeltaBadge({ delta }: { delta: number | null }) {
    if (delta == null) return (
        <span className="inline-flex items-center gap-1 text-[10px] text-text-muted px-2 py-0.5 rounded-full border border-border/30 bg-bg-secondary/50">
            <Minus size={10} /> New
        </span>
    )
    if (delta > 0) return (
        <span className="inline-flex items-center gap-1 text-[10px] text-[#00ff9d] font-bold px-2 py-0.5 rounded-full border border-[#00ff9d]/30 bg-[#00ff9d]/10">
            <TrendingUp size={10} /> +{delta}
        </span>
    )
    if (delta < 0) return (
        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-400/30 bg-red-400/10">
            <TrendingDown size={10} /> {delta}
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 text-[10px] text-text-muted px-2 py-0.5 rounded-full border border-border/30 bg-bg-secondary/50">
            <Minus size={10} /> —
        </span>
    )
}

function mediaHref(item: TrendingItem, tab: Tab) {
    if (!item.media.externalId) return '#'
    if (tab === 'game') return `/games/${item.media.externalId}`
    const tmdbType = tab === 'tv' || tab === 'anime' ? 'tv' : 'movie'
    return `/media/${item.media.externalId}?type=${tmdbType}`
}

export default function TrendingPage() {
    const [activeTab, setActiveTab] = useState<Tab>('movie')
    const [data, setData] = useState<Record<Tab, TrendingItem[] | null>>({
        movie: null, tv: null, anime: null, game: null
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (data[activeTab] !== null) return
        setLoading(true)
        fetch(`/api/trending?type=${activeTab}&limit=10`)
            .then(r => r.json())
            .then(res => {
                setData(prev => ({ ...prev, [activeTab]: res.items || [] }))
            })
            .catch(() => setData(prev => ({ ...prev, [activeTab]: [] })))
            .finally(() => setLoading(false))
    }, [activeTab])

    const items = data[activeTab]
    const activeTabMeta = TABS.find(t => t.key === activeTab)!

    return (
        <div className="min-h-screen cyber-bg">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/5 text-[#ffd700] text-sm font-bold mb-4">
                        <Flame size={16} /> Weekly Rankings
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-extrabold text-text-primary mb-3 tracking-tight">
                        Top 10
                    </h1>
                    <p className="text-text-secondary max-w-xl mx-auto">
                        The most tracked, quoted, discussed, and favorited content this week — updated weekly.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                                activeTab === tab.key
                                    ? tab.color
                                    : 'text-text-secondary border-border/50 hover:border-text-muted hover:text-text-primary'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-2">
                    {loading && (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 size={32} className="animate-spin text-accent-cyan" />
                        </div>
                    )}

                    {!loading && items && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-2xl border border-border p-10">
                            <div className="w-16 h-16 rounded-2xl bg-bg-hover border border-border flex items-center justify-center mb-4">
                                <Info size={28} className="text-text-muted" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">No rankings yet</h3>
                            <p className="text-text-secondary text-sm max-w-sm">
                                Rankings are calculated weekly. Add media to your library to start building the charts.
                            </p>
                            <p className="text-text-muted text-xs mt-3">
                                Admin: POST to <code className="bg-bg-secondary px-1.5 py-0.5 rounded text-accent-cyan">/api/admin/trending/recalculate</code> to trigger now.
                            </p>
                        </div>
                    )}

                    {!loading && items && items.map((item) => {
                        const href = mediaHref(item, activeTab)
                        return (
                            <Link
                                key={item.mediaId}
                                href={href}
                                className={`group flex items-center gap-5 p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-card ${rankBg(item.weeklyRank)}`}
                            >
                                {/* Rank number */}
                                <div className={`w-10 flex-shrink-0 text-center font-display font-black text-2xl leading-none ${rankColor(item.weeklyRank)}`}>
                                    {item.weeklyRank <= 3 ? (
                                        <span className="drop-shadow-[0_0_8px_currentColor]">
                                            {item.weeklyRank === 1 ? '🥇' : item.weeklyRank === 2 ? '🥈' : '🥉'}
                                        </span>
                                    ) : (
                                        <span>{item.weeklyRank}</span>
                                    )}
                                </div>

                                {/* Poster */}
                                <div className="w-12 h-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-bg-secondary border border-border shadow-sm relative">
                                    {item.media.posterUrl ? (
                                        <Image
                                            src={item.media.posterUrl}
                                            alt={item.media.title}
                                            fill
                                            sizes="48px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Film size={16} className="text-text-muted" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-text-primary truncate group-hover:text-accent-cyan transition-colors">
                                        {item.media.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {item.media.releaseYear && (
                                            <span className="text-xs text-text-muted">{item.media.releaseYear}</span>
                                        )}
                                        {item.trendScore > 0 && (
                                            <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                                                <Star size={9} className="inline" /> Score: {Math.round(item.trendScore * 10) / 10}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Badges – right side */}
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <DeltaBadge delta={item.rankDelta} />
                                    {item.weeksInTop10 >= 2 && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-[#ffd700] font-semibold px-2 py-0.5 rounded-full border border-[#ffd700]/20 bg-[#ffd700]/5">
                                            <Trophy size={9} /> {item.weeksInTop10}w in Top 10
                                        </span>
                                    )}
                                    {item.useRawgFallback && (
                                        <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-full border border-border/30 bg-bg-secondary/50">
                                            📊 RAWG
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
