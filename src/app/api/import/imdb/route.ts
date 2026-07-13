import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const TMDB_API_KEY = process.env.TMDB_API_KEY

function parseCSVLine(line: string, separator: string): string[] {
    if (separator === '\t') {
        return line.split('\t').map(s => s.trim())
    }
    // Simple CSV parser for comma separated, handling quotes
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"' && line[i+1] === '"') {
            current += '"'
            i++ // skip escaped quote
        } else if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    result.push(current.trim())
    return result
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'Server missing TMDB API key' }, { status: 500 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const text = await file.text()
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
        
        if (lines.length < 2) {
            return NextResponse.json({ error: 'File is empty or missing headers' }, { status: 400 })
        }

        const headerLine = lines[0]
        const separator = headerLine.includes('\t') ? '\t' : ','
        const headers = parseCSVLine(headerLine, separator).map(h => h.toLowerCase())

        // Find relevant column indices
        const idIndex = headers.findIndex(h => h === 'const' || h.includes('imdb id'))
        const statusIndex = headers.findIndex(h => h === 'durum' || h.includes('status'))
        const ratingIndex = headers.findIndex(h => h === 'your rating' || h === 'puan')

        if (idIndex === -1) {
            return NextResponse.json({ error: 'Could not find IMDB ID column in the file (Const or IMDb ID)' }, { status: 400 })
        }

        const rowsToProcess = lines.slice(1) // Process all lines instead of just 100

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                const sendUpdate = (data: any) => {
                    try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)) } catch (e) {}
                }

                let processed = 0
                let added = 0
                const total = rowsToProcess.length

                for (const row of rowsToProcess) {
                    const cols = parseCSVLine(row, separator)
                    const imdbId = cols[idIndex]

                    if (imdbId && imdbId.startsWith('tt')) {
                        const statusStr = statusIndex !== -1 ? cols[statusIndex]?.toLowerCase() : ''
                        const userRatingStr = ratingIndex !== -1 ? cols[ratingIndex] : ''
                        
                        let status = 'COMPLETED'
                        let isFavorite = false

                        if (statusStr.includes('izleyecegim') || statusStr.includes('plan') || statusStr.includes('watchlist')) {
                            status = 'PLANNED'
                        } else if (statusStr.includes('favori')) {
                            status = 'COMPLETED'
                            isFavorite = true
                        } else if (statusStr.includes('biraktim') || statusStr.includes('dropped')) {
                            status = 'DROPPED'
                        } else if (statusStr.includes('izliyorum') || statusStr.includes('watching')) {
                            status = 'WATCHING'
                        }

                        let userRating = null
                        if (userRatingStr && !isNaN(parseFloat(userRatingStr))) {
                            userRating = parseFloat(userRatingStr)
                        }

                        try {
                            const findRes = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&api_key=${TMDB_API_KEY}`)
                            if (findRes.ok) {
                                const findData = await findRes.json()
                                let tmdbId = null
                                let type = null
                                let title = null
                                let posterUrl = null
                                let releaseYear = null
                                let tmdbRating = null

                                if (findData.movie_results?.length > 0) {
                                    const m = findData.movie_results[0]
                                    tmdbId = String(m.id)
                                    type = 'MOVIE'
                                    title = m.title
                                    posterUrl = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null
                                    releaseYear = m.release_date ? parseInt(m.release_date.substring(0, 4)) : null
                                    tmdbRating = m.vote_average
                                } else if (findData.tv_results?.length > 0) {
                                    const t = findData.tv_results[0]
                                    tmdbId = String(t.id)
                                    type = 'TVSHOW'
                                    title = t.name
                                    posterUrl = t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null
                                    releaseYear = t.first_air_date ? parseInt(t.first_air_date.substring(0, 4)) : null
                                    tmdbRating = t.vote_average
                                }

                                if (tmdbId && type) {
                                    let mediaItem = await prisma.mediaItem.findFirst({
                                        where: { userId: session.user.id, tmdbId }
                                    })

                                    if (mediaItem) {
                                        await prisma.mediaItem.update({
                                            where: { id: mediaItem.id },
                                            data: { status, userRating: userRating || mediaItem.userRating }
                                        })
                                    } else {
                                        await prisma.mediaItem.create({
                                            data: {
                                                userId: session.user.id, tmdbId, title: title || 'Unknown',
                                                type, status, userRating, posterUrl, releaseYear, tmdbRating
                                            }
                                        })
                                        added++
                                    }

                                    if (isFavorite) {
                                        const existingFav = await prisma.favoriteMedia.findFirst({
                                            where: { userId: session.user.id, tmdbId }
                                        })
                                        if (!existingFav) {
                                            await prisma.favoriteMedia.create({
                                                data: { userId: session.user.id, tmdbId, title: title || 'Unknown', type, posterUrl, releaseYear }
                                            })
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Error importing IMDB ID:', imdbId, e)
                        }
                    }

                    processed++
                    // Send progress update
                    if (processed % 5 === 0 || processed === total) {
                        sendUpdate({ progress: Math.round((processed / total) * 100), processed, added, total })
                    }
                }

                sendUpdate({ done: true, processed, added, total })
                controller.close()
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        })
    } catch (e: any) {
        console.error('[IMDB IMPORT]', e)
        return new Response(JSON.stringify({ error: e.message || 'Internal import error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
