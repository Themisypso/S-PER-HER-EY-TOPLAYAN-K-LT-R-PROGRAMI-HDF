import { cookies } from 'next/headers'

export function getTmdbLang() {
    const cookieStore = cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
    
    // TMDB usually accepts ISO 639-1 (e.g., 'tr') or ISO 639-1-ISO 3166-1 (e.g., 'tr-TR')
    // We map our next-intl short locales to TMDB preferred language formats.
    const map: Record<string, string> = {
        en: 'en-US',
        tr: 'tr-TR',
        de: 'de-DE',
        fr: 'fr-FR',
        es: 'es-ES',
        ja: 'ja-JP',
        ko: 'ko-KR',
        pt: 'pt-BR',
        ru: 'ru-RU',
        ar: 'ar-SA'
    }
    
    return map[locale] || 'en-US'
}
