const d3 = require('d3');

module.exports = class Bar {
    constructor (parentSvg, config, r){
        this.pi = Math.PI;
        this.cur_color = 'limegreen';
        this.max = 180;
        this.min = 0;
        this.current = 10;
        this.current = 10;
        this.currentFontSize = 50;
        this.parentSvg = parentSvg;
        this.config = config;
        this.r = r;
        this.barArc = this.createGaugeArc();
        this.svgRenderedArc = this.addArcToSvgParent(parentSvg);
        this.max = this.renderMax(parentSvg);
        this.min = this.renderMin(parentSvg);
    }

    createGaugeArc() {
        return d3.arc()
            .innerRadius(this.r - this.config.ringWidth - this.config.ringInset)
            .outerRadius(this.r - this.config.ringInset);
    }

    centerTranslation() {
        var that = this;
        return 'translate('+ that.r +','+ that.r +')';
    }

    addArcToSvgParent(parentSvg) {
        return parentSvg.append('g')
            .attr('class', 'arc')
            .attr('transform', this.centerTranslation())
            .append("path")
            .datum({
                startAngle: -90 * (Math.PI / 180),
                endAngle: -90 * (Math.PI / 180)
            })
            .style("fill", 'red')
            .attr("d", this.barArc);
    }

    rounder(numb) {
        return Math.round(numb * 100) / 100
    }

    convertScaleToRadians(value) {
        var segmentOffset = 45;
        var offset = 5;
        var gaugeCustomDeg = 20;
        var test = value - offset;
        test /= gaugeCustomDeg;
        return test * (this.config.maxAngle / segmentOffset) * Math.PI;
    }

    centerTextTranslation(yOffset) {
        var that = this;
        return 'translate('+ that.r +','+ (that.r + yOffset)  +')';
    }

    renderMax(parentSvg) {
        return parentSvg.append("text").attr("transform", this.centerTextTranslation(this.currentFontSize + 22))
            .attr("text-anchor", "middle").style("font-family", "Helvetica").text(this.max);
    }

    renderMin(parentSvg) {
        return parentSvg.append("text").attr("transform", this.centerTextTranslation(this.currentFontSize + 44))
            .attr("text-anchor", "middle").style("font-family", "Helvetica").text(this.min);
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

        this.svgRenderedArc.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(this.new_color, this.cur_color);
        }).call(aTween, startAndEnd);
        // Set colors for next transition
        this.hold = this.cur_color;
        this.cur_color = this.new_color;
        this.new_color = this.hold;

        function aTween(transition, newAngle) {
            return transition.attrTween("d", function (d) {
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
