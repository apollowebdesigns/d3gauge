const { spawn } = require('child_process');
const { BeforeAll, AfterAll, Given, When, Then} = require('cucumber');
const {expect} = require('chai');
const puppeteer = require('puppeteer');

// set up worker threads for new communications
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();

let context = {};

let server;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

BeforeAll(async function () {
    // start server
    server = spawn('npx', ['webpack-dev-server']);
    server.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });


    port1.on('message', (message) => console.log('a work', message));
    port2.postMessage({ foo: 'bar' });
    browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('http://localhost:9000');
    console.log('done');
});

AfterAll(async function () {
    server.kill('SIGINT');
    await browser.close();
});

Given(/^I am on a page$/, async function () {
    await page.screenshot({path: 'example.png'});
    console.log('what is the gauge on the page');
    console.log('done');
});

When(/^I see a gauge$/, async function () {
    const bodyHandle = await page.$('body');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    await bodyHandle.dispose();
    expect(JSON.stringify(html)).to.not.equal(null);
});

Then(/^I have a gauge$/, async function () {
    const svgHandle = await page.$('svg');
    context.testGauge = await page.evaluate(svg => svg.innerHTML, svgHandle);
    await svgHandle.dispose();
    console.log(JSON.stringify(context.testGauge));
    console.log('done');
});

Then(/^I wait for an age$/, async function () {
    await sleep(3000);
});

Then(/^I have updated the gauge$/, async function () {
    const svgHandle = await page.$('svg');
    const html = await page.evaluate(svg => svg.innerHTML, svgHandle);
    await svgHandle.dispose();
    const updatedGauge = JSON.stringify(html);
    console.log(context.testGauge);
    console.log(updatedGauge);
    expect(updatedGauge).not.to.equal(JSON.stringify(context.testGauge));
});
