export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { steamId: true } })
        if (!user?.steamId) return NextResponse.json({ error: 'Steam account not connected' }, { status: 400 })

        const key = process.env.STEAM_API_KEY
        if (!key) return NextResponse.json({ error: 'Server missing STEAM_API_KEY' }, { status: 500 })

        const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${user.steamId}&format=json&include_appinfo=1`)
        if (!res.ok) {
            return NextResponse.json({ error: `Steam API Error: ${res.statusText}` }, { status: 502 })
        }

        const data = await res.json()

        if (!data.response || !data.response.games) {
            return NextResponse.json({ error: 'Could not fetch games. Your Game Details privacy setting might be Private on Steam.' }, { status: 400 })
        }

        const ownedGames = data.response.games // array of { appid, name, playtime_forever, img_icon_url, ... }

        const existingGames = await prisma.mediaItem.findMany({
            where: { userId: session.user.id, type: 'GAME' }
        })

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                const sendUpdate = (data: any) => {
                    try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)) } catch (e) {}
                }

                let updatedCount = 0
                let processed = 0
                const validGames = ownedGames.filter((sg: any) => sg.playtime_forever >= 30)
                const total = validGames.length

                for (const sg of validGames) {
                    const steamPlaytimeMinutes = sg.playtime_forever
                    const appidStr = String(sg.appid)

                    let match = existingGames.find(g => g.steamAppId === appidStr || g.title.toLowerCase() === sg.name.toLowerCase())

                    let releaseYear = match?.releaseYear || null
                    let rawgIdStr = match?.rawgId || null

                    // If we don't have releaseYear, try to fetch from RAWG
                    if (!releaseYear && process.env.RAWG_API_KEY) {
                        try {
                            const endpoint = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(sg.name)}&page_size=1`
                            const rawgRes = await fetch(endpoint)
                            if (rawgRes.ok) {
                                const data = await rawgRes.json()
                                if (data.results && data.results.length > 0) {
                                    const bestMatch = data.results[0]
                                    if (bestMatch.released) releaseYear = parseInt(bestMatch.released.split('-')[0])
                                    if (bestMatch.id) rawgIdStr = String(bestMatch.id)
                                }
                            }
                        } catch (e) {
                            console.error('RAWG fetch error for', sg.name)
                        }
                    }

                    if (match) {
                        const newEffective = Math.max((match.playtimeHours ?? 0) * 60, steamPlaytimeMinutes)
                        await prisma.mediaItem.update({
                            where: { id: match.id },
                            data: {
                                steamAppId: appidStr,
                                steamPlaytimeMinutes,
                                totalTimeMinutes: Math.round(newEffective),
                                posterUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${sg.appid}/library_600x900_2x.jpg`,
                                releaseYear: releaseYear,
                                rawgId: rawgIdStr
                            }
                        })
                        updatedCount++
                    } else {
                        const status = steamPlaytimeMinutes > 600 ? 'COMPLETED' : 'WATCHING'
                        await prisma.mediaItem.create({
                            data: {
                                userId: session.user.id,
                                title: sg.name,
                                type: 'GAME',
                                status,
                                steamAppId: appidStr,
                                steamPlaytimeMinutes,
                                totalTimeMinutes: steamPlaytimeMinutes,
                                posterUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${sg.appid}/library_600x900_2x.jpg`,
                                releaseYear: releaseYear,
                                rawgId: rawgIdStr
                            }
                        })
                        updatedCount++
                    }

                    processed++
                    if (processed % 5 === 0 || processed === total) {
                        sendUpdate({ progress: Math.round((processed / total) * 100), processed, updatedCount, total })
                    }
                }

                sendUpdate({ done: true, updatedCount, processed, total })
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
        console.error('[STEAM SYNC]', e)
        return NextResponse.json({ error: e.message || 'Internal sync error' }, { status: 500 })
    }
}
