(function() {
    var width = 800,
        height = 500;

    var margin = {left: 55, top: 40, right: 40, bottom: 40};

    var xScale = d3.scaleLinear()
        .domain([1990, 2014])
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .rangeRound([height, 0]);

    var line = d3.line()
        // .curve(d3.curveStepAfter)
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.emissions_pc); });

    var signedData;

    var svg = d3.select("#historicalEmissionsChart")
        .append("svg")
        .attr("width", width + margin.top + margin.bottom)
        .attr("height", height + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/historical_emissions.csv",function(d) {
        return {
            country: d.country,
            year: +d.year,
            total_ghg_emissions: +d.total_ghg_emissions,
            country_code: d.country_code,
            population: +d.population,
            emissions_pc: +d.emissions_pc
        };
    }, function(error, data) {
        if (error) throw error;

        yScale.domain([d3.min(data, function(d) { return d.emissions_pc; }), d3.max(data, function(d) { return d.emissions_pc; })]);
        var countries = d3.nest()
            .key(function(d) { return d.country_code; })
            .entries(data);

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
            .text("Emissions per capita");

        var countries = svg.selectAll(".country")
            .data(countries)
            .enter().append("g")
            .attr("class", function(d) { return "emissionsPC country " + d.key; })
            .on("mouseover", function(d) { highlightLine(d.key, d.values[0].country); })
            .on("mouseout", function() { highlightLine("WLD", "World"); });

        countries.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); });

        highlightLine("WLD", "World");
    });

    function highlightLine(country_code, country_name) {
        d3.selectAll(".emissionsPC").classed("selected", false);
        d3.select(".emissionsPC." + country_code).classed("selected", true);
        d3.select(".emissionsPC." + country_code).moveToFront();
        d3.select("#historicalEmissionsName").text(country_name);
    }

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
})();