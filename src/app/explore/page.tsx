import { prisma } from '@/lib/prisma'
import { PosterCard } from '@/components/PosterCard'
import { Navbar } from '@/components/Navbar'
import { ExploreGameCard } from '@/components/ExploreGameCard'
import { RecommendationsCarousel } from '@/components/RecommendationsCarousel'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ListCard } from '@/components/ListCard'
import { ExploreCarousel } from '@/components/ExploreCarousel'
import { Sparkles, Star, TrendingUp, Clock, Layers, LayoutGrid, Zap, Tv, Film, Gamepad2, BookOpen, Heart } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

const RAWG_API_KEY = process.env.RAWG_API_KEY
const RAWG_BASE = 'https://api.rawg.io/api'

const getTabs = (t: any) => [
    { id: 'ALL', label: t('all'), icon: <LayoutGrid size={16} /> },
    { id: 'ANIME', label: t('anime'), icon: <Tv size={16} /> },
    { id: 'MOVIE', label: t('movies'), icon: <Film size={16} /> },
    { id: 'TVSHOW', label: t('tv_shows'), icon: <Tv size={16} /> },
    { id: 'GAME', label: t('games'), icon: <Gamepad2 size={16} /> },
    { id: 'BOOK', label: t('books'), icon: <BookOpen size={16} /> },
]

const getSorts = (t: any) => [
    { id: 'trending', label: t('trending'), icon: <TrendingUp size={14} /> },
    { id: 'newest', label: t('newest'), icon: <Clock size={14} /> },
    { id: 'top', label: t('top_rated'), icon: <Star size={14} /> },
]

const RAWG_SORT_MAP: Record<string, string> = {
    trending: '-added',
    newest: '-released',
    top: '-metacritic',
}

async function fetchRawgGames(sort: string) {
    if (!RAWG_API_KEY) return []
    try {
        const ordering = RAWG_SORT_MAP[sort] || '-added'
        const res = await fetch(
            `${RAWG_BASE}/games?key=${RAWG_API_KEY}&page_size=40&ordering=${ordering}`,
            { next: { revalidate: 600 } }
        )
        if (!res.ok) return []
        const data = await res.json()
        return (data.results || []).map((g: any) => ({
            id: String(g.id),
            title: g.name,
            type: 'GAME',
            status: null,
            posterUrl: g.background_image || null,
            releaseYear: g.released ? parseInt(g.released.split('-')[0]) : null,
            tmdbId: null,
            rawgSlug: g.slug,
            metacritic: g.metacritic || null,
            rating: g.rating || null,
        }))
    } catch {
        return []
    }
}

