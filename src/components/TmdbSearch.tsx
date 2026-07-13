'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Plus, Star, Film, Tv, Info, ChevronRight, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface TmdbResult {
    id: string
    title: string
    mediaType: string
    posterUrl: string | null
    backdropUrl: string | null
    releaseYear: number | null
    tmdbRating: number | null
    overview: string
}

export function TmdbSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlQuery = searchParams.get('q') || ''
    
    const [query, setQuery] = useState(urlQuery)
    const [results, setResults] = useState<TmdbResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<any | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [adding, setAdding] = useState(false)
    const [status, setStatus] = useState('PLANNED')
    const debounceRef = useRef<NodeJS.Timeout>()

    const performSearch = async (q: string) => {
        if (q.length < 2) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}&type=multi`)
            const response = await res.json()
            if (response.success && response.data) {
                setResults(response.data || [])
            } else {
                setResults([])
            }
        } catch {
            toast.error('Failed to search TMDB')
        }
        setLoading(false)
    }

    useEffect(() => {
        if (urlQuery) {
            setQuery(urlQuery)
            performSearch(urlQuery)
        }
    }, [urlQuery])

    useEffect(() => {
        if (query === urlQuery) return; // Prevent double trigger if from URL
        if (query.length < 2) {
            setResults([])
            return
        }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => performSearch(query), 400)
        return () => clearTimeout(debounceRef.current)
    }, [query])

    async function loadDetails(id: string, type: string) {
        setLoadingDetails(true)
        try {
            const res = await fetch(`/api/tmdb/details/${id}?type=${type}`)
            if (!res.ok) throw new Error('Details failed')
            const data = await res.json()
            setSelected(data)
        } catch {
            toast.error('Could not load details')
        }
        setLoadingDetails(false)
    }

    async function handleAdd() {
        if (!selected) return
        setAdding(true)
        
        let targetType = 'MOVIE'
        if (selected.mediaType === 'tv') {
            const hasAnimation = selected.genres?.some((g: string) => g.toLowerCase().includes('animation'))
            const isFromJapan = selected.originCountry?.includes('JP')
            targetType = (hasAnimation && isFromJapan) ? 'ANIME' : 'TVSHOW'
        } else if (selected.mediaType === 'movie') {
            const hasAnimation = selected.genres?.some((g: string) => g.toLowerCase().includes('animation'))
            const isFromJapan = selected.originCountry?.includes('JP')
            targetType = (hasAnimation && isFromJapan) ? 'ANIME' : 'MOVIE'
        }

        try {
            const payload = {
                title: selected.title,
                type: targetType,
                status,
                tmdbId: String(selected.id),
                imdbId: selected.imdbId,
                posterUrl: selected.posterUrl,
                backdropUrl: selected.backdropUrl,
                genres: selected.genres,
                releaseYear: selected.releaseYear,
                overview: selected.overview,
                tmdbRating: selected.tmdbRating,
                runtime: selected.runtime,
                episodeCount: selected.episodeCount,
            }

            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Added to library!')
            setSelected(null)
            setQuery('')
            setResults([])
            router.push('/library')
        } catch (err: any) {
            toast.error(err.message || 'Failed to add')
        }
        setAdding(false)
    }

    return (
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#1e2a3a]">
                <Film className="text-[#00d4ff]" size={20} />
                <h2 className="font-display font-semibold text-lg text-[#e8edf5]">TMDB Search</h2>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelected(null) }}
                    placeholder="Search for movies or series..."
                    className="input-cyber pl-9 pr-9 w-full"
                />
                {loading && (
                    <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00d4ff] animate-spin" />
                )}
            </div>

            {/* Results List */}
            {!selected && !loadingDetails && results.length > 0 && (
                <div className="flex flex-col gap-1 mb-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                    {results.map(item => (
                        <button
                            key={`${item.mediaType}-${item.id}`}
                            onClick={() => loadDetails(item.id, item.mediaType)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-bg-secondary hover:bg-bg-hover border border-transparent hover:border-[#00d4ff]/40 transition-all text-left group"
                        >
                            {item.posterUrl ? (
                                <div className="relative w-10 h-14 flex-shrink-0">
                                    <Image 
                                        src={item.posterUrl} 
                                        alt="" 
                                        fill
                                        sizes="40px"
                                        className="object-cover rounded-md border border-border" 
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-14 rounded-md bg-bg-hover flex items-center justify-center flex-shrink-0">
                                    <Film size={14} className="text-text-muted" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate group-hover:text-[#00d4ff] transition-colors">{item.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-text-muted">{item.releaseYear || '—'}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider uppercase bg-bg-primary border border-border type-${item.mediaType === 'tv' ? 'TVSHOW' : item.mediaType.toUpperCase()}`}>
                                        {item.mediaType}
                                    </span>
                                </div>
                            </div>
                            {item.tmdbRating && (
                                <span className="text-xs font-bold text-[#ffd700] flex-shrink-0 flex items-center gap-1">
                                    ★ {item.tmdbRating}
                                </span>
                            )}
                            <ChevronRight size={14} className="text-text-muted group-hover:text-[#00d4ff] transition-colors flex-shrink-0" />
                        </button>
                    ))}
                </div>
            )}

            {/* Loading Details */}
            {loadingDetails && (
                <div className="flex flex-col items-center justify-center py-20 text-[#8899aa]">
                    <Loader2 size={32} className="animate-spin mb-4 text-[#00d4ff]" />
                    <p>Loading details...</p>
                </div>
            )}

            {/* No results */}
            {!loading && !loadingDetails && query.length >= 2 && results.length === 0 && !selected && (
                <p className="text-sm text-text-secondary text-center py-10">No results found for &ldquo;{query}&rdquo;</p>
            )}

            {/* Empty state */}
            {!query && !selected && !loading && !loadingDetails && (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-bg-hover border border-border flex items-center justify-center mb-4">
                        <Search size={32} className="opacity-40" />
                    </div>
                    <p className="text-sm">Search the Movie Database</p>
                    <p className="text-xs mt-1">Millions of movies, TV shows and people to discover.</p>
                </div>
            )}

            {/* Selected Detail View */}
            {selected && !loadingDetails && (
                <div className="animate-fade-in flex flex-col h-full">
                    <button onClick={() => setSelected(null)} className="text-xs text-text-muted hover:text-text-secondary mb-4 flex items-center gap-1 transition-colors">
                        ← Back to results
                    </button>
                    
                    <div className="flex gap-5 mb-6">
                        <div className="w-32 rounded-xl overflow-hidden flex-shrink-0 shadow-glow-cyan border border-border relative aspect-[2/3]">
                            {selected.posterUrl ? (
                                <Image 
                                    src={selected.posterUrl} 
                                    alt="" 
                                    fill
                                    sizes="128px"
                                    className="object-cover" 
                                />
                            ) : <div className="w-full h-full bg-bg-secondary flex items-center justify-center"><Film size={32} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold font-display text-[#e8edf5] mb-2">{selected.title}</h3>
                            <div className="text-xs text-text-muted space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-text-secondary">{selected.releaseYear || 'Unknown'}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="uppercase">{selected.mediaType}</span>
                                </div>
                                {selected.tmdbRating && <p className="text-[#ffd700] font-bold">★ {selected.tmdbRating} TMDB</p>}
                                {selected.runtime && <p>{selected.runtime} min</p>}
                            </div>
                            <div className="mt-4 flex gap-1.5 flex-wrap">
                                {selected.genres?.slice(0, 3).map((g: string) => (
                                    <span key={g} className="text-[10px] px-2 py-1 rounded bg-bg-secondary border border-border text-text-secondary">{g}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#080c14] p-4 rounded-xl border border-[#1e2a3a] mt-auto">
                        <label className="block text-xs text-[#8899aa] mb-2 font-medium">Initial Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="input-cyber w-full mb-4">
                            <option value="WATCHING">In Progress</option>
                            <option value="PLANNED">Planned To Watch</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="DROPPED">Dropped</option>
                        </select>
                        <button 
                            onClick={handleAdd} 
                            disabled={adding}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Add to Library
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
