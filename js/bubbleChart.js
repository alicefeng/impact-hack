var width = 600,
    height = 600;

var svg = d3.select("#bubbleChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var format = d3.format(",d");

var color = d3.scaleOrdinal(d3.schemeCategory20c);

var pack = d3.pack()
    .size([width, height])
    .padding(1.5);

d3.csv("data/paris_groups.csv",function(d) {
    return {
        country: d.Country,
        pct_greenhouse: d.pct_greenhouse,
        date_signed: d.date_signed,
        date_ratified: d.date_ratified,
        days_since_signed: +d.days_since_signed,
        group: d.group
    };
}, function(error, classes) {
  if (error) throw error;

  var root = d3.hierarchy({children: classes})
      .sum(function(d) { return d.pct_greenhouse; });
      // .each(function(d) {
      //   if (id = d.data.id) {
      //     var id, i = id.lastIndexOf(".");
      //     d.id = id;
      //     d.package = id.slice(0, i);
      //     d.class = id.slice(i + 1);
      //   }
      // });

  createBubbleChart(root);
});


function createBubbleChart(root) {

  var node = svg.selectAll(".node")
    .data(pack(root).leaves())
    .enter().append("g")
      .attr("class", function(d) { return "node country group" + d.data.group; });
      // .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("circle")
      // .attr("id", function(d) { return d.data.Country; })
      .attr("class", "hidden")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; });

  node.append("text")
    .attr("class", "countryNameLabel hidden")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("dy", ".35em")
    .text(function(d) { return d.r > 40 ? d.data.country : ""; });

}

function updateGraph(step) {
    console.log("triggered!", step);
    if(step === 0) {
        d3.selectAll(".country.group1 circle").classed("hidden", false);
        d3.selectAll(".country.group1 .countryNameLabel.hidden").classed("hidden", false);
    }
    else if(step === 1) {
        d3.selectAll(".country.group2 circle").classed("hidden", false);
        d3.selectAll(".country.group2 .countryNameLabel.hidden").classed("hidden", false);
    }
    else if(step === 2) {
        d3.selectAll(".country.group3 circle").classed("hidden", false);
        d3.selectAll(".country.group3 .countryNameLabel.hidden").classed("hidden", false);
    }
}