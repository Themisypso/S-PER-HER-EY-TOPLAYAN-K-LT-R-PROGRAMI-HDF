'use client'

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
    message?: string
    fullScreen?: boolean
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-3 p-12">
            <Loader2 size={32} className="animate-spin text-accent-pink" />
            <p className="text-sm font-medium text-text-muted animate-pulse">{message}</p>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] bg-bg-main flex items-center justify-center">
                {content}
            </div>
        )
    }

    return content
}
