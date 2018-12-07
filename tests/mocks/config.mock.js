const d3 = require('d3');

const config = {
    size						: 200,
    clipWidth					: 200,
    clipHeight					: 110,
    ringInset					: 20,
    ringWidth					: 20,

    pointerWidth				: 10,
    pointerTailLength			: 5,
    pointerHeadLengthPercent	: 0.9,

    minValue					: 0,
    maxValue					: 10,

    minAngle					: -90 - 45,
    maxAngle					: 90 + 45,

    transitionMs				: 750,

    majorTicks					: 10,
    labelFormat					: d3.format(',g'),
    labelInset					: 10,

    arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
};

module.exports = function getConfig() {
    return config;
};