import * as d3 from "d3";

export default class Labels {
    constructor (parentSvg, config, ticks){
        this.lg = undefined;
        this.r = config.size / 2;
        this.config = config;
        this.range = this.config.maxAngle - this.config.minAngle;
        this.scale = this.createScale(config);
        this.createLabelArc(parentSvg, config, ticks);
    }

    centerTranslation() {
        var that = this;
        return 'translate('+ that.r +','+ that.r +')';
    }

    createScale(config) {
        return d3.scale.linear()
            .range([0,1])
            .domain([config.minValue, config.maxValue]);
    }

    createLabelArc(parentSvg, config, ticks) {
        const that = this;
        var centerTx = that.centerTranslation();
        this.lg = parentSvg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        return this.lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                var ratio = that.scale(d);
                var newAngle = config.minAngle + (ratio * that.range);
                return 'rotate(' + newAngle +') translate(0,' +(config.labelInset - that.r) +')';
            })
            .text(that.config.labelFormat);
    }

    convertScaleToRadians(value) {
        var segmentOffset = 45;
        var offset = 5;
        var gaugeCustomDeg = 20;
        var test = value - offset;
        test /= gaugeCustomDeg;
        return test * (this.config.maxAngle / segmentOffset) * Math.PI;
    }

    update(newMax, newMin) {
        var that = this;
        var numPiEnd = this.convertScaleToRadians(newMax);// Get value
        var numPiStart = this.convertScaleToRadians(newMin);// Get value
        // var start = numPiEnd - 2;
        var diff = Math.abs(numPiEnd) - Math.abs(numPiStart);
        var startAndEnd = {
            start: numPiStart,
            end: numPiEnd
        };
        if (diff >= (30 / 360) * 2 * Math.PI) {
            this.new_color = 'red';
        } else if (diff >= (15 / 360) * 2 * Math.PI) {
            this.new_color = 'orange';
        } else {
            this.new_color = 'limegreen';
        }

        this.min.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(this.new_color, this.cur_color);
        }).text("MIN: " + this.rounder(newMin));

        this.max.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(this.new_color, this.cur_color);
        }).text("MAX: " + this.rounder(newMax));

        this.lg.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(this.new_color, this.cur_color);
        }).call(aTween, startAndEnd);
        // Set colors for next transition
        this.hold = this.cur_color;
        this.cur_color = this.new_color;
        this.new_color = this.hold;

        function aTween(transition, newAngle) {
            return transition.attrTween("d", function (d) {
                // Todo change start and end angles to start and end labels
                var startInterpolate = d3.interpolate(d.startAngle, newAngle.start);
                var endInterpolate = d3.interpolate(d.endAngle, newAngle.end);
                return function (t) {
                    d.startAngle = startInterpolate(t);
                    d.endAngle = endInterpolate(t);
                    return that.barArc(d);
                };
            });
        }
    }
}