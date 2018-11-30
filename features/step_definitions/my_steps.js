const {BeforeAll, AfterAll, Given, When, Then} = require('cucumber');
const puppeteer = require('puppeteer');

BeforeAll(async function () {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:9000');
    console.log('done');
});

AfterAll(async function () {
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