const { spawn } = require('child_process');
const {BeforeAll, AfterAll, Given, When, Then} = require('cucumber');
const puppeteer = require('puppeteer');

// set up worker threads for new communications
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();

let server;

BeforeAll(async function () {
    // start server
    server = spawn('http-server', ['-p', 9000]);
    server.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });


    port1.on('message', (message) => console.log('a work', message));
    port2.postMessage({ foo: 'bar' });
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:9000');
    console.log('done');
});

AfterAll(async function () {
    server.kill('SIGINT');
    await browser.close();
});

Given(/^I am on a page$/, async function () {
    await page.screenshot({path: 'example.png'});
    console.log('done');
});

When(/^I have a gauge$/, async function () {
    const svgHandle = await page.$('svg');
    const html = await page.evaluate(svg => svg.innerHTML, svgHandle);
    await svgHandle.dispose();
    console.log(JSON.stringify(html));
    console.log('done');
});

Then(/^I see a gauge$/, function () {
    console.log('done');
});