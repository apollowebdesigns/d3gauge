const d3 = require('d3');

module.exports = class Labels {
    constructor(parentSvg, config, ticks) {
        this.parentSvg = parentSvg;
        // values to handle the labels that need to be deleted!
        this.oldTicks = [];
        this.rejects = [];

        this.min = config.minValue;
        this.max = config.maxValue;
        this.lg = undefined;
        this.r = config.size / 2;
        this.config = config;
        this.ticks = ticks;
        this.range = this.config.maxAngle - this.config.minAngle;
        this.scale = this.createScale(config);
        this.createLabelArc(parentSvg, config, ticks);
    }

    centerTranslation() {
        let that = this;
        return 'translate(' + that.r + ',' + that.r + ')';
    }

    createScale(config) {
        return d3.scaleLinear()
            .range([0, 1])
            .domain([config.minValue, config.maxValue]);
    }

    createLabelArc(parentSvg, config, ticks) {
        const that = this;
        let centerTx = that.centerTranslation();
        this.lg = parentSvg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        console.log(ticks);
        return this.createLabels(config, ticks);
    }

    createLabels(config, ticks) {
        const that = this;
        return that.lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('class', 'label-text')
            .attr('transform', function (d) {
                let ratio = that.scale(d);
                let newAngle = config.minAngle + (ratio * that.range);
                return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - that.r) + ')';
            })
            .text(that.config.labelFormat);
    }

    convertScaleToRadians(value) {
        let segmentOffset = 45;
        let offset = 5;
        let gaugeCustomDeg = 20;
        let test = value - offset;
        test /= gaugeCustomDeg;
        return test * (this.config.maxAngle / segmentOffset) * Math.PI;
    }


    async update(newMax, newMin) {
        let that = this;

        function random(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        let newScale = d3.scaleLinear()
            .range([0, 1]).domain([0, newMax]);

        let newTicks = newScale.ticks(newMax);

        that.rejects = that.oldTicks.filter((el) => !newTicks.includes(el));
        console.log('what are the rejects?');
        console.log(that.rejects);

        // if new value greater than original, append new blank text until the new value is reached
        that.createLabels(that.config, newTicks);
        // TODO factor this out to make it's own function
        await that.moveCurrentLabels(that, newMax, newScale, newTicks);

        that.removeOldLabels(that, newMax);
        that.oldTicks = newTicks
    }

    async moveCurrentLabels(that, newMax, newScale, newTicks) {
        return await that.parentSvg.selectAll(".label-text")
            .data(newTicks)
            .transition()
            .duration(1000)
            // d is the amount of text elements
            .attr("transform", function (d) {
                let ratio = newScale(d);
                let newAngle = that.config.minAngle + (ratio * that.range);
                return 'rotate(' + newAngle + ') translate(0,' + (that.config.labelInset - that.r) + ')';
            })
            .attr("visibility", function (d) {
                if (d > newMax) {
                    return 'hidden';
                }
                return 'visible';
            })
            .text(that.config.labelFormat)
            .end();
    }

    async removeOldLabels(that, newMax) {
        return await that.parentSvg.selectAll(".label-text")
            .data(that.oldTicks)
            .transition()
            .duration(200)
            .attr("visibility", function (d) {
                console.log('removing rejects');
                console.log(d);
                console.log(newMax);
                if (that.rejects.includes(d)) {
                    return 'hidden';
                }
                return 'visible';
            })
            .text(that.config.labelFormat)
            .end();
    }
};
