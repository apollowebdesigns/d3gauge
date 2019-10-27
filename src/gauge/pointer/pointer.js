const d3 = require('d3');

module.exports = class Pointer {
    constructor (parentSvg, config, r){
        this.currentFontSize = 50;
        this.config = config;
        this.r = r;

        this.range = this.config.maxAngle - this.config.minAngle;
        this.scale = this.createScale(config);

        this.current = this.renderCurrent(parentSvg);

        this.pointerHeadLength = Math.round(this.r * this.config.pointerHeadLengthPercent);

        let pointerLine = this.makePointerLine();

        let pg = this.addArcToSvgParent(parentSvg);

        this.pointer = pg.append('path')
            .attr('d', pointerLine)
            .attr('transform', 'rotate(' + this.config.minAngle +')');
    }

    centerTranslation() {
        var that = this;
        return 'translate('+ that.r +','+ that.r +')';
    }

    makePointerLine() {
        return d3.line().curve(d3.curveMonotoneX);
    }

    addArcToSvgParent(parentSvg) {
        var lineData = [ [this.config.pointerWidth / 2, 0],
            [0, -this.pointerHeadLength],
            [-(this.config.pointerWidth / 2), 0],
            [0, this.config.pointerTailLength],
            [this.config.pointerWidth / 2, 0] ];

        return parentSvg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', this.centerTranslation());
    }

    rounder(numb) {
        return Math.round(numb * 100) / 100
    }

    centerTextTranslation(yOffset) {
        var that = this;
        return 'translate('+ that.r +','+ (that.r + yOffset)  +')';
    }

    renderCurrent(parentSvg) {
        return parentSvg.append("text").attr("transform", this.centerTextTranslation(this.currentFontSize))
            .attr("text-anchor", "middle").style("font-size", this.currentFontSize).style("font-family", "Helvetica").text(this.current);
    }

    createScale(config) {
        return d3.scaleLinear()
            .range([0,1])
            .domain([config.minValue, config.maxValue]);
    }

    update(newValue) {
        const ratio = this.scale(newValue);
        const newAngle = this.config.minAngle + (ratio * this.range);
        this.pointer.transition()
            .duration(this.config.transitionMs)
            .ease(d3.easeElastic)
            .attr('transform', 'rotate(' + newAngle +')');

        this.current.transition().text(this.rounder(newValue));
    }
};
