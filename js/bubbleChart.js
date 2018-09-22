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
console.log(pack(root).leaves());
  var node = svg.selectAll(".node")
    .data(pack(root).leaves())
    .enter().append("g")
      .attr("class", function(d) { return "node country group" + d.data.group; });
      // .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("circle")
      // .attr("id", function(d) { return d.data.Country; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .style("fill", "#1696d2");

  node.append("text")
    .attr("class", "countryNameLabel")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("dy", ".35em")
    .text(function(d) { return d.r > 40 ? d.data.country : ""; });

  // node.append("clipPath")
  //     .attr("id", function(d) { return "clip-" + d.id; })
  //   .append("use")
  //     .attr("xlink:href", function(d) { return "#" + d.id; });

  // node.append("text")
  //     .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
  //   .selectAll("tspan")
  //   .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
  //   .enter().append("tspan")
  //     .attr("x", 0)
  //     .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
  //     .text(function(d) { return d; });

  // node.append("title")
  //     .text(function(d) { return d.id + "\n" + format(d.value); });
});