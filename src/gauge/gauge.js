const d3 = require('d3');
const Bar = require('./bar/bar');
const Pointer = require("./pointer/pointer");
const Labels = require("./labels/labels");

module.exports = class Gauge {
    constructor (container, configuration){
        this.config = {
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
        this.range = undefined;
        this.r = undefined;
        this.pointerHeadLength = undefined;
        this.value = 0;

        this.svg = undefined;
        this.arc = undefined;
        this.arcs = undefined;
        this.foregroundArc = undefined;
        this.backgroundArc = undefined;
        this.scale = undefined;
        this.ticks = undefined;
        this.tickData = undefined;
        this.pointer = undefined;

        this.pi = Math.PI;
        this.cur_color = 'limegreen';
        this.max = 180;
        this.min = 0;
        this.current = 10;
        this.current = 10;

        this.oR = 100;
        this.iR = 100 - this.config.ringWidth;

        this.donut = d3.scaleLinear();

        this.container = container;
        this.configure(configuration);
        this.redBar = (30 / 360) * 2 * Math.PI;
        this.orangeBar = (15 / 360) * 2 * Math.PI;
        this.changeTextColor = false;
        this.formatTicks = d3.format('.0f');
    }

    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    rad2deg(rad) {
        return rad * 180 / Math.PI;
    }

    newAngle(d) {
        let that = this;
        let ratio = that.scale(d);
        let newAng = that.config.minAngle + (ratio * that.range);
        return newAng;
    }

    configure(configuration) {
        let that = this;
        let prop = undefined;
        for ( prop in configuration ) {
            this.config[prop] = configuration[prop];
        }

        this.range = this.config.maxAngle - this.config.minAngle;
        this.r = this.config.size / 2;
        this.pointerHeadLength = Math.round(this.r * this.config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        this.scale = d3.scaleLinear()
            .range([0,1])
            .domain([this.config.minValue, this.config.maxValue]);

        this.ticks = this.scale.ticks(this.config.majorTicks);
        this.tickData = d3.range(this.config.majorTicks).map(function() {return 1/that.config.majorTicks;});

        that.arc = d3.arc()
            .innerRadius(that.r - that.config.ringWidth - that.config.ringInset)
            .outerRadius(that.r - that.config.ringInset)
            .startAngle(function(d, i) {
                let ratio = d * i;
                return that.deg2rad(that.config.minAngle);
            })
            .endAngle(function(d, i) {
                let ratio = d * (i+1);
                return that.deg2rad(that.config.maxAngle);
            });
    }

    centerTranslation() {
        let that = this;
        return 'translate('+ that.r +','+ that.r +')';
    }

    isRendered() {
        let that = this;
        return (that.svg !== undefined);
    }

    addBackgroundArcToSvgParent(parentSvg) {
        return parentSvg.append('g')
            .attr('class', 'arc')
            .attr('transform', this.centerTranslation())
            .append("path")
            .datum({
                startAngle: -90 * (Math.PI / 180),
                endAngle: -90 * (Math.PI / 180)
            })
            .style("fill", 'red')
            .attr("d", this.arc);
    }

    render(newValue) {
        let that = this;
        that.svg = d3.select(that.container)
            .append('svg:svg')
            .attr('class', 'Gauge')
            .attr('width', that.config.clipWidth)
            .attr('height', that.config.clipHeight)
            .append('g');

        that.arcs = new Bar(that.svg, that.config, that.r, that.redBar, that.orangeBar, that.changeTextColor);
        that.labels = new Labels(that.svg, that.config, that.ticks);
        that.pointer = new Pointer(that.svg, that.config, that.r);
    }

    update(newValue) {
        this.pointer.update(newValue);
    }

    updateBar(newMax, newMin) {
        this.arcs.update(newMax, newMin);
    }

    updateLabels(newMax, newMin){
        this.labels.update(newMax, newMin);
    }
};
