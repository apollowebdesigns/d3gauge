const Gauge = require('./gauge/gauge');
const d3 = require('d3');

onDocumentReady();

function onDocumentReady() {
    let flag = false;
    let powerGauge = new Gauge('#power-Gauge', {
        size: 300,
        clipWidth: 300,
        clipHeight: 300,
        ringWidth: 20,
        maxValue: 10,
        transitionMs: 4000,
    });
    powerGauge.render();

    function updateReadings() {
        // just pump in random data here...

        let newValue = Math.random() * 20;
        powerGauge.update(newValue);
        powerGauge.updateBar(newValue, newValue - 2);
        if (newValue > 10) {
            powerGauge.updateLabels(20, 0);
            flag = true;
        } else if (newValue <= 10 && flag) {
            powerGauge.updateLabels(10, 0);
            flag = false;
        }
    }

    // every few seconds update reading values
    updateReadings();
    setInterval(function() {
        updateReadings();
    }, 5 * 1000);
}
