import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { translateWithCache } from '@/lib/translate'
import { cookies } from 'next/headers'

// GET /api/discussions/tmdb/[tmdbId] — get or init thread for a TMDB item
export async function GET(req: Request, { params }: { params: { tmdbId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { searchParams } = new URL(req.url)
        const cursor = searchParams.get('cursor') || undefined
        const limit = 30

        const thread = await prisma.discussionThread.findFirst({
            where: { tmdbId: params.tmdbId },
            include: {
                author: { select: { id: true, name: true, username: true, image: true } },
                _count: { select: { comments: true } }
            }
        })

        if (!thread) {
            return NextResponse.json({ thread: null, comments: [], nextCursor: null })
        }

        const comments = await prisma.comment.findMany({
            where: { discussionThreadId: thread.id, parentId: null },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: { createdAt: 'asc' },
            include: {
                user: { select: { id: true, name: true, username: true, image: true } },
                _count: { select: { likes: true, replies: true } },
                likes: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
                replies: {
                    take: 5,
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { id: true, name: true, username: true, image: true } },
                        _count: { select: { likes: true } },
                        likes: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false
                    }
                }
            }
        })

        const hasMore = comments.length > limit
        const data = hasMore ? comments.slice(0, limit) : comments

        const locale = cookies().get('NEXT_LOCALE')?.value || 'en'

        const translatedComments = await Promise.all(data.map(async (comment) => {
            let translatedContent = comment.content;
            let wasTranslated = false;
            let detectedLang = comment.originalLang || 'auto';

            if (comment.content && comment.originalLang && comment.originalLang !== locale && !comment.originalLang.startsWith(locale)) {
                const res = await translateWithCache(comment.content, locale, comment.originalLang);
                translatedContent = res.text;
                wasTranslated = res.wasTranslated;
                detectedLang = res.originalLang;
            }

            const translatedReplies = await Promise.all(comment.replies.map(async (reply) => {
                let rContent = reply.content;
                let rWasTranslated = false;
                let rDetectedLang = reply.originalLang || 'auto';

                if (reply.content && reply.originalLang && reply.originalLang !== locale && !reply.originalLang.startsWith(locale)) {
                    const rRes = await translateWithCache(reply.content, locale, reply.originalLang);
                    rContent = rRes.text;
                    rWasTranslated = rRes.wasTranslated;
                    rDetectedLang = rRes.originalLang;
                }

                return {
                    ...reply,
                    content: rContent,
                    wasTranslated: rWasTranslated,
                    detectedLang: rDetectedLang
                };
            }));

            return {
                ...comment,
                content: translatedContent,
                wasTranslated,
                detectedLang,
                replies: translatedReplies
            };
        }));

        return NextResponse.json({
            thread,
            comments: translatedComments,
            nextCursor: hasMore ? data[data.length - 1]?.id : null
        })
    } catch (error) {
        console.error('[TMDB_DISCUSSION_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
