'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Search, LayoutDashboard, Library, LogOut, User, Menu, X, Clapperboard, ChevronDown, Settings, Compass, Film, Tv, Users, Sparkles, Gamepad2, BookOpen, Shield, ActivitySquare, Quote, List as ListIcon, Plus, MessageSquare, Flame } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationDropdown } from './NotificationDropdown'
import { GlobalSearch } from './GlobalSearch'

const getMenuLinks = (t: any) => [
    { href: '/explore', label: t('explore'), icon: Compass },
    { href: '/movies', label: t('movies'), icon: Film },
    { href: '/tv-shows', label: t('tv_shows'), icon: Tv },
    { href: '/anime', label: t('anime'), icon: Sparkles },
    { href: '/games', label: t('games'), icon: Gamepad2 },
    { href: '/books', label: t('books'), icon: BookOpen },
    { href: '/trending', label: t('trending'), icon: Flame },
    { href: '/people', label: t('people'), icon: Users },
    { href: '/quotes', label: t('quotes'), icon: Quote },
    { href: '/discussions', label: t('discussions'), icon: MessageSquare },
    { href: '/lists', label: t('lists'), icon: ListIcon },
]

export function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const router = useRouter()
    const t = useTranslations('Navbar')
    const menuLinks = getMenuLinks(t)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userDropdown, setUserDropdown] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 48)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setUserDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    function isActive(href: string) {
        return pathname === href || pathname.startsWith(href + '?')
    }

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border bg-bg-primary/90 backdrop-blur-xl ${scrolled ? 'py-1' : 'py-2'}`}>
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* TOP ROW: Logo, Search, User actions */}
                    <div className="flex items-center justify-between gap-4 h-14">
                        {/* Left: Logo */}
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple shadow-glow-cyan">
                                <Clapperboard size={18} className="text-white" />
                            </div>
                            <span className="font-display font-bold text-xl hidden xl:block text-text-primary tracking-tight">
                                Themis
                            </span>
                        </Link>

                        {/* Center: Global Search (Hidden on mobile via flex layout, handled via icon) */}
                        <div className="hidden md:flex flex-1 justify-center max-w-2xl px-4">
                            <GlobalSearch />
                        </div>

                        {/* Right: Icons & Profile */}
                        <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
                            <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                                <Link href="/search" className="p-2.5 text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-full transition-colors" aria-label="Add Media" title="Add Media">
                                    <Plus size={20} />
                                </Link>
                                <LanguageSwitcher />
                                <ThemeSwitcher />
                                {session && <NotificationDropdown />}
                            </div>

                            {/* Mobile Search Icon */}
                            <button className="md:hidden p-2 text-text-secondary hover:text-text-primary" onClick={() => router.push('/search')}>
                                <Search size={22} />
                            </button>

                            {/* Mobile Hamburger */}
                            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-text-secondary hover:text-text-primary">
                                <Menu size={24} />
                            </button>

                            {session ? (
                                <div className="hidden md:block relative ml-1 sm:ml-2" ref={dropdownRef}>
                                    <button
                                        onClick={() => setUserDropdown(p => !p)}
                                        className="flex items-center gap-2 p-1 pr-3 rounded-full bg-bg-secondary/50 border border-border hover:border-accent-cyan/50 hover:bg-bg-hover transition-all"
                                        aria-label="User menu"
                                    >
                                        {session.user?.image ? (
                                            <Image 
                                                src={session.user.image} 
                                                alt="" 
                                                width={32} 
                                                height={32} 
                                                className="w-8 h-8 rounded-full object-cover border border-border" 
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-accent-cyan to-accent-purple text-white shadow-sm">
                                                {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <ChevronDown size={14} className="text-text-secondary" />
                                    </button>

                                    {/* Dropdown User Menu */}
                                    {userDropdown && (
                                        <div className="absolute right-0 top-full mt-3 w-56 glass-card py-2 animate-slide-up flex flex-col gap-0.5 shadow-card" style={{ zIndex: 100 }}>
                                            <div className="px-4 py-2 border-b border-border mb-1">
                                                <p className="text-xs text-text-secondary truncate">{session.user?.email}</p>
                                            </div>

                                            <Link
                                                href="/dashboard"
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                                            >
                                                <LayoutDashboard size={14} />
                                                {t('dashboard')}
                                            </Link>

                                            <Link
                                                href="/library"
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                                            >
                                                <Library size={14} />
                                                {t('library')}
                                            </Link>

                                            <Link
                                                href="/search"
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-[#00ff9d] hover:bg-[#00ff9d]/10 transition-colors"
                                            >
                                                <Search size={14} />
                                                Add Media
                                            </Link>

                                            <div className="h-px bg-border my-1" />

                                            <Link
                                                href={`/user/${session.user?.username || session.user?.id}`}
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10 transition-colors"
                                            >
                                                <User size={14} />
                                                {t('my_profile')}
                                            </Link>

                                            <div className="h-px bg-border my-1" />

                                            <Link
                                                href="/feed"
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-[#ff9500] hover:bg-[#ff9500]/10 transition-colors"
                                            >
                                                <ActivitySquare size={14} />
                                                Activity Stream
                                            </Link>

                                            <Link
                                                href="/friends"
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors"
                                            >
                                                <Users size={14} />
                                                Manage Friends
                                            </Link>

                                            {session.user?.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setUserDropdown(false)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-accent-pink hover:bg-accent-pink/10 transition-colors"
                                                >
                                                    <Shield size={14} />
                                                    Admin Panel
                                                </Link>
                                            )}

                                            <Link
                                                href="/settings"
                                                onClick={() => setUserDropdown(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10 transition-colors"
                                            >
                                                <Settings size={14} />
                                                {t('settings')}
                                            </Link>

                                            <div className="h-px bg-border my-1" />

                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-accent-pink hover:bg-accent-pink/10 transition-colors"
                                            >
                                                <LogOut size={14} />
                                                {t('logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/auth/login" className="hidden md:block btn-primary text-sm px-5 py-2">
                                    {t('login')}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* BOTTOM ROW: Secondary Menu Links - hide on mobile, condense on scroll */}
                    <div className={`hidden md:flex items-center justify-center gap-1 transition-all duration-300 overflow-hidden ${scrolled ? 'h-0 opacity-0' : 'h-12 opacity-100'}`}>
                        {menuLinks.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive(href)
                                    ? 'text-accent-cyan bg-accent-cyan/10'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
            {/* Spacer */}
            <div className={`hidden md:block transition-all duration-300 ${scrolled ? 'h-20' : 'h-[104px]'}`} />
            <div className="md:hidden h-20" />

            {/* FULL SCREEN MOBILE DRAWER */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-bg-primary backdrop-blur-3xl flex flex-col animate-fade-in overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b border-border bg-bg-primary/95 sticky top-0 z-10">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple">
                                <Clapperboard size={18} className="text-white" />
                            </div>
                            <span className="font-display font-bold text-xl text-transparent bg-clip-text bg-gradient-to-br from-accent-cyan to-accent-purple">
                                Themis
                            </span>
                        </Link>
                        <button onClick={() => setMobileOpen(false)} className="p-2 text-text-primary bg-bg-secondary rounded-full hover:bg-bg-hover">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 px-4 py-6 space-y-6">
                        <div className="w-full">
                            <GlobalSearch onSelect={() => setMobileOpen(false)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {menuLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href} href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 border rounded-xl transition-all ${isActive(href)
                                        ? 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10'
                                        : 'text-text-secondary border-border bg-bg-secondary hover:border-text-secondary'
                                        }`}
                                >
                                    <Icon size={24} />
                                    <span className="font-medium text-sm">{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="px-4 py-6 border-t border-border mt-auto bg-bg-secondary/20">
                        {session ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    {session.user?.image ? (
                                        <Image 
                                            src={session.user.image} 
                                            alt="" 
                                            width={40} 
                                            height={40} 
                                            className="w-10 h-10 rounded-full object-cover border border-border" 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-accent-cyan to-accent-purple text-white">
                                            {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-text-primary">{session.user?.name}</p>
                                        <p className="text-xs text-text-secondary text-left">{session.user?.email}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <LanguageSwitcher />
                                        <ThemeSwitcher />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-cyber text-center py-2.5">Dashboard</Link>
                                    <Link href="/library" onClick={() => setMobileOpen(false)} className="btn-cyber text-center py-2.5">Library</Link>
                                </div>
                                <button
                                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-accent-pink bg-accent-pink/10 mt-3"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-end mb-4 gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                </div>
                                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full flex justify-center py-3">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
