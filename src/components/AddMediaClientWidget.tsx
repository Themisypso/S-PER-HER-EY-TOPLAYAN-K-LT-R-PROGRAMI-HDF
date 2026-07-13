'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { StatusIconBar, type Status } from './StatusIconBar'
import { BaseMedia, MediaItem } from '@/types/media'
import { useTranslations } from 'next-intl'

interface Props {
    baseItem: any // Keeping as any for now as it maps to many sources, but better than 'any' on entire file
    onAdded?: (addedItem: MediaItem) => void
}

export function AddMediaClientWidget({ baseItem, onAdded }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<Status>('PLANNED')
    const t = useTranslations('MediaDetail')

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="btn-primary w-full flex items-center justify-center py-3 text-sm font-medium">
                <Plus size={16} className="mr-2" /> {t('add_library')}
            </button>
        )
    }

    async function handleSave() {
        setLoading(true)
        const result = await upsertLibraryStatus(
            {
                id: baseItem.id ?? null,
                title: baseItem.title,
                type: baseItem.type,
                tmdbId: baseItem.tmdbId ?? null,
                imdbId: baseItem.imdbId ?? null,
                rawgId: baseItem.rawgId ?? null,
                bookId: baseItem.bookId ?? null,
                posterUrl: baseItem.posterUrl ?? null,
                backdropUrl: baseItem.backdropUrl ?? null,
                genres: baseItem.genres ?? [],
                releaseYear: baseItem.releaseYear ?? null,
                overview: baseItem.overview ?? null,
                tmdbRating: baseItem.tmdbRating ?? null,
                runtime: baseItem.runtime ?? null,
                episodeCount: baseItem.episodeCount ?? null,
            },
            status,
            status.charAt(0) + status.slice(1).toLowerCase()
        )
        setLoading(false)
        if (result) {
            onAdded?.(result)
            setOpen(false)
        }
    }

    return (
        <div className="glass-card p-4 rounded-xl border border-border mt-2 animate-fade-in shadow-card text-left space-y-4">
            <h4 className="text-sm font-bold text-text-primary">{t('add_library')}</h4>

            <div className="space-y-1.5">
                <label className="block text-[10px] text-text-muted uppercase tracking-wider font-bold">{t('status')}</label>
                <StatusIconBar value={status} onChange={setStatus} />
            </div>

            <div className="flex gap-3">
                <button onClick={() => setOpen(false)} disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm bg-bg-hover text-text-secondary border border-border flex-1 font-medium hover:bg-bg-card transition-colors">
                    {t('cancel')}
                </button>
                <button onClick={handleSave} disabled={loading}
                    className="btn-primary py-2 flex-1 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : t('save')}
                </button>
            </div>
        </div>
    )
}
