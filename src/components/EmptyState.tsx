import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description?: string
    icon?: LucideIcon
    action?: React.ReactNode
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center mb-6 text-text-muted opacity-50 shadow-inner">
                    <Icon size={32} />
                </div>
            )}
            <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
            {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
            {action && <div className="mt-8">{action}</div>}
        </div>
    )
}
