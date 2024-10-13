const Apify = require('apify');
const puppeteer = require('puppeteer');

Apify.main(async () => {
    // Log do caminho do Chromium
    console.log('Caminho do Chromium:', puppeteer.executablePath());

    // Iniciando o navegador com opções apropriadas
    const browser = await puppeteer.launch({
        executablePath: puppeteer.executablePath(),  // Caminho do Chromium
        headless: true,  // Executar em modo headless
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Argumentos necessários
    });

    const page = await browser.newPage();
    
    // Obtenha o usuário a partir da entrada do Apify
    const input = await Apify.getInput();
    const username = input.username;

    // Acesse a página do Twitter do usuário
    await page.goto(`https://twitter.com/${username}`, { waitUntil: 'networkidle2' });
    
    // Capturar o título da página
    const title = await page.title();
    console.log('Título da página:', title);

    // Aqui você pode adicionar mais lógica para extrair os dados que deseja
    // ...

    // Fechar o navegador
    await browser.close();
});
