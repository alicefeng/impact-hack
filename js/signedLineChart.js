(function() {
    var width = 800,
        height = 500;

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
            .style("fill", "black")
            .text("Number of days since treaty signed");

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale))
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
                if(d.key === "Paris") {return "#fdbf11";}
                else if(d.key === "Kyoto") {return "#0a4c6a";}
                else if(d.key === "Doha") {return "#12719e";}
            })
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5);

        var label_dat = [
            {treaty: "Paris", days_since_signed: 989, total_countries: 180},
            {treaty: "Kyoto", days_since_signed: 1050, total_countries: 30},
            {treaty: "Doha", days_since_signed: 1050, total_countries: 50}
        ];

        svg.selectAll("lineLabels")
            .data(label_dat)
            .enter()
            .append("text")
            .attr("x", function(d) { return xScale(d.days_since_signed) + 10; })
            .attr("y", function(d) { return d.treaty === "Paris" ? yScale(d.total_countries) : yScale(d.total_countries) + 10; })
            .attr("dy", "0.35em")
            .style("font", "10px sans-serif")
            .text(function(d) { return d.treaty; });
        });

})();