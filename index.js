const Apify = require('apify');

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

        const browser = await Apify.launchPuppeteer();
        console.log('Navegador lançado');

        const page = await browser.newPage();
        console.log('Nova página aberta');

        console.log(`Acessando https://twitter.com/${username}`);
        await page.goto(`https://twitter.com/${username}`, { waitUntil: 'networkidle2' });
        console.log('Página carregada');

        // Rolar a página para carregar mais tweets
        console.log('Iniciando rolagem da página');
        let previousHeight;
        for (let i = 0; i < 10; i++) {  // Aumentei o número de rolagens para capturar mais tweets
            previousHeight = await page.evaluate(() => document.body.scrollHeight);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await Apify.utils.sleep(3000); // Aumentei o tempo de espera entre as rolagens
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
            const videoTweetNodes = document.querySelectorAll('article div[data-testid="tweet"] a[role="link"]');
            console.log('Nodes encontrados:', videoTweetNodes.length);

            // Exibindo conteúdo do tweet encontrado (apenas para análise)
            videoTweetNodes.forEach((node, index) => {
                console.log(`Tweet ${index + 1}:`, node.innerHTML);
            });

            return Array.from(videoTweetNodes)
                .filter(node => node.querySelector('video')) // Garante que a postagem contém um vídeo
                .map(node => node.href);
        });

        console.log(`Vídeos encontrados: ${videoLinks.length}`);
        console.log('Links de vídeos:', videoLinks);

        // Exibir os links extraídos na tela
        videoLinks.forEach(link => console.log(link));

        // Salvar os links no dataset do Apify
        console.log('Salvando dados no dataset do Apify');
        await Apify.pushData({ videoLinks });

        await browser.close();
        console.log('Navegador fechado');
        
        console.log('Scraper concluído com sucesso');
    } catch (error) {
        console.error('Erro durante a execução do scraper:', error);
        throw error;
    }
});
