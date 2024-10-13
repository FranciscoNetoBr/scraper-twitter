const Apify = require('apify');

Apify.main(async () => {
    const input = await Apify.getInput();
    const username = input.username;

    // Verifica se o username foi fornecido
    if (!username) {
        throw new Error('Por favor, forneça um username.');
    }

    // Inicializa o request queue
    const requestQueue = await Apify.openRequestQueue();

    // Adiciona a URL do perfil do Twitter à fila
    await requestQueue.addRequest({ url: `https://twitter.com/${username}` });

    // Inicia o crawler
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handleRequestFunction: async ({ request, $ }) => {
            // Extrai informações da página usando jQuery
            const title = $('title').text();
            console.log('Título da página:', title);

            // Aqui você pode adicionar mais lógica para extrair dados
            // Por exemplo, tweets, likes, etc.
        },
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Falhou ao processar ${request.url}`);
        },
    });

    // Inicia o crawler
    await crawler.run();
});
