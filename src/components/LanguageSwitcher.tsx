'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

const locales = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' }
]

export function LanguageSwitcher() {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const switchLanguage = (code: string) => {
        // Set the cookie for next-intl
        document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`
        setOpen(false)
        
        // Refresh to apply the new locale
        router.refresh()
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="p-2 text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-full transition-colors flex items-center justify-center"
                title="Change Language"
            >
                <Globe size={20} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-40 glass-card py-2 animate-slide-up flex flex-col shadow-card z-[110]">
                    <div className="px-3 py-1 mb-1 border-b border-border">
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Language</span>
                    </div>
                    {locales.map((locale) => (
                        <button
                            key={locale.code}
                            onClick={() => switchLanguage(locale.code)}
                            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                        >
                            {locale.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
