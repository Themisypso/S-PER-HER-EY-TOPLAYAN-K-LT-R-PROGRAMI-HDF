'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Film, Tv, Sparkles, Gamepad2, BookOpen, Home, Users, ActivitySquare, Quote, Layers, BarChart } from 'lucide-react'
import { ActivityFeed } from '@/components/ActivityFeed'
import { QuoteCard } from '@/components/QuoteCard'
import { ListCard } from '@/components/ListCard'
import { MediaDetailModal } from '@/components/MediaDetailModal'
import { motion, AnimatePresence } from 'framer-motion'

interface MediaItem {
    id: string
    title: string
    type: string
    status: string
    posterUrl: string | null
    releaseYear: number | null
    tmdbId: string | null
    rawgId?: string | null
    bookId?: string | null
    steamAppId?: string | null
    totalTimeMinutes?: number | null
    userRating?: number | null
    notes?: string | null
    playtimeHours?: number | null
    runtime?: number | null
    episodeCount?: number | null
    episodeDuration?: number | null
    progress?: number | null
    pageCount?: number | null
    genres?: string[]
    overview?: string | null
    mediaId?: string | null
    createdAt?: Date | string
}

interface FavoriteMedia {
    id: string; title: string; type: string; posterUrl: string | null; tmdbId: string
}

interface FavoritePerson {
    id: string; name: string; profileUrl: string | null; knownForDepartment: string | null; tmdbPersonId: number
}

interface Props {
    userId: string
    currentUserId?: string
    mediaItems: MediaItem[]
    favoriteMedia: FavoriteMedia[]
    favoritePeople: FavoritePerson[]
    quotes?: any[]
    lists?: any[]
}

const TABS = [
    { key: 'activity', label: 'Activity', icon: ActivitySquare, color: '#00d4ff' },
    { key: 'home', label: 'Overview', icon: Home, color: '#e8edf5' },
    { key: 'lists', label: 'Lists', icon: Layers, color: '#00d4ff' },
    { key: 'favorites', label: 'Favorites', icon: Heart, color: '#ff3264' },
    { key: 'quotes', label: 'Quotes', icon: Quote, color: '#facc15' },
    { key: 'stats', label: 'Stats', icon: BarChart, color: '#a78bfa' },
    { key: 'MOVIE', label: 'Movies', icon: Film, color: '#00d4ff' },
    { key: 'TVSHOW', label: 'TV Shows', icon: Tv, color: '#a78bfa' },
    { key: 'ANIME', label: 'Anime', icon: Sparkles, color: '#ff9500' },
    { key: 'GAME', label: 'Games', icon: Gamepad2, color: '#00ff9d' },
    { key: 'BOOK', label: 'Books', icon: BookOpen, color: '#ff6b9d' },
] as const

type TabKey = typeof TABS[number]['key']

const STATUS_GROUPS = [
    { key: 'WATCHING', label: 'In Progress' },
    { key: 'PLANNED', label: 'Plan to Watch' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'DROPPED', label: 'Dropped' },
]

/** Maps a tracked MediaItem to its correct detail page URL */
function mediaHref(item: MediaItem): string {
    if (item.type === 'GAME') {
        if (item.rawgId) return `/games/${item.rawgId}`
        if (item.steamAppId) return `https://store.steampowered.com/app/${item.steamAppId}`
        return '/games'
    }
    if (item.type === 'BOOK') {
        if (item.bookId) return `/books/${item.bookId}`
        return '/books'
    }
    if (item.tmdbId) {
        const tmdbType = item.type === 'MOVIE' ? 'movie' : 'tv'
        return `/media/${item.tmdbId}?type=${tmdbType}`
    }
    return '/library'
}

/** Maps a FavoriteMedia DB row to its correct detail page URL */
function favMediaHref(media: FavoriteMedia): string {
    if (media.type === 'GAME') return `/games/${media.tmdbId}`
    if (media.type === 'BOOK') return `/books/${media.tmdbId}`
    const tmdbType = media.type === 'MOVIE' ? 'movie' : 'tv'
    return `/media/${media.tmdbId}?type=${tmdbType}`
}

