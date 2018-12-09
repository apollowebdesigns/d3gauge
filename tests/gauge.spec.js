const Gauge = require('./../src/gauge/gauge');
const getConfig = require('./mocks/config.mock');

test('the centre should be 100, 100', () => {
    let newGauge = new Gauge('#power-Gauge', getConfig());

    expect(newGauge.centerTranslation()).toBe("translate(100,100)");
});

test('the centre should be 100, 100', () => {
    let newGauge = new Gauge('#power-Gauge', getConfig());

    expect(newGauge.isRendered()).toBe(false);
});