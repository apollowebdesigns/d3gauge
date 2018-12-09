const Gauge = require('./gauge/gauge');
const d3 = require('d3');

onDocumentReady();

function onDocumentReady() {
    var powerGauge = new Gauge('#power-Gauge', {
        size: 300,
        clipWidth: 300,
        clipHeight: 300,
        ringWidth: 60,
        maxValue: 10,
        transitionMs: 4000,
    });
    powerGauge.render();

    function updateReadings() {
        // just pump in random data here...
        var newValue = Math.random() * 10;
        var newValue = 15;
        powerGauge.update(newValue);
        powerGauge.updateBar(newValue, newValue - 1);
    }

    // every few seconds update reading values
    updateReadings();
    setInterval(function() {
        updateReadings();
    }, 5 * 1000);
}
