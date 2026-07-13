import { translate } from '@vitalets/google-translate-api';
import { prisma } from './prisma';
import crypto from 'crypto';

/**
 * Generates a SHA-256 hash for a given string to use as a fast index
 */
export function hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Translates text with database caching.
 * Uses @vitalets/google-translate-api (free, no API key).
 * 
 * @param text The text to translate
 * @param targetLang Target language code (e.g. 'tr', 'en', 'es')
 * @param sourceLang Optional source language (e.g. 'en'). If omitted, will auto-detect.
 * @returns Translated text, or original text if translation fails.
 */
export async function translateWithCache(
    text: string, 
    targetLang: string, 
    sourceLang?: string
): Promise<{ text: string, originalLang: string, wasTranslated: boolean }> {
    if (!text || text.trim() === '') {
        return { text, originalLang: sourceLang || 'auto', wasTranslated: false };
    }

    // Standardize 'auto' to undefined for the API
    const effectiveSource = (!sourceLang || sourceLang === 'auto') ? undefined : sourceLang;
    
    // If source and target are the same, don't translate
    if (effectiveSource && effectiveSource.startsWith(targetLang)) {
        return { text, originalLang: effectiveSource, wasTranslated: false };
    }

    const sourceHash = hashText(text);

    try {
        // 1. Check Cache
        const cached = await prisma.translationCache.findUnique({
            where: {
                sourceHash_targetLang: {
                    sourceHash,
                    targetLang
                }
            }
        });

        if (cached) {
            return { 
                text: cached.translated, 
                originalLang: cached.sourceLang, 
                wasTranslated: true 
            };
        }

        // 2. Perform Free Translation
        const res = await translate(text, { 
            to: targetLang, 
            from: effectiveSource 
        });

        const detectedSource = res.raw.src || effectiveSource || 'auto';

        // Wait, if it auto-detected the same language as target, don't cache as translated
        if (detectedSource.startsWith(targetLang)) {
            return { text, originalLang: detectedSource, wasTranslated: false };
        }

        // 3. Save to Cache
        try {
            await prisma.translationCache.create({
                data: {
                    sourceHash,
                    sourceLang: detectedSource,
                    targetLang,
                    translated: res.text
                }
            });
        } catch (e) {
            // Ignore unique constraint violations if multiple requests hit at once
            console.error('Translation cache save error:', e);
        }

        return { 
            text: res.text, 
            originalLang: detectedSource, 
            wasTranslated: true 
        };
    } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original text if API fails (rate limits, etc)
        return { text, originalLang: sourceLang || 'auto', wasTranslated: false };
    }
}