function PosterGrid({ items, color, onClick }: { items: MediaItem[], color: string, onClick?: (item: MediaItem) => void }) {
    if (items.length === 0) return null
    return (
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x">
            {items.map(item => {
                const isClickable = !!onClick
                const CardWrapper = isClickable ? 'button' : Link
                const props = isClickable ? { onClick: () => onClick(item) } : { href: mediaHref(item) }
                
                return (
                <CardWrapper key={item.id} {...props as any} className="flex-shrink-0 w-28 group snap-start text-left">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-bg-secondary border border-border group-hover:border-current transition-colors mb-1.5 relative"
                        style={{ '--tw-border-opacity': 1 } as any}>
                        {item.posterUrl ? (
                            <Image 
                                src={item.posterUrl} 
                                alt={item.title} 
                                fill
                                sizes="112px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-muted text-xs text-center p-2">{item.title}</div>
                        )}
                    </div>
                    <p className="text-xs font-medium text-text-primary truncate group-hover:text-accent-cyan transition-colors">{item.title}</p>
                    {item.releaseYear && <p className="text-[10px] text-text-muted">{item.releaseYear}</p>}
                    {item.type === 'GAME' && item.totalTimeMinutes && (
                        <p className="text-[10px] text-[#00ff9d]">{(item.totalTimeMinutes / 60).toFixed(1)} hrs</p>
                    )}
                </CardWrapper>
                )
            })}
        </div>
    )
}

function GameGrid({ items, color, onClick }: { items: MediaItem[], color: string, onClick?: (item: MediaItem) => void }) {
    if (items.length === 0) return null
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {items.map(item => {
                const isClickable = !!onClick
                const CardWrapper = isClickable ? 'button' : Link
                const props = isClickable ? { onClick: () => onClick(item) } : { href: mediaHref(item) }
                
                return (
                <CardWrapper key={item.id} {...props as any} className="group text-left">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-bg-secondary border border-border group-hover:border-current transition-colors mb-2 relative"
                        style={{ '--tw-border-opacity': 1 } as any}>
                        {item.posterUrl ? (
                            <Image 
                                src={item.posterUrl} 
                                alt={item.title} 
                                fill
                                sizes="(max-width: 768px) 33vw, 20vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-muted text-xs text-center p-2">{item.title}</div>
                        )}
                    </div>
                    <p className="text-xs font-medium text-text-primary truncate group-hover:text-accent-cyan transition-colors">{item.title}</p>
                    <div className="flex justify-between items-center mt-1">
                        {item.releaseYear ? <span className="text-[10px] text-text-muted">{item.releaseYear}</span> : <span />}
                        {item.totalTimeMinutes ? (
                            <span className="text-[10px] text-[#00ff9d] font-bold">{(item.totalTimeMinutes / 60).toFixed(1)}h</span>
                        ) : null}
                    </div>
                </CardWrapper>
                )
            })}
        </div>
    )
}

