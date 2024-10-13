const Apify = require('apify');
const { PuppeteerCrawler } = require('crawlee');

Apify.main(async () => {
    const input = await Apify.getInput();
    const username = input.username;

    if (!username) {
        throw new Error('Please provide a username in the input.');
    }

    const crawler = new PuppeteerCrawler({
        launchPuppeteerOptions: {
            headless: true,
        },
        handleRequestFunction: async ({ request }) => {
            console.log(`Crawling user: ${username}`);
            // Adicione aqui a lógica para acessar e raspar os dados do Twitter
            // Por exemplo, navegue até a URL do perfil do Twitter e colete as informações necessárias
        },
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request failed: ${request.url}`);
        },
    });

    // Adiciona a URL do perfil do Twitter para a fila de requisições
    await crawler.addRequest({ url: `https://twitter.com/${username}` });

    // Inicia o crawler
    await crawler.run();
});
