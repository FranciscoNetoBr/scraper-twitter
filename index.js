const Apify = require('apify');
const { PuppeteerCrawler } = require('crawlee');

Apify.main(async () => {
    console.log('Iniciando o scraper');
    try {
        const input = await Apify.getInput();
        console.log('Input recebido:', input);

        const { username } = input;
        if (!username) {
            throw new Error('Username não fornecido no input');
        }

        console.log(`Iniciando scraper para o usuário: ${username}`);

        const crawler = new PuppeteerCrawler({
            launchPuppeteerOptions: {
                headless: true,
            },
            async requestHandler({ page, request }) {
                console.log(`Acessando ${request.url}`);
                await page.goto(request.url, { waitUntil: 'networkidle2' });

                // Rolar a página para carregar mais tweets
                console.log('Iniciando rolagem da página');
                let previousHeight;
                for (let i = 0; i < 5; i++) {
                    previousHeight = await page.evaluate(() => document.body.scrollHeight);
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(2000);
                    console.log(`Rolagem ${i + 1} concluída`);
                    const newHeight = await page.evaluate(() => document.body.scrollHeight);
                    if (newHeight === previousHeight) {
                        console.log('Não há mais conteúdo para carregar');
                        break;
                    }
                }

                // Extrair os links de vídeos
                console.log('Extraindo links de vídeos');
                const videoLinks = await page.evaluate(() => {
                    const videoTweetNodes = document.querySelectorAll('article a[role="link"]');
                    return Array.from(videoTweetNodes)
                        .filter(node => node.href.includes('video'))
                        .map(node => node.href);
                });

                console.log(`Vídeos encontrados: ${videoLinks.length}`);
                console.log('Links de vídeos:', videoLinks);

                // Salvar os links no dataset do Apify
                await Apify.pushData({ videoLinks });
            },
            async failedRequestHandler({ request }) {
                console.log(`Request ${request.url} falhou`);
            },
        });

        // Adiciona a URL do perfil do Twitter para a fila de requisições
        await crawler.addRequests([{ url: `https://twitter.com/${username}` }]);

        // Inicia o crawler
        await crawler.run();
        
        console.log('Scraper concluído com sucesso');
    } catch (error) {
        console.error('Erro durante a execução do scraper:', error);
        throw error;
    }
});