(function() {
    var width = 800,
        height = 500;

    var margin = {left: 50, top: 40, right: 40, bottom: 40};

    var xScale = d3.scaleLinear()
        .domain([2005, 2100])
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .rangeRound([height, 0]);

    var colorScale = d3.scaleOrdinal()
        .domain(["No policy", "Low policy", "Paris - Continued ambition", "Paris - Increased ambition"])
        .range(["#d2d2d2", "#696969", "#a2d4ec", "#1696d2"]);

    var line = d3.line()
        // .curve(d3.curveStepAfter)
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.emissions); });

    var forecastData;

    var svg = d3.select("#forecastChart")
        .append("svg")
        .attr("width", width + margin.top + margin.bottom)
        .attr("height", height + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/forecast.csv",function(d) {
        return {
            model: d.Model,
            scenario: d.Scenario,
            region: d.Region,
            indicator: d.indicator,
            unit: d.unit,
            year: +d.year,
            emissions: +d.emissions
        };
    }, function(error, data) {
        if (error) throw error;

        forecastData = data;

        yScale.domain([0, d3.max(forecastData, function(d) { return d.emissions; })]);

        var forecasts = getData("World");

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale))
        .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Emissions");

        var forecasts = svg.selectAll(".forecastLine")
            .data(forecasts)
            .enter().append("g")
            .attr("class", function(d) { return "forecastLine region " + d.key; });

        forecasts.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("fill", "none")
            .style("stroke", function(d) { return colorScale(d.key); });
    });

    function getData(region) {
        var flat_data = forecastData.filter(function(d) { return d.region === region; });
        var data = d3.nest()
            .key(function(d) { return d.scenario; })
            .entries(flat_data);

        return data;
    }

    function updateChart(newRegion) {
        var data = forecastData.filter(function(d) { return d.region === newRegion; });
        var newData = getData(newRegion);

        yScale.domain([0, d3.max(data, function(d) { return d.emissions; })]);
        updateAxis(yScale);

        var forecasts = d3.selectAll(".forecastLine")
            .data(newData)
            .transition();

        forecasts.select(".line")
            .attr("d", function(d) { return line(d.values); });
    }

    function updateAxis(yScale) {
        d3.select("#forecastChart .axis.axis--y")
            .transition()
            .call(d3.axisLeft(yScale));
    }

    d3.select("#regionSelector").on("change", function() { updateChart(this.value); });

})();