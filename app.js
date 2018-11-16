var gauge = function(container, configuration) {
    var that = {};
    var config = {
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
    var range = undefined;
    var r = undefined;
    var pointerHeadLength = undefined;
    var value = 0;

    var svg = undefined;
    var arc = undefined;
    var arcs = undefined;
    var foregroundArc = undefined;
    var backgroundArc = undefined;
    var scale = undefined;
    var ticks = undefined;
    var tickData = undefined;
    var pointer = undefined;

    var pi = Math.PI;
    var cur_color = 'limegreen';
    var new_color, hold;
    var max = 180, min = 0, current = 10;

    var donut = d3.layout.pie();

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return newAngle;
    }

    function configure(configuration) {
        var prop = undefined;
        for ( prop in configuration ) {
            config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        scale = d3.scale.linear()
            .range([0,1])
            .domain([config.minValue, config.maxValue]);

        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});

        arc = d3.svg.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset)
            .startAngle(function(d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle);
            })
            .endAngle(function(d, i) {
                var ratio = d * (i+1);
                return deg2rad(config.maxAngle);
            });

        foregroundArc = d3.svg.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset);
    }
    that.configure = configure;

    function centerTranslation() {
        return 'translate('+r +','+ r +')';
    }

    function isRendered() {
        return (svg !== undefined);
    }
    that.isRendered = isRendered;

    function render(newValue) {
        svg = d3.select(container)
            .append('svg:svg')
            .attr('class', 'gauge')
            .attr('width', config.clipWidth)
            .attr('height', config.clipHeight)
            .append('g');

        var centerTx = centerTranslation();

        that.arcs = svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx)
            .append("path")
            .datum({
                startAngle: -90 * (Math.PI / 180),
                endAngle: -90 * (Math.PI / 180)
            })
            .style("fill", 'red')
            .attr("d", foregroundArc);


        setInterval(function () {
            var num = Math.random() * 180;
            var numPi = Math.floor(num - 89) * (pi / 180);// Get value
            if (num >= 121) {
                new_color = 'red';
            } else if (num >= 61) {
                new_color = 'orange';
            } else {
                new_color = 'limegreen';
            } // Get new color
            // current.transition().text(Math.floor(num));
            console.log(arcs);
            that.arcs.transition().duration(750).styleTween("fill", function () {
                return d3.interpolate(new_color, cur_color);
            }).call(aTween, numPi);
            // Set colors for next transition
            hold = cur_color;
            cur_color = new_color;
            new_color = hold;
        }, 3000);

        function aTween(transition, newAngle) {
            console.log('what is the:');
            console.log(transition);
            console.log(newAngle);
            return transition.attrTween("d", function (d) {
                console.log('what is d?');
                console.log(d);
                var newLowestAngle = Math.random() * newAngle;
                var startInterpolate = d3.interpolate(d.startAngle, newLowestAngle);
                var endInterpolate = d3.interpolate(d.endAngle, newAngle);
                return function (t) {
                    console.log('what is t?');
                    console.log(t);
                    d.startAngle = startInterpolate(t);
                    d.endAngle = endInterpolate(t);
                    return foregroundArc(d);
                };
            });
        }

        var lg = svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
            })
            .text(config.labelFormat);

        var lineData = [ [config.pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(config.pointerWidth / 2), 0],
            [0, config.pointerTailLength],
            [config.pointerWidth / 2, 0] ];
        var pointerLine = d3.svg.line().interpolate('monotone');
        var pg = svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        pointer = pg.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .attr('transform', 'rotate(' +config.minAngle +')');

        update(newValue === undefined ? 0 : newValue);
    }
    that.render = render;

    function update(newValue, newConfiguration) {


        if ( newConfiguration  !== undefined) {
            configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + (ratio * range);
        pointer.transition()
            .duration(config.transitionMs)
            .ease('elastic')
            .attr('transform', 'rotate(' +newAngle +')');
    }
    that.update = update;

    configure(configuration);

    return that;
};

onDocumentReady();

function onDocumentReady() {
    var powerGauge = gauge('#power-gauge', {
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
        powerGauge.update(Math.random() * 10);
    }

    // every few seconds update reading values
    updateReadings();
    setInterval(function() {
        updateReadings();
    }, 5 * 1000);
}


function generateArc() {
    // Set Up
    var pi = Math.PI, width = 600, height = 400;
    var iR = 170;
    var oR = 110;
    var cur_color = 'limegreen';
    var new_color, hold;
    var max = 180, min = 0, current = 10;
    var arc = d3.svg.arc().innerRadius(iR).outerRadius(oR).startAngle(-90 * (pi / 180)); // Arc Defaults
// Place svg element
    var svg = d3.select("#power-gauge").append("svg:svg").attr("width", width).attr("height", height)
.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var background = svg.append("path").datum({endAngle: 90 * (pi / 180)}).style("fill", "#ddd").attr("d", arc);// Append background arc to svg
    var foreground = svg.append("path").datum({endAngle: -90 * (pi / 180)}).style("fill", cur_color).attr("d", arc); // Append foreground arc to svg
    var max = svg.append("text").attr("transform", "translate(" + (iR + ((oR - iR) / 2)) + ",15)") // Display Max value
        .attr("text-anchor", "middle").style("font-family", "Helvetica").text(max) ;// Set between inner and outer Radius
// Display Min value
    var min = svg.append("text").attr("transform", "translate(" + -(iR + ((oR - iR) / 2)) + ",15)") // Set between inner and outer Radius
        .attr("text-anchor", "middle").style("font-family", "Helvetica").text(min)
// Display Current value
    var current = svg.append("text").attr("transform", "translate(0," + -(iR / 4) + ")") // Push up from center 1/4 of innerRadius
        .attr("text-anchor", "middle").style("font-size", "50").style("font-family", "Helvetica").text(current)
// Update every x seconds
    setInterval(function () {
        var num = Math.random() * 180;
        var numPi = Math.floor(num - 89) * (pi / 180);// Get value
        if (num >= 121) {
            new_color = 'red';
        } else if (num >= 61) {
            new_color = 'orange';
        } else {
            new_color = 'limegreen';
        } // Get new color
        current.transition().text(Math.floor(num));// Text transition
// Arc Transition
        foreground.transition().duration(750).styleTween("fill", function () {
            return d3.interpolate(new_color, cur_color);
        }).call(arcTween, numPi);
        // Set colors for next transition
        hold = cur_color;
        cur_color = new_color;
        new_color = hold;
    }, 1500); // Repeat every 1.5s
    function arcTween(transition, newAngle) {
        console.log('what is the:');
        console.log(transition);
        console.log(newAngle);
        transition.attrTween("d", function (d) {
            console.log('what is d?');
            console.log(d);
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        });
    } // Update animation
}
