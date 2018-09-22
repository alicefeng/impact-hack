(function() {
    var width = 700,
        height = 400;

    var margin = {left: 40, top: 40, right: 5, bottom: 50};

    var xScale = d3.scaleLinear()
        .domain([0, 1095])
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, 197])
        .rangeRound([height, 0]);

    var line = d3.line()
        .curve(d3.curveStepAfter)
        .x(function(d) { return xScale(d.days_since_signed); })
        .y(function(d) { return yScale(d.total_countries); });

    var signedData;

    var svg = d3.select("#signedLineChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/country_sums.csv",function(d) {
        return {
            treaty: d.treaty,
            days_since_signed: +d.days_since_signed,
            total_countries: +d.total_countries
        };
    }, function(error, data) {
        if (error) throw error;

        var treaties = d3.nest()
            .key(function(d) { return d.treaty; })
            .entries(data);

        console.log(treaties);

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
        .append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + width/2 + ", 40)")
            .attr("text-anchor", "middle")
            .text("Number of days since agreement signed");

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale).tickValues([0, 25, 50, 75, 100, 125, 150, 175, 197]))
        .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Number of countries");

        var treaty = svg.selectAll(".treaty")
            .data(treaties)
            .enter().append("g")
              .attr("class", "treaty");

        treaty.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .attr("fill", "none")
            .attr("stroke", function(d) {
                if(d.key === "Paris") {return "#e88e2d";}
                else if(d.key === "Kyoto") {return "#d2d2d2";}
                else if(d.key === "Doha") {return "#adabac";}
            })
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5);

        var label_dat = [
            {treaty: "Paris", days_since_signed: 1040, total_countries: 180},
            {treaty: "Kyoto", days_since_signed: 1070, total_countries: 30},
            {treaty: "Doha", days_since_signed: 1070, total_countries: 50}
        ];

        svg.selectAll("lineLabels")
            .data(label_dat)
            .enter()
            .append("text")
            .attr("class", "lineLabel")
            .attr("x", function(d) { return xScale(d.days_since_signed) + 10; })
            .attr("y", function(d) { return d.treaty === "Paris" ? yScale(d.total_countries) : yScale(d.total_countries) + 15; })
            .attr("dy", "0.35em")
            .text(function(d) { return d.treaty; });
        });

})();