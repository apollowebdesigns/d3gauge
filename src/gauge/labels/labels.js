import * as d3 from "d3";

export default class Labels {
    constructor (parentSvg, config, ticks){
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
        const lg = parentSvg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        return lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                var ratio = that.scale(d);
                var newAngle = config.minAngle + (ratio * that.range);
                return 'rotate(' + newAngle +') translate(0,' +(config.labelInset - that.r) +')';
            })
            .text(that.config.labelFormat);
    }
}