'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { TmdbSearch } from '@/components/TmdbSearch'
import { GameSearch } from '@/components/GameSearch'
import { BookSearch } from '@/components/BookSearch'
import { Loader2 } from 'lucide-react'

function SearchContent() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/login')
    }, [status, router])

    if (status === 'loading' || !session) return null

    return (
        <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <h1 className="text-4xl font-display font-bold text-[#e8edf5] mb-4">Find & Add Media</h1>
                <p className="text-text-secondary">Search across multiple databases to add content to your personal collection.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <TmdbSearch />
                <GameSearch />
                <BookSearch />
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <div className="min-h-screen cyber-bg">
            <Navbar />
            <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Suspense fallback={
                    <div className="flex h-[400px] items-center justify-center text-[#00d4ff]">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                }>
                    <SearchContent />
                </Suspense>
            </main>
        </div>
    )
}
