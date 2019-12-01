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

test('convert degrees to radians', () => {
    const newGauge = new Gauge('#power-Gauge', getConfig());
    res = newGauge.deg2rad(180);
    back = newGauge.rad2deg(3.141592653589793);

    expect(res).toBe(3.141592653589793);
    expect(back).toBe(180);
});

test('get new angle', () => {
    const newGauge = new Gauge('#power-Gauge', getConfig());
    res = newGauge.newAngle(180);

    expect(res).toBe(4725);
});

test('render', () => {
    let newGauge = new Gauge('#pwer-Gauge', getConfig());
    newGauge.render({});
    expect(true).toBe(true);
});
