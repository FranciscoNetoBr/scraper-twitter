const Apify = require('apify');

Apify.main(async () => {
    try {
        const { username } = await Apify.getInput();  // Parâmetro de entrada para o ator (o nome de usuário do X)
        const browser = await Apify.launchPuppeteer();
        const page = await browser.newPage();

        // Acesse a página do perfil do usuário no X (Twitter)
        await page.goto(`https://twitter.com/${username}`, { waitUntil: 'networkidle2' });

        // Rolar a página para carregar mais tweets
        let previousHeight;
        while (true) {
            previousHeight = await page.evaluate(() => document.body.scrollHeight);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await Apify.utils.sleep(2000);  // Aguardar carregar novos tweets
            const newHeight = await page.evaluate(() => document.body.scrollHeight);
            if (newHeight === previousHeight) break;  // Parar quando não carregar mais tweets
        }

        // Extrair os links de vídeos
        const videoLinks = await page.evaluate(() => {
            const videoTweetNodes = document.querySelectorAll('article a[role="link"]');
            const links = [];
            videoTweetNodes.forEach((node) => {
                if (node.href.includes('video')) {
                    links.push(node.href);
                }
            });
            return links;
        });

        console.log(`Vídeos encontrados: ${videoLinks.length}`);
        console.log(videoLinks);

        // Salvar os links no dataset do Apify
        await Apify.pushData({ videoLinks });

        await browser.close();
    } catch (error) {
        console.log('Erro durante a execução do scraper:', error);
        process.exit(1);
    }
});
 
