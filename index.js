const Apify = require('apify');

Apify.main(async () => {
    const { username } = await Apify.getInput();
    console.log(`Iniciando scraper para o usuário: ${username}`);

    if (!username) {
        throw new Error('Username não fornecido no input');
    }

    let browser;
    try {
        browser = await Apify.launchPuppeteer();
        const page = await browser.newPage();

        console.log(`Acessando https://twitter.com/${username}`);
        await page.goto(`https://twitter.com/${username}`, { waitUntil: 'networkidle2' });

        // Rolar a página para carregar mais tweets
        let previousHeight;
        for (let i = 0; i < 5; i++) {  // Limita a 5 rolagens para evitar loops infinitos
            previousHeight = await page.evaluate(() => document.body.scrollHeight);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await Apify.utils.sleep(2000);
            const newHeight = await page.evaluate(() => document.body.scrollHeight);
            if (newHeight === previousHeight) break;
        }

        // Extrair os links de vídeos
        const videoLinks = await page.evaluate(() => {
            const videoTweetNodes = document.querySelectorAll('article a[role="link"]');
            return Array.from(videoTweetNodes)
                .filter(node => node.href.includes('video'))
                .map(node => node.href);
        });

        console.log(`Vídeos encontrados: ${videoLinks.length}`);
        console.log(videoLinks);

        // Salvar os links no dataset do Apify
        await Apify.pushData({ videoLinks });

    } catch (error) {
        console.error('Erro durante a execução do scraper:', error);
        throw error;  // Relança o erro para que o Apify possa registrá-lo
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});