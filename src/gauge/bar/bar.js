const d3 = require('d3');

module.exports = class Bar {
    constructor (parentSvg, config, r, redBar, orangeBar, changeTextColor){
        this.pi = Math.PI;
        this.cur_color = 'limegreen';
        this.cur_text_color = 'limegreen';
        this.new_text_color = 'black';
        this.changeTextColor = changeTextColor;
        this.max = 180;
        this.min = 0;
        this.current = 10;
        this.current = 10;
        this.currentFontSize = 50;
        this.redBar = redBar;
        this.orangeBar = orangeBar;
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
        let that = this;
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
        let segmentOffset = 45;
        let offset = 5;
        let gaugeCustomDeg = 20;
        let test = value - offset;
        test /= gaugeCustomDeg;
        return test * (this.config.maxAngle / segmentOffset) * Math.PI;
    }

    centerTextTranslation(yOffset) {
        let that = this;
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
        let that = this;
        let numPiEnd = this.convertScaleToRadians(newMax);// Get value
        let numPiStart = this.convertScaleToRadians(newMin);// Get value
        // let start = numPiEnd - 2;
        let diff = Math.abs(numPiEnd) - Math.abs(numPiStart);
        let startAndEnd = {
            start: numPiStart,
            end: numPiEnd
        };
        if (diff >= that.redBar) {
            that.new_color = 'red';
        } else if (diff >= that.orangeBar) {
            that.new_color = 'orange';
        } else {
            that.new_color = 'limegreen';
        }

        if (that.changeTextColor) {
            that.min.transition().duration(750).styleTween("fill", function () {
                return d3.interpolate(that.new_color, that.cur_color);
            }).text("MIN: " + that.rounder(newMin));

            that.max.transition().duration(750).styleTween("fill", function () {
                return d3.interpolate(that.new_color, that.cur_color);
            }).text("MAX: " + that.rounder(newMax));
        } else {
            let chanceColor = Math.random() * 10;
            that.new_text_color = chanceColor > 5 ? 'grey': 'black';
            that.min.transition().duration(750).styleTween("fill", function () {
                return d3.interpolate(that.new_text_color, that.cur_text_color);
            }).text("MIN: " + that.rounder(newMin));

            that.max.transition().duration(750).styleTween("fill", function () {
                return d3.interpolate(that.new_text_color, that.cur_text_color);
            }).text("MAX: " + that.rounder(newMax));
        }


        that.svgRenderedArc.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(that.new_color, that.cur_color);
        }).call(aTween, startAndEnd);
        // Set colors for next transition
        that.hold = that.cur_color;
        that.hold_text = that.cur_text_color;
        that.cur_color = that.new_color;
        that.cur_text_color = that.new_text_color;
        that.new_text_color = that.hold_text;

        function aTween(transition, newAngle) {
            return transition.attrTween("d", function (d) {
                let startInterpolate = d3.interpolate(d.startAngle, newAngle.start);
                let endInterpolate = d3.interpolate(d.endAngle, newAngle.end);
                return function (t) {
                    d.startAngle = startInterpolate(t);
                    d.endAngle = endInterpolate(t);
                    return that.barArc(d);
                };
            });
        }
    }
};