export function ProfileTabs({ userId, currentUserId, mediaItems, favoriteMedia, favoritePeople, quotes = [], lists = [] }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('activity')
    const [gameSort, setGameSort] = useState<'playtime' | 'recent' | 'year_asc' | 'year_desc'>('playtime')
    
    // We use a local state so that when the user edits a media item in the modal, it updates immediately
    const [localMediaItems, setLocalMediaItems] = useState(mediaItems)
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)

    // Sync with props if they change
    useEffect(() => { setLocalMediaItems(mediaItems) }, [mediaItems])

    const currentTab = TABS.find(t => t.key === activeTab)!
    const handleItemClick = setSelectedItem

    return (
        <div className="mt-8">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2 no-scrollbar border-b border-border">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    const isMediaType = ['MOVIE', 'TVSHOW', 'ANIME', 'GAME', 'BOOK'].includes(tab.key)
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px"
                            style={isActive
                                ? { color: tab.color, borderBottomColor: tab.color }
                                : { color: '#6b7a8d', borderBottomColor: 'transparent' }}
                        >
                            <Icon size={14} />
                            {tab.label}
                            {isMediaType && (
                                <span className="text-[9px] px-1 py-0.5 rounded ml-0.5"
                                    style={{ background: isActive ? `${tab.color}22` : 'rgba(255,255,255,0.05)', color: isActive ? tab.color : '#4a5568' }}>
                                    {localMediaItems.filter(i => i.type === tab.key).length}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <div className="max-w-3xl mx-auto">
                            <ActivityFeed filter="user" targetUserId={userId} />
                        </div>
                    )}

                    {/* Home Tab */}
                    {activeTab === 'home' && (
                        <div className="space-y-10">
                            {/* Activity Pulse Section */}
                            <section className="bg-gradient-to-br from-bg-card/40 to-bg-card/10 border border-border/50 rounded-3xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <ActivitySquare size={80} className="text-accent-cyan" />
                                </div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <ActivitySquare size={18} className="text-accent-cyan" /> Activity Pulse
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('activity')}
                                        className="text-xs font-bold text-accent-cyan hover:underline"
                                    >
                                        View Full Feed
                                    </button>
                                </div>
                                <div className="relative z-10">
                                    <ActivityFeed filter="user" targetUserId={userId} take={3} hideHeader />
                                </div>
                            </section>

                            {/* Recently Completed (excluding games) */}
                            {(() => {
                                const completed = localMediaItems.filter(i => i.status === 'COMPLETED' && i.type !== 'GAME').slice(0, 20)
                                if (completed.length === 0) return null
                                return (
                                    <section>
                                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                            <span style={{ color: '#00d4ff' }}>✅</span> Recently Completed
                                        </h3>
                                        <PosterGrid items={completed} color="#00d4ff" onClick={handleItemClick} />
                                    </section>
                                )
                            })()}

                            {/* Watching / In Progress (excluding games) */}
                            {(() => {
                                const watching = localMediaItems.filter(i => i.status === 'WATCHING' && i.type !== 'GAME').slice(0, 20)
                                if (watching.length === 0) return null
                                return (
                                    <section>
                                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                            <span style={{ color: '#a78bfa' }}>▶</span> Continue Watching
                                        </h3>
                                        <PosterGrid items={watching} color="#a78bfa" onClick={handleItemClick} />
                                    </section>
                                )
                            })()}

                            {/* Top Played Games */}
                            {(() => {
                                const topGames = [...localMediaItems]
                                    .filter(i => i.type === 'GAME')
                                    .sort((a, b) => (b.totalTimeMinutes || 0) - (a.totalTimeMinutes || 0))
                                    .slice(0, 20)
                                if (topGames.length === 0) return null
                                return (
                                    <section>
                                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                            <span style={{ color: '#00ff9d' }}>🎮</span> Most Played Games
                                        </h3>
                                        <PosterGrid items={topGames} color="#00ff9d" onClick={handleItemClick} />
                                    </section>
                                )
                            })()}

                            {localMediaItems.length === 0 && favoriteMedia.length === 0 && favoritePeople.length === 0 && (
                                <div className="text-center py-20 text-text-muted">
                                    <p>No activity yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lists Tab */}
                    {activeTab === 'lists' && (
                        <div className="space-y-8">
                            {lists && lists.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lists.map(list => (
                                        <ListCard key={list.id} list={list} currentUserId={currentUserId || ''} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-text-muted bg-bg-card/20 border border-dashed border-border rounded-3xl">
                                    <Layers className="mx-auto mb-4 opacity-20" size={48} />
                                    <p>No public lists created yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Favorites Tab */}
                    {activeTab === 'favorites' && (
                        <div className="space-y-10">
                            {favoriteMedia.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                                        <Heart size={16} className="text-[#ff3264]" /> Favorite Media
                                    </h3>
                                    <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x">
                                        {favoriteMedia.map(media => (
                                            <Link key={media.id} href={favMediaHref(media)} className="flex-shrink-0 w-28 group snap-start">
                                                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-bg-secondary border border-border group-hover:border-[#ff3264] transition-colors mb-1.5 relative">
                                                    {media.posterUrl
                                                        ? <Image 
                                                            src={media.posterUrl} 
                                                            alt={media.title} 
                                                            fill
                                                            sizes="112px"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                                          />
                                                        : <div className="flex items-center justify-center h-full text-text-muted text-xs text-center p-2">{media.title}</div>}
                                                </div>
                                                <p className="text-xs font-medium text-text-primary truncate group-hover:text-[#ff3264] transition-colors">{media.title}</p>
                                                <p className="text-[10px] text-text-muted capitalize">{media.type.toLowerCase()}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {favoritePeople.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                                        <Users size={16} className="text-accent-purple" /> Favorite People
                                    </h3>
                                    <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x">
                                        {favoritePeople.map(person => (
                                            <Link key={person.id} href={`/person/${person.tmdbPersonId}`} className="flex-shrink-0 w-28 group snap-start">
                                                <div className="aspect-square rounded-full overflow-hidden bg-bg-secondary border-2 border-border group-hover:border-accent-purple transition-colors mb-2 mx-auto w-20 h-20 relative">
                                                    {person.profileUrl
                                                        ? <Image 
                                                            src={person.profileUrl} 
                                                            alt={person.name} 
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover object-top" 
                                                          />
                                                        : <div className="flex items-center justify-center h-full font-bold text-xl text-text-muted">{person.name[0]}</div>}
                                                </div>
                                                <p className="text-xs font-medium text-text-primary truncate text-center group-hover:text-accent-purple transition-colors">{person.name}</p>
                                                <p className="text-[10px] text-text-muted text-center">{person.knownForDepartment || 'Actor'}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {favoriteMedia.length === 0 && favoritePeople.length === 0 && (
                                <div className="text-center py-20 text-text-muted bg-bg-card/20 border border-dashed border-border rounded-3xl">
                                    <Heart className="mx-auto mb-4 opacity-20" size={48} />
                                    <p>No favorites added yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quotes Tab */}
                    {activeTab === 'quotes' && (
                        <div className="space-y-6">
                            {quotes && quotes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {quotes.map(quote => (
                                        <QuoteCard key={quote.id} quote={quote} currentUserId={currentUserId || ''} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-text-muted bg-bg-card/20 border border-dashed border-border rounded-3xl">
                                    <Quote className="mx-auto mb-4 opacity-20" size={48} />
                                    <p>No quotes saved yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-display font-bold text-white mb-6">Library Statistics</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass-card p-6 rounded-2xl border border-border text-center bg-bg-card/40">
                                    <div className="text-3xl font-black text-white mb-1">{localMediaItems.length}</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Tracked</div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl border border-border text-center bg-bg-card/40">
                                    <div className="text-3xl font-black text-[#00ff9d] mb-1">{localMediaItems.filter(m => m.status === 'COMPLETED').length}</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Completed</div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl border border-border text-center bg-bg-card/40">
                                    <div className="text-3xl font-black text-accent-cyan mb-1">{localMediaItems.filter(m => m.status === 'WATCHING').length}</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">In Progress</div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl border border-border text-center bg-bg-card/40">
                                    <div className="text-3xl font-black text-accent-pink mb-1">{favoriteMedia.length + favoritePeople.length}</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Favorites</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Media Type Tabs (excluding GAME) */}
                    {['MOVIE', 'TVSHOW', 'ANIME', 'BOOK'].includes(activeTab) && (
                        <div className="space-y-10">
                            {STATUS_GROUPS.map(({ key: statusKey, label }) => {
                                const items = localMediaItems.filter(i => i.type === activeTab && i.status === statusKey)
                                if (items.length === 0) return null
                                return (
                                    <section key={statusKey}>
                                        <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: currentTab.color }}>
                                            {label}
                                            <span className="text-xs text-text-muted font-normal">({items.length})</span>
                                        </h3>
                                        <PosterGrid items={items} color={currentTab.color} onClick={handleItemClick} />
                                    </section>
                                )
                            })}

                            {localMediaItems.filter(i => i.type === activeTab).length === 0 && (
                                <div className="text-center py-20 text-text-muted">
                                    <p className="text-sm">No {currentTab.label.toLowerCase()} tracked yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* GAME Tab specifically */}
                    {activeTab === 'GAME' && (
                        <div className="space-y-6">
                            {localMediaItems.filter(i => i.type === 'GAME').length > 0 ? (
                                <>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Gamepad2 className="text-[#00ff9d]" /> 
                                            Game Library 
                                            <span className="text-xs text-text-muted font-normal">({localMediaItems.filter(i => i.type === 'GAME').length})</span>
                                        </h3>
                                        <select 
                                            value={gameSort} 
                                            onChange={(e) => setGameSort(e.target.value as any)}
                                            className="input-cyber py-2 px-4 text-sm w-full sm:w-auto"
                                        >
                                            <option value="playtime">Most Played (Hours)</option>
                                            <option value="recent">Recently Added</option>
                                            <option value="year_desc">Release Year (Newest)</option>
                                            <option value="year_asc">Release Year (Oldest)</option>
                                        </select>
                                    </div>
                                    
                                    {(() => {
                                        const games = [...localMediaItems].filter(i => i.type === 'GAME')
                                        games.sort((a, b) => {
                                            if (gameSort === 'playtime') return (b.totalTimeMinutes || 0) - (a.totalTimeMinutes || 0)
                                            // Fallback to internal IDs for recent if dates aren't easily parsed, 
                                            // but generally newest in DB is "id" string comparison or assume recently added has higher ID
                                            if (gameSort === 'recent') {
                                                if (a.createdAt && b.createdAt) {
                                                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                                }
                                                return b.id.localeCompare(a.id)
                                            }
                                            if (gameSort === 'year_desc') return (b.releaseYear || 0) - (a.releaseYear || 0)
                                            if (gameSort === 'year_asc') {
                                                if (!a.releaseYear) return 1
                                                if (!b.releaseYear) return -1
                                                return a.releaseYear - b.releaseYear
                                            }
                                            return 0
                                        })
                                        
                                        return <GameGrid items={games} color="#00ff9d" onClick={handleItemClick} />
                                    })()}
                                </>
                            ) : (
                                <div className="text-center py-20 text-text-muted">
                                    <p className="text-sm">No games tracked yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Media Detail Modal Overlay (For Profile Owner or Viewer) */}
            {selectedItem && (
                <MediaDetailModal
                    item={selectedItem as any}
                    readOnly={currentUserId !== userId}
                    onClose={() => setSelectedItem(null)}
                    onUpdate={(updated) => {
                        if (currentUserId === userId) {
                            setLocalMediaItems(prev => prev.map(i => i.id === updated.id ? updated as any : i))
                        }
                        setSelectedItem(updated as any)
                    }}
                    onDelete={(id) => {
                        if (currentUserId === userId) {
                            setLocalMediaItems(prev => prev.filter(i => i.id !== id))
                        }
                        setSelectedItem(null)
                    }}
                />
            )}
        </div>
    )
}
