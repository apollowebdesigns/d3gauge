class gauge {
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

            minAngle					: -90,
            maxAngle					: 90,

            transitionMs				: 750,

            majorTicks					: 5,
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

        this.oR = 100;
        this.iR = 100 - this.config.ringWidth;

        this.donut = d3.layout.pie();

        this.container = container;
        this.configure(configuration);
    }

    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    rad2deg(rad) {
        return rad * 180 / Math.PI;
    }

    newAngle(d) {
        var that = this;
        var ratio = that.scale(d);
        var newAng = that.config.minAngle + (ratio * that.range);
        return newAng;
    }

    configure(configuration) {
        var that = this;
        var prop = undefined;
        for ( prop in configuration ) {
            this.config[prop] = configuration[prop];
        }

        this.range = this.config.maxAngle - this.config.minAngle;
        this.r = this.config.size / 2;
        this.pointerHeadLength = Math.round(this.r * this.config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        this.scale = d3.scale.linear()
            .range([0,1])
            .domain([this.config.minValue, this.config.maxValue]);

        this.ticks = this.scale.ticks(this.config.majorTicks);
        this.tickData = d3.range(this.config.majorTicks).map(function() {return 1/that.config.majorTicks;});

        that.arc = d3.svg.arc()
            .innerRadius(that.r - that.config.ringWidth - that.config.ringInset)
            .outerRadius(that.r - that.config.ringInset)
            .startAngle(function(d, i) {
                var ratio = d * i;
                return that.deg2rad(that.config.minAngle);
            })
            .endAngle(function(d, i) {
                var ratio = d * (i+1);
                return that.deg2rad(that.config.maxAngle);
            });

        that.foregroundArc = d3.svg.arc()
            .innerRadius(that.r - that.config.ringWidth - that.config.ringInset)
            .outerRadius(that.r - that.config.ringInset);
    }

    centerTranslation() {
        var that = this;
        return 'translate('+ that.r +','+ that.r +')';
    }

    centerTextTranslation(yOffset) {
        var that = this;
        return 'translate('+ that.r +','+ (that.r + yOffset)  +')';
    }

    isRendered() {
        var that = this;
        return (that.svg !== undefined);
    }

    render(newValue) {
        var that = this;
        that.svg = d3.select(that.container)
            .append('svg:svg')
            .attr('class', 'gauge')
            .attr('width', that.config.clipWidth)
            .attr('height', that.config.clipHeight)
            .append('g');

        var centerTx = that.centerTranslation();
        var centerText = that.centerTextTranslation();

        that.arcs = that.svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx)
            .append("path")
            .datum({
                startAngle: -90 * (Math.PI / 180),
                endAngle: -90 * (Math.PI / 180)
            })
            .style("fill", 'red')
            .attr("d", that.foregroundArc);

        var currentFontSize = 50;

        that.max = that.svg.append("text").attr("transform", that.centerTextTranslation(currentFontSize + 22)) // Display Max value
            .attr("text-anchor", "middle").style("font-family", "Helvetica").text(that.max) ;// Set between inner and outer Radius

        that.min = that.svg.append("text").attr("transform", that.centerTextTranslation(currentFontSize + 44)) // Set between inner and outer Radius
            .attr("text-anchor", "middle").style("font-family", "Helvetica").text(that.min);

        that.current = that.svg.append("text").attr("transform", that.centerTextTranslation(currentFontSize)) // Push up from center 1/4 of innerRadius
            .attr("text-anchor", "middle").style("font-size", currentFontSize).style("font-family", "Helvetica").text(that.current);

        var lg = that.svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        lg.selectAll('text')
            .data(that.ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                var ratio = that.scale(d);
                var newAngle = that.config.minAngle + (ratio * that.range);
                return 'rotate(' + newAngle +') translate(0,' +(that.config.labelInset - that.r) +')';
            })
            .text(that.config.labelFormat);

        var lineData = [ [that.config.pointerWidth / 2, 0],
            [0, -that.pointerHeadLength],
            [-(that.config.pointerWidth / 2), 0],
            [0, that.config.pointerTailLength],
            [that.config.pointerWidth / 2, 0] ];
        var pointerLine = d3.svg.line().interpolate('monotone');
        var pg = that.svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        that.pointer = pg.append('path')
            .attr('d', pointerLine)
            .attr('transform', 'rotate(' + that.config.minAngle +')');

        that.update(newValue === undefined ? 0 : newValue);
    }

    update(newValue, newConfiguration) {
        var that = this;
        if ( newConfiguration  !== undefined) {
            that.configure(newConfiguration);
        }
        var ratio = that.scale(newValue);
        var newAngle = that.config.minAngle + (ratio * that.range);
        that.pointer.transition()
            .duration(that.config.transitionMs)
            .ease('elastic')
            .attr('transform', 'rotate(' + newAngle +')');

        that.current.transition().text(Math.round(newValue * 100) / 100);
    }

    convertScaleToRadians(value) {
        var that = this;
        var offset = 5;
        var gaugeCustomDeg = 20;
        var test = value - offset;
        test /= gaugeCustomDeg;
        return test * 2 * that.pi;
    }

    updateBar(newMax, newMin) {
        var that = this;
        var numPiEnd = that.convertScaleToRadians(newMax);// Get value
        var numPiStart = that.convertScaleToRadians(newMin);// Get value
        // var start = numPiEnd - 2;
        var diff = Math.abs(numPiEnd) - Math.abs(numPiStart);
        var startAndEnd = {
            start: numPiStart,
            end: numPiEnd
        };
        if (diff >= (30 / 360) * 2 * Math.PI) {
            that.new_color = 'red';
        } else if (diff >= (15 / 360) * 2 * Math.PI) {
            that.new_color = 'orange';
        } else {
            that.new_color = 'limegreen';
        }

        that.min.transition().text(newMin);
        that.max.transition().text(newMax);
        that.arcs.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(that.new_color, that.cur_color);
        }).call(aTween, startAndEnd);
        // Set colors for next transition
        that.hold = that.cur_color;
        that.cur_color = that.new_color;
        that.new_color = that.hold;

        function aTween(transition, newAngle) {
            return transition.attrTween("d", function (d) {
                var startInterpolate = d3.interpolate(d.startAngle, newAngle.start);
                var endInterpolate = d3.interpolate(d.endAngle, newAngle.end);
                return function (t) {
                    console.log('what be ');
                    console.log(d);
                    d.startAngle = startInterpolate(t);
                    d.endAngle = endInterpolate(t);
                    return that.foregroundArc(d);
                };
            });
        }
    }
}

onDocumentReady();

function onDocumentReady() {
    var powerGauge = new gauge('#power-gauge', {
        size: 300,
        clipWidth: 300,
        clipHeight: 300,
        ringWidth: 60,
        maxValue: 10,
        transitionMs: 4000,
    });
    powerGauge.render();

    function updateReadings() {
        // just pump in random data here...
        var newValue = Math.random() * 10;
        powerGauge.update(newValue);
        powerGauge.updateBar(newValue, newValue - 1);
    }

    // every few seconds update reading values
    updateReadings();
    setInterval(function() {
        updateReadings();
    }, 5 * 1000);
}
