import Gauge from './../src/gauge/gauge';
import getConfig from './mocks/config.mock';

test('the centre should be 100, 100', () => {
    let newGauge = new Gauge('#power-Gauge', getConfig());

    expect(newGauge.centerTranslation()).toBe("translate(100,100)");
});