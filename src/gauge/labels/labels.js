import * as d3 from "d3";

export default class Labels {
    constructor (parentSvg, config, ticks){
        this.parentSvg = parentSvg;
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
            .attr('class', 'label-text')
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

    removeLabels() {
        this.parentSvg
            .selectAll(".label-text")
            .remove('text')
    }

    update(newMax, newMin) {
        var that = this;

        function random(min, max){
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        let newScale = d3.scale.linear()
            .range([0,1]).domain([0, newMax]);

        let newTicks = newScale.ticks(newMax);

        let tickDataObject = {
            past: that.ticks,
            future: newTicks
        }

        d3.interpolate(that.lg, newLabs());


        function newLabs() {
            that.removeLabels();
            that.scale = that.createScale({
                minValue: 0,
                maxValue: newMax
            })
            that.createLabelArc(that.parentSvg, that.config, newTicks);
        }


        // this.parentSvg.selectAll(".label-text")
        //     .data(newTicks)
        //     // .append('text')
        //     .transition()
        //     .duration(1000)
        //     .attr("transform", function(d) {
        //         var ratio = newScale(d);
        //         var newAngle = that.config.minAngle + (ratio * that.range);
        //         return 'rotate(' + newAngle +') translate(0,' +(that.config.labelInset - that.r) +')';
        //     })
        //     .text(that.config.labelFormat);

        // that.scale.range([0,1]).domain([0, newMax]);
        // this.parentSvg.selectAll(".label-text")
        //     .transition()
        //     .call(that.scale)

        // function labelTween(transition, newScale) {
        //     return transition.attrTween("transform", function (d) {
        //         // Todo change start and end angles to start and end labels
        //         console.log('what is d?');
        //         console.log(d);
        //         var interpolate = d3.interpolate(that.scale, newScale);
        //         return function (t) {
        //             d = interpolate(t);
        //             return that.createLabelArc(that.parentSvg, that.config, d);
        //         };
        //     });
        // }
    }
}