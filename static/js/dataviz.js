var data = [100, 200, 300, 400]; //add custom data here
var sum = d3.sum(data);
var innerRadius = [50, 100, 150, 200]; //adjust the inner and outer radius from here
var outerRadius = [100, 150, 200, 250];
var color = ["red", "green", "blue", "yellow"];//adjust colors from here
var label = ["INVESTMENTS", "SAVINGS", "EXPENDITURE", "INCOME"] //add labels here

var svg = d3
  .select("#visualization")
  .append("svg")
  .attr("width", 500) //can change the width from here
  .attr("height", 500); //can change the height from here

var arc = d3
  .arc()
  .innerRadius(function (d, i) {
    return innerRadius[i];
  })
  .outerRadius(function (d, i) {
    return outerRadius[i];
  })
  .startAngle(0)
  .endAngle(function (d, i) {
    console.log(d3);
    return (d / sum) * 1.5 * Math.PI;
  })
  .cornerRadius(10);

var group = svg
  .selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .attr("transform", "translate(250, 250)");

group
  .append("text")
  .attr("y", function (d, i) {
    return -(innerRadius[i] + outerRadius[i]) / 2;
  })
  .attr("dy", "0.35em")
  .attr("x", -50)
  .text(function (d, i) {
    return label[i];
  })
  .attr("text-anchor", "end")
  .attr("font-size", 15)
  .attr("font-weight", "bold")
  .attr('font-family', 'Arial, Helvetica, sans-serif')
  .attr("fill", function (d, i) {return color[i];});

group
  .append("path")
  .attr("d", arc)
  .attr("fill", function (d, i) {
    return color[i];
  });