export default async function ExplorePage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const type = typeof searchParams.type === 'string' ? searchParams.type : 'ALL'
    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'trending'
    const session = await getServerSession(authOptions)
    const t = await getTranslations('Explore')

    // Games tab: use RAWG instead of local DB
    if (type === 'GAME') {
        const games = await fetchRawgGames(sort)

        if (session?.user?.id && games.length > 0) {
            const rawgIds = games.map((g: any) => g.id)
            const userGames = await prisma.mediaItem.findMany({
                where: { userId: session.user.id, rawgId: { in: rawgIds } },
                select: { rawgId: true, status: true }
            })
            const statusMap = Object.fromEntries(userGames.map(ui => [ui.rawgId, ui.status]))
            games.forEach((g: any) => g.status = statusMap[g.id] || null)
        }

        return (
            <div className="min-h-screen cyber-bg pb-20">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 pt-10">
                    <ExploreHeader type={type} sort={sort} />
                    {games.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {games.map((game: any) => (
                                <ExploreGameCard
                                    key={game.id}
                                    id={game.id}
                                    slug={game.rawgSlug}
                                    title={game.title}
                                    posterUrl={game.posterUrl}
                                    releaseYear={game.releaseYear}
                                    metacritic={game.metacritic}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            title={t('no_games')} 
                            description={t('no_games_desc')}
                            icon={Gamepad2}
                        />
                    )}
                </main>
            </div>
        )
    }

    // All other types: use local DB (existing logic)
    let items: any[] = []

    if (sort === 'trending') {
        const whereClause: any = { tmdbId: { not: null } }
        if (type !== 'ALL') whereClause.type = type

        const trendingGroups = await prisma.mediaItem.groupBy({
            by: ['tmdbId'],
            _count: { tmdbId: true },
            orderBy: { _count: { tmdbId: 'desc' } },
            where: whereClause,
            take: 48,
        })
        const trendingIds = trendingGroups.map(g => g.tmdbId).filter(Boolean) as string[]
        if (trendingIds.length > 0) {
            const raw = await prisma.mediaItem.findMany({ where: { tmdbId: { in: trendingIds } } })
            for (const id of trendingIds) {
                const item = raw.find(r => r.tmdbId === id)
                if (item) items.push(item)
            }
        }
    } else if (sort === 'newest') {
        const whereClause: any = { tmdbId: { not: null } }
        if (type !== 'ALL') whereClause.type = type
        const raw = await prisma.mediaItem.findMany({ take: 100, where: whereClause, orderBy: { createdAt: 'desc' } })
        const seen = new Set()
        for (const item of raw) {
            if (!seen.has(item.tmdbId)) { seen.add(item.tmdbId); items.push(item); if (items.length === 48) break }
        }
    } else if (sort === 'top') {
        const whereClause: any = { tmdbId: { not: null }, tmdbRating: { not: null } }
        if (type !== 'ALL') whereClause.type = type
        const raw = await prisma.mediaItem.findMany({ take: 100, where: whereClause, orderBy: { tmdbRating: 'desc' } })
        const seen = new Set()
        for (const item of raw) {
            if (!seen.has(item.tmdbId)) { seen.add(item.tmdbId); items.push(item); if (items.length === 48) break }
        }
    }

    let safeItems = items
    if (session?.user?.id && items.length > 0) {
        const tmdbIds = items.map(i => i.tmdbId).filter(Boolean) as string[]
        const userDocs = await prisma.mediaItem.findMany({
            where: { userId: session.user.id, tmdbId: { in: tmdbIds } },
            select: { tmdbId: true, status: true }
        })
        const statusMap = Object.fromEntries(userDocs.map(ui => [ui.tmdbId, ui.status]))
        safeItems = items.map(item => ({
            ...item,
            status: statusMap[item.tmdbId] || null
        }))
    } else {
        safeItems = items.map(item => ({ ...item, status: null }))
    }

    return (
        <div className="min-h-screen cyber-bg pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-10">
                <ExploreHeader type={type} sort={sort} />

                {type === 'ALL' && sort === 'trending' ? (
                    <div className="space-y-4">
                        <ExploreCarousel
                            title={t('trending_today')}
                            icon={<TrendingUp size={20} className="text-accent-pink" />}
                            endpoint="/api/tmdb/trending?type=all&timeWindow=day"
                            description={t('trending_today_desc')}
                        />

                        <ExploreCarousel
                            title={t('new_releases')}
                            icon={<Zap size={20} className="text-accent-cyan" />}
                            endpoint="/api/tmdb/discover?sort=primary_release_date.desc&minVotes=10"
                            description={t('new_releases_desc')}
                        />

                        {/* Local DB Driven Sections */}
                        {await (async () => {
                            const promiseQuoted = prisma.quote.groupBy({
                                by: ['mediaId'],
                                _count: { id: true },
                                orderBy: { _count: { id: 'desc' } },
                                take: 15
                            }).then(async (groups: any[]) => {
                                const ids = groups.map(g => g.mediaId).filter(Boolean)
                                const items = await prisma.mediaItem.findMany({ where: { id: { in: ids } } })
                                const orderedItems = ids.map(id => items.find(i => i.id === id)).filter(Boolean) as any[]
                                const seen = new Set()
                                return orderedItems.filter(i => {
                                    if (!i?.tmdbId || seen.has(i.tmdbId)) return false
                                    seen.add(i.tmdbId)
                                    return true
                                }).map(i => ({
                                    id: i.tmdbId!,
                                    title: i.title,
                                    type: i.type,
                                    posterUrl: i.posterUrl,
                                    releaseYear: i.releaseYear,
                                    tmdbRating: i.tmdbRating
                                })).slice(0, 10)
                            })

                            const promiseFavorites = (prisma as any).mediaItem.groupBy({
                                by: ['tmdbId'],
                                _count: { tmdbId: true },
                                orderBy: { _count: { tmdbId: 'desc' } },
                                where: { tmdbId: { not: null } },
                                take: 15
                            }).then(async (groups: any[]) => {
                                const ids = groups.map(g => g.tmdbId).filter(Boolean)
                                const items = await prisma.mediaItem.findMany({ where: { tmdbId: { in: ids }, tmdbRating: { gte: 7 } } })
                                const seen = new Set()
                                return items.filter(i => {
                                    if (seen.has(i.tmdbId)) return false
                                    seen.add(i.tmdbId)
                                    return true
                                }).map(i => ({
                                    id: i.tmdbId!,
                                    title: i.title,
                                    type: i.type,
                                    posterUrl: i.posterUrl,
                                    releaseYear: i.releaseYear,
                                    tmdbRating: i.tmdbRating
                                })).slice(0, 10)
                            })

                            return (
                                <>
                                    <ExploreCarousel
                                        title={t('community_favorites')}
                                        icon={<Heart size={20} className="text-accent-pink" />}
                                        // @ts-ignore
                                        items={await promiseFavorites}
                                        description={t('community_favorites_desc')}
                                    />
                                    <ExploreCarousel
                                        title={t('most_quoted')}
                                        icon={<Sparkles size={20} className="text-yellow-400" />}
                                        // @ts-ignore
                                        items={await promiseQuoted}
                                        description={t('most_quoted_desc')}
                                    />
                                </>
                            )
                        })()}

                        <div className="mb-16">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center">
                                        <Layers size={20} className="text-accent-purple" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-text-primary">{t('community_loops')}</h2>
                                </div>
                                <Link href="/lists" className="text-sm font-bold text-accent-cyan hover:underline">{t('explore_all')} &rarr;</Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {(await (prisma as any).list.findMany({
                                    where: { isPublic: true },
                                    take: 4,
                                    orderBy: { likes: { _count: 'desc' } },
                                    include: {
                                        user: { select: { name: true, image: true, username: true } },
                                        items: { take: 4, orderBy: { order: 'asc' } },
                                        _count: { select: { items: true, likes: true } },
                                        likes: true
                                    }
                                })).map((list: any) => (
                                    <ListCard key={list.id} list={list} currentUserId={session?.user?.id || ''} />
                                ))}
                            </div>
                        </div>

                        <RecommendationsCarousel />

                        <div className="pt-10">
                            <h2 className="text-2xl font-display font-bold text-text-primary mb-8 flex items-center gap-3">
                                <LayoutGrid size={24} className="text-text-muted" /> {t('global_grid')}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                {safeItems.map(item => (
                                    <PosterCard key={item.id} item={item} href={`/media/${item.id}?type=${item.type}`} hideStatus showContextMenu />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <RecommendationsCarousel />
                        {safeItems.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                {safeItems.map(item => (
                                    <PosterCard key={item.id} item={item} href={`/media/${item.id}?type=${item.type}`} hideStatus showContextMenu />
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                title={t('no_results')} 
                                description={t('no_results_desc')}
                                icon={LayoutGrid}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

async function ExploreHeader({ type, sort }: { type: string, sort: string }) {
    const t = await getTranslations('Explore')
    return (
        <>
            <div className="mb-10">
                <h1 className="text-4xl font-display font-bold text-text-primary mb-3">{t('title')}</h1>
                <p className="text-text-secondary">{t('description')}</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {getTabs(t).map(tab => {
                        const isActive = type === tab.id
                        return (
                            <Link key={tab.id} href={`/explore?type=${tab.id}&sort=${sort}`}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                    ${isActive ? 'bg-accent-cyan text-black shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'bg-bg-card text-text-secondary border border-border hover:border-border-bright hover:text-text-primary'}`}>
                                {tab.icon}{tab.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="flex items-center gap-2 bg-bg-card p-1.5 rounded-xl border border-border shrink-0">
                    {getSorts(t).map(s => {
                        const isActive = sort === s.id
                        return (
                            <Link key={s.id} href={`/explore?type=${type}&sort=${s.id}`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${isActive ? 'bg-bg-hover text-text-primary border border-border-bright' : 'text-text-secondary border border-transparent hover:text-text-primary'}`}>
                                {s.icon}{s.label}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

