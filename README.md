# D3 gauge

A simple gauge that uses d3.

You can have maximum and minimum values stored in this gauge.

## Example gauge

![an example gauge image not here](gaugeexample.png)

## Example code

Here is an example code snippet:

```javascript
var gauge = new Gauge('#power-Gauge', {
    size: 300,
    clipWidth: 300,
    clipHeight: 300,
    ringWidth: 60,
    maxValue: 10,
    transitionMs: 4000
});
gauge.render();
```

## Full range of config settings

```javascript
{
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
}
```