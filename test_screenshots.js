const puppeteer = require('puppeteer-core');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const artifactsDir = 'C:\\\\Users\\\\Themis\\\\.gemini\\\\antigravity\\\\brain\\\\c973ac89-7754-4180-a84e-6348c6e74cfc\\\\';

(async () => {
    try {
        console.log('Seeding database...');
        // Create a test user
        const user = await prisma.user.upsert({
            where: { email: 'screenshot@test.com' },
            update: {},
            create: { email: 'screenshot@test.com', name: 'Screenshot Tester', username: 'screenshot_tester', role: 'USER' }
        });

        // Ensure a discussion thread exists for 27205 (Inception)
        const thread = await prisma.discussionThread.upsert({
            where: { id: 'test_thread_inception' },
            update: {},
            create: { id: 'test_thread_inception', tmdbId: '27205', mediaTitle: 'Inception', mediaType: 'MOVIE' }
        });

        // Create a comment
        await prisma.comment.create({
            data: {
                userId: user.id,
                discussionThreadId: thread.id,
                content: "I absolutely love the concept of dreams within dreams. This movie is a masterpiece!",
                originalLang: "en"
            }
        });
        
        console.log('Database seeded.');

        console.log('Taking screenshots...');
        const browser = await puppeteer.launch({
            executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
            headless: 'new',
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1000 });

        // English screenshot
        await page.setCookie({ name: 'NEXT_LOCALE', value: 'en', domain: 'localhost' });
        await page.goto('http://localhost:3000/media/27205?type=MOVIE', { waitUntil: 'networkidle0' });
        await page.evaluate(() => window.scrollBy(0, 800));
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: artifactsDir + 'comment_en.png' });
        console.log('EN screenshot saved.');

        // Turkish screenshot
        await page.setCookie({ name: 'NEXT_LOCALE', value: 'tr', domain: 'localhost' });
        await page.goto('http://localhost:3000/media/27205?type=MOVIE', { waitUntil: 'networkidle0' });
        await page.evaluate(() => window.scrollBy(0, 800));
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: artifactsDir + 'comment_tr.png' });
        console.log('TR screenshot saved.');

        await browser.close();
        await prisma.$disconnect();
        console.log('Done.');
    } catch (err) {
        console.error(err);
    }
})();
