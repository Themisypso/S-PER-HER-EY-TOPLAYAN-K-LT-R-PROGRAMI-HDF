'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Save, Loader2, Globe, Lock, User, Link as LinkIcon, Image as ImageIcon, Gamepad2, Upload } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface User {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
    steamId?: string | null
}

interface UserSettings {
    bio: string | null
    website: string | null
    twitter: string | null
    instagram: string | null
    isPublic: boolean
    hideRatings: boolean
    hideActivity: boolean
    showSteamProfile: boolean
    language: string
}

interface Props {
    initialSettings: UserSettings | null
    user: User | null
}

export function SettingsForm({ initialSettings, user }: Props) {
    const router = useRouter()
    const { update } = useSession()

    const searchParams = useSearchParams()

    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatar, setAvatar] = useState(user?.image || null)

    // Steam Integration State
    const [verifyingSteam, setVerifyingSteam] = useState(false)
    const [syncingSteam, setSyncingSteam] = useState(false)
    const [steamProgress, setSteamProgress] = useState<{ progress: number, text: string } | null>(null)

    // IMDB Import State
    const [importingImdb, setImportingImdb] = useState(false)
    const [imdbProgress, setImdbProgress] = useState<{ progress: number, text: string } | null>(null)

    useEffect(() => {
        if (searchParams.get('steam_connected') === 'true') {
            update() // refresh session so user.steamId becomes available if using jwt
            toast.success('Steam connected successfully!')
            // Clean up URL
            window.history.replaceState(null, '', '/settings')
        }
        if (searchParams.get('error') === 'steam_failed') {
            toast.error('Failed to connect Steam. Please try again.')
            window.history.replaceState(null, '', '/settings')
        }
    }, [searchParams, update])

    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: initialSettings?.bio || '',
        website: initialSettings?.website || '',
        twitter: initialSettings?.twitter || '',
        instagram: initialSettings?.instagram || '',
        isPublic: initialSettings?.isPublic ?? true,
        hideRatings: initialSettings?.hideRatings ?? false,
        hideActivity: initialSettings?.hideActivity ?? false,
        showSteamProfile: initialSettings?.showSteamProfile ?? true,
        language: initialSettings?.language || 'EN',
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const data = new FormData()
            data.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            setAvatar(json.url)
            await update({ image: json.url })

            toast.success('Avatar updated successfully!')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload image')
        }
        setUploading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            await update({ name: formData.name })

            toast.success('Settings saved successfully!')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save settings')
        }
        setSaving(false)
    }

    const handleSteamConnect = async () => {
        setVerifyingSteam(true)
        window.location.href = '/api/settings/steam'
    }

    const handleSteamDisconnect = async () => {
        setSyncingSteam(true)
        try {
            const res = await fetch('/api/settings/steam/disconnect', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            await update() // Refresh session
            toast.success('Steam account unlinked successfully.')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Failed to disconnect Steam')
        }
        setSyncingSteam(false)
    }

    const handleSteamSync = async () => {
        setSyncingSteam(true)
        setSteamProgress({ progress: 0, text: 'Connecting to Steam...' })
        try {
            const res = await fetch('/api/steam/sync', { method: 'POST' })
            if (!res.ok) {
                let errStr = 'Failed to sync Steam'
                try { const data = await res.json(); errStr = data.error || errStr } catch(e){}
                throw new Error(errStr)
            }
            
            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let finalUpdated = 0

            if (reader) {
                let buffer = ''
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6))
                                if (data.done) {
                                    finalUpdated = data.updatedCount
                                } else if (data.progress !== undefined) {
                                    setSteamProgress({ 
                                        progress: data.progress, 
                                        text: `${data.progress}% (${data.processed}/${data.total} games)` 
                                    })
                                }
                            } catch (e) {}
                        }
                    }
                }
            }
            toast.success(`Sync complete! Updated ${finalUpdated} games.`)
        } catch (err: any) {
            toast.error(err.message || 'Failed to sync Steam')
        }
        setSteamProgress(null)
        setSyncingSteam(false)
    }

    const handleImdbImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImportingImdb(true)
        setImdbProgress({ progress: 0, text: 'Parsing file...' })
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/import/imdb', {
                method: 'POST',
                body: formData
            })
            if (!res.ok) {
                let errStr = 'Failed to import IMDB list'
                try { const data = await res.json(); errStr = data.error || errStr } catch(e){}
                throw new Error(errStr)
            }
            
            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let finalProcessed = 0
            let finalAdded = 0

            if (reader) {
                let buffer = ''
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6))
                                if (data.done) {
                                    finalProcessed = data.processed
                                    finalAdded = data.added
                                } else if (data.progress !== undefined) {
                                    setImdbProgress({ 
                                        progress: data.progress, 
                                        text: `${data.progress}% (${data.processed}/${data.total} processed)` 
                                    })
                                }
                            } catch (e) {}
                        }
                    }
                }
            }
            toast.success(`Import complete! Processed ${finalProcessed} items (${finalAdded} new).`)
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Failed to import IMDB list')
        }
        setImdbProgress(null)
        setImportingImdb(false)
        e.target.value = '' // reset input
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-left">
            {/* Profile Section */}
            <section className="glass-card p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-6 text-text-primary">
                    <User size={18} className="text-accent-cyan" />
                    <h2 className="text-lg font-bold font-display">Public Profile</h2>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-border/50">
                    <div className="w-24 h-24 rounded-full bg-bg-secondary border border-border overflow-hidden flex-shrink-0 relative group">
                        {avatar ? (
                            <Image 
                                src={avatar} 
                                alt="Avatar" 
                                width={96} 
                                height={96} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <User size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-muted" />
                        )}
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all cursor-pointer">
                            <ImageIcon size={20} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="btn-secondary px-4 py-2 cursor-pointer inline-flex items-center gap-2 text-sm">
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                            {uploading ? 'Uploading...' : 'Change Avatar'}
                            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                        <p className="text-xs text-text-muted mt-2">Recommended: 256x256px JPG or PNG</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Display Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-cyber w-full"
                                placeholder="Your display name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">@</span>
                                <input
                                    type="text"
                                    value={user?.username || ''}
                                    disabled={true}
                                    className="input-cyber w-full pl-8 bg-bg-secondary/50 text-text-muted cursor-not-allowed border-none"
                                    title="Contact admin to change your immutable username"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="input-cyber w-full resize-none leading-relaxed"
                            placeholder="Tell the world about your taste in media..."
                        />
                    </div>
                </div>
            </section>

            {/* Social Links Section */}
            <section className="glass-card p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-6 text-text-primary">
                    <LinkIcon size={18} className="text-accent-purple" />
                    <h2 className="text-lg font-bold font-display">Social Links</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Website</label>
                        <input type="url" name="website" value={formData.website} onChange={handleChange} className="input-cyber w-full" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Twitter</label>
                        <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} className="input-cyber w-full" placeholder="@username" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Instagram</label>
                        <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="input-cyber w-full" placeholder="@username" />
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="glass-card p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-6 text-text-primary">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-bg-secondary border border-border rounded-lg">
                        <Gamepad2 size={22} className="text-accent-cyan" />
                    </div>
                    <h2 className="text-lg font-bold font-display">Gaming & Integrations</h2>
                </div>

                <div className="space-y-4">
                    {!user?.steamId && (
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Steam Connection</label>
                            <button
                                type="button"
                                onClick={handleSteamConnect}
                                disabled={verifyingSteam}
                                className="sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-[#1e2a3a] bg-[#171a21] text-white hover:bg-[#2a475e] hover:border-[#66c0f4] transition-all text-sm font-medium"
                            >
                                {verifyingSteam ? <Loader2 size={16} className="animate-spin text-[#66c0f4]" /> : (
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                        <path d="M11.979 0C5.353 0 0 5.373 0 12c0 4.148 2.11 7.822 5.32 10.02l3.206-4.634c-.16-.395-.24-.814-.24-1.258 0-1.898 1.543-3.441 3.442-3.441 1.09 0 2.052.513 2.686 1.31l4.582-6.52c.007-.11.02-.218.02-.328 0-3.313-2.696-6.01-6.01-6.01-3.315 0-6.01 2.697-6.01 6.01 0 .426.046.84.133 1.234l-3.36 4.856C1.488 15.65 0 13.916 0 12c0-6.627 5.373-12 12-12s12 5.373 12 12c0 6.627-5.373 12-12 12-1.637 0-3.197-.336-4.607-.93l-3.21 4.64C7.032 23.32 9.423 24 11.98 24 18.607 24 24 18.627 24 12c0-6.627-5.373-12-12-12zM11.73 14.129c-.848 0-1.536.687-1.536 1.535s.688 1.535 1.536 1.535 1.535-.688 1.535-1.535-.687-1.535-1.535-1.535zM17.986 7.15c-1.898 0-3.442 1.544-3.442 3.442 0 .524.12 1.02.33 1.46l-4.225 6.013c-.347-.133-.728-.21-1.127-.21-1.666 0-3.02 1.354-3.02 3.02 0 1.666 1.354 3.02 3.02 3.02 1.666 0 3.02-1.354 3.02-3.02 0-.256-.033-.505-.094-.74l4.28-6.09c.39.112.8.17 1.22.17 2.062 0 3.738-1.676 3.738-3.738S20.048 7.15 17.986 7.15zM7.522 19.38c-.563 0-1.02-.457-1.02-1.02 0-.563.457-1.02 1.02-1.02.563 0 1.02.457 1.02 1.02 0 .563-.457 1.02-1.02 1.02z" />
                                    </svg>
                                )}
                                Connect with Steam
                            </button>
                        </div>
                    )}
                    {user?.steamId && (
                        <div className="mt-4 p-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all animate-fade-in shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                            <div>
                                <p className="text-sm font-bold text-accent-cyan">Steam Connected ✅</p>
                                <p className="text-[10px] uppercase tracking-wider text-text-muted mt-1 font-mono">{user.steamId}</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleSteamSync}
                                    disabled={syncingSteam}
                                    className="px-6 py-3 rounded-xl bg-accent-cyan text-bg-dark font-bold hover:bg-accent-cyan/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 min-w-[220px] relative overflow-hidden"
                                >
                                    {syncingSteam && steamProgress && (
                                        <div className="absolute inset-0 bg-white/20 origin-left transition-all duration-300" style={{ width: `${steamProgress.progress}%` }} />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {syncingSteam ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>{steamProgress?.text || 'Syncing...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                                    <path d="M11.979 0C5.353 0 0 5.373 0 12c0 4.148 2.11 7.822 5.32 10.02l3.206-4.634c-.16-.395-.24-.814-.24-1.258 0-1.898 1.543-3.441 3.442-3.441 1.09 0 2.052.513 2.686 1.31l4.582-6.52c.007-.11.02-.218.02-.328 0-3.313-2.696-6.01-6.01-6.01-3.315 0-6.01 2.697-6.01 6.01 0 .426.046.84.133 1.234l-3.36 4.856C1.488 15.65 0 13.916 0 12c0-6.627 5.373-12 12-12s12 5.373 12 12c0 6.627-5.373 12-12 12-1.637 0-3.197-.336-4.607-.93l-3.21 4.64C7.032 23.32 9.423 24 11.98 24 18.607 24 24 18.627 24 12c0-6.627-5.373-12-12-12zM11.73 14.129c-.848 0-1.536.687-1.536 1.535s.688 1.535 1.536 1.535 1.535-.688 1.535-1.535-.687-1.535-1.535-1.535zM17.986 7.15c-1.898 0-3.442 1.544-3.442 3.442 0 .524.12 1.02.33 1.46l-4.225 6.013c-.347-.133-.728-.21-1.127-.21-1.666 0-3.02 1.354-3.02 3.02 0 1.666 1.354 3.02 3.02 3.02 1.666 0 3.02-1.354 3.02-3.02 0-.256-.033-.505-.094-.74l4.28-6.09c.39.112.8.17 1.22.17 2.062 0 3.738-1.676 3.738-3.738S20.048 7.15 17.986 7.15zM7.522 19.38c-.563 0-1.02-.457-1.02-1.02 0-.563.457-1.02 1.02-1.02.563 0 1.02.457 1.02 1.02 0 .563-.457 1.02-1.02 1.02z" />
                                                </svg>
                                                Sync Library & Playtime
                                            </>
                                        )}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSteamDisconnect}
                                    disabled={syncingSteam}
                                    className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* IMDB Import Section */}
                <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">IMDB List Import</label>
                            <p className="text-sm text-text-muted">Import your watch history, ratings, and watchlist from an IMDB CSV/TSV export.</p>
                        </div>
                        <label className={`sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20 transition-all text-sm font-bold cursor-pointer relative overflow-hidden min-w-[220px] ${importingImdb ? 'opacity-80 pointer-events-none' : ''}`}>
                            {importingImdb && imdbProgress && (
                                <div className="absolute inset-0 bg-[#f5c518]/20 origin-left transition-all duration-300" style={{ width: `${imdbProgress.progress}%` }} />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {importingImdb ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>{imdbProgress?.text || 'Importing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        <span>Upload CSV/TSV</span>
                                    </>
                                )}
                            </span>
                            <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleImdbImport} disabled={importingImdb} />
                        </label>
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section className="glass-card p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-6 text-text-primary">
                    <Lock size={18} className="#ff9500" style={{ color: '#ff9500' }} />
                    <h2 className="text-lg font-bold font-display">Privacy & Display</h2>
                </div>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-secondary cursor-pointer hover:border-accent-cyan/30 transition-colors">
                        <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="mt-1 w-4 h-4 rounded border-gray-600 text-accent-cyan focus:ring-accent-cyan bg-bg-card" />
                        <div>
                            <div className="text-sm font-semibold text-text-primary">Public Profile</div>
                            <div className="text-xs text-text-secondary mt-1">Allow anyone to view your library and stats on your profile page.</div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-secondary cursor-pointer hover:border-accent-cyan/30 transition-colors">
                        <input type="checkbox" name="hideRatings" checked={formData.hideRatings} onChange={handleChange} className="mt-1 w-4 h-4 rounded border-gray-600 text-accent-cyan focus:ring-accent-cyan bg-bg-card" />
                        <div>
                            <div className="text-sm font-semibold text-text-primary">Hide Ratings</div>
                            <div className="text-xs text-text-secondary mt-1">Keep your 1-10 personal ratings private, even if your library is public.</div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-secondary cursor-pointer hover:border-accent-cyan/30 transition-colors">
                        <input type="checkbox" name="hideActivity" checked={formData.hideActivity} onChange={handleChange} className="mt-1 w-4 h-4 rounded border-gray-600 text-accent-cyan focus:ring-accent-cyan bg-bg-card" />
                        <div>
                            <div className="text-sm font-semibold text-text-primary">Hide Activity Feed</div>
                            <div className="text-xs text-text-secondary mt-1">Prevent your actions (adding/rating) from appearing in the global social feed.</div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-secondary cursor-pointer hover:border-accent-cyan/30 transition-colors">
                        <input type="checkbox" name="showSteamProfile" checked={formData.showSteamProfile} onChange={handleChange} className="mt-1 w-4 h-4 rounded border-gray-600 text-accent-cyan focus:ring-accent-cyan bg-bg-card" />
                        <div>
                            <div className="text-sm font-semibold text-text-primary">Show Steam Link</div>
                            <div className="text-xs text-text-secondary mt-1">Display your connected Steam account on your public profile page.</div>
                        </div>
                    </label>
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving} className="btn-primary px-8 py-3 flex items-center justify-center gap-2 min-w-[160px]">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
                </button>
            </div>
        </form >
    )
}
