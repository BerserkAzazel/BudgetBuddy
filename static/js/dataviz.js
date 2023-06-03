      async function getUserInfo(credentialId) {
          try {
              const response = await fetch('/api/info', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      credentialId,
                  }),
              });
              if (response.ok) {
                  const res = await response.json();
                  return { res };
              } else {
                  console.error(response.statusText);
                  return new Error(response.statusText);
              }
          } catch (error) {
              console.error('Failed to fetch user info:', error);
              return new Error(error);
          }
      }

      getUserInfo(window.localStorage.getItem('username')).then(async (user) => {
var data = [user.res.user.Investments, user.res.user.Savings, user.res.user.Expenses, user.res.user.Income];
console.log(data) //add custom data here
var sum = d3.sum(data);
var innerRadius = [60, 100, 140, 180]; //adjust the inner and outer radius from here
var outerRadius = [90, 130, 170, 210];
var color = ["red", "green", "blue", "yellow"];//adjust colors from here
var label = ["INVESTMENTS", "SAVINGS", "EXPENDITURE", "INCOME"] //add labels here

var svg = d3
  .select("#visualization")
  .append("svg")
  .attr("width", 500)
  .attr("height", 500);

var arc = d3
  .arc()
  .innerRadius(function (d, i) {
    return innerRadius[i];
  })
  .outerRadius(function (d, i) {
    return outerRadius[i];
  })
  .startAngle(0)
  .endAngle(0) // Set initial end angle to 0
  .cornerRadius(10);

var group = svg
  .selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .attr("transform", "translate(250, 250)");//change height and width here too

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
  .attr("opacity", 0)
  .transition()
  .duration(1000)
  .delay(function (d, i) {
    return i * 200;
  })
  .attr("opacity", 1)
  .attr("text-anchor", "end")
  .attr("font-size", 15)
  .attr("font-weight", "bold")
  .attr("font-family", "Arial, Helvetica, sans-serif")
  .attr("fill", function (d, i) {
    return color[i];
  });

group
  .append("path")
  .attr("d", arc)
  .attr("fill", function (d, i) {
    return color[i];
  })
  .attr("opacity", 0)
  .transition()
  .duration(1000)
  .delay(function (d, i) {
    return i * 200;
  })
  .attrTween("d", function (d, i) {
    var interpolate = d3.interpolate(0, (d / sum) * 1.5 * Math.PI); // Interpolate between 0 and final end angle
    return function (t) {
      arc.endAngle(interpolate(t)); // Update the end angle of the arc
      return arc(d, i);
    };
  })
  .attr("opacity", 1);

}).catch((error) => {
    console.log(error);
});
