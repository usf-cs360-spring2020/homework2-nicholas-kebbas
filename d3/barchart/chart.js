
/*
 * our massive function to draw a bar chart. note some stuff in here
 * is bonus material (for transitions and updating the text)
 */
let drawBarChart = function(count) {
  // get the map

  // get the svg to draw on
  let svg = d3.select("body").select("svg");


  // make sure we selected exactly 1 element
  console.assert(svg.size() == 1);

  /*
   * we will need to map our data domain to our svg range, which
   * means we need to calculate the min and max of our data
   *
   * since we have an iterable instead of an array, we should use
   * https://github.com/d3/d3-array/blob/master/README.md
   *
   * note: include the latest version of d3-array for this!
   */

  let countMin = 0; // always include 0 in a bar chart!
  let countMax = d3.max(count.values());

  // this catches the case where all the bars are removed, so there
  // is no maximum value to compute
  if (isNaN(countMax)) {
    countMax = 0;
  }

  console.log("count bounds:", [countMin, countMax]);

  /*
   * before we draw, we should decide what kind of margins we
   * want. this will be the space around the core plot area,
   * where the tick marks and axis labels will be placed
   * https://bl.ocks.org/mbostock/3019563
   */
  let margin = {
    top:    15,
    right:  90, // leave space for y-axis
    bottom: 250, // leave space for x-axis
    left:   60
  };

  // now we can calculate how much space we have to plot
  let bounds = svg.node().getBoundingClientRect();
  let plotWidth = bounds.width - margin.right - margin.left;
  let plotHeight = bounds.height - margin.top - margin.bottom;

  /* do x axis */
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", plotWidth - 200)
    .attr("y", 20)
    .text("Airline");

/* do y axis */
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -50)
      .attr("y", 10)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Passenger Count");

  /*
   * okay now somehow we have to figure out how to map a count value
   * to a bar height, decide bar widths, and figure out how to space
   * bars for each letter along the x-axis
   *
   * this is where the scales in d3 come in very handy
   * https://github.com/d3/d3-scale#api-reference
   */

  /*
   * the counts are easiest because they are numbers and we can use
   * a simple linear scale, but the complicating matter is the
   * coordinate system in svgs:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Positions
   *
   * so we want to map our min count (0) to the max height of the plot area
   */
  let countScale = d3.scaleLinear()
    .domain([countMin, countMax])
    .range([plotHeight, 0])
    .nice(); // rounds the domain a bit for nicer output

  /*
   * the letters need an ordinal scale instead, which is used for
   * categorical data. we want a bar space for all letters, not just
   * the ones we found, and spaces between bars.
   * https://github.com/d3/d3-scale#band-scales
   */
  let airlineScale = d3.scaleBand()
    .domain(horizontal) // all letters (not using the count here)
    .rangeRound([0, plotWidth])
    .paddingInner(0); // space between bars

  // try using these scales in the console
  console.log("using count scale:", [countScale(countMin), countScale(countMax)]);

  // we are actually going to draw on the "plot area"
  let plot = svg.append("g").attr("id", "plot");

  // notice in the "elements" view we now have a g element!

  // shift the plot area over by our margins to leave room
  // for the x- and y-axis
  plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  console.assert(plot.size() == 1);

  // now lets draw our x- and y-axis
  // these require our x (letter) and y (count) scales
  let xAxis = d3.axisBottom(airlineScale);
  let yAxis = d3.axisRight(countScale);

  let xGroup = plot.append("g").attr("id", "x-axis");
  xGroup.call(xAxis);

  // notice it is at the top of our svg
  // we need to translate/shift it down to the bottom
  xGroup.attr("transform", "translate(0," + plotHeight + ")");
  xGroup.selectAll("text").attr("transform", "translate(-10,0)rotate(-90)");

  // do the same for our y axix
  let yGroup = plot.append("g").attr("id", "y-axis");
  yGroup.call(yAxis);
  yGroup.attr("transform", "translate(" + plotWidth + ",0)");

  // now how about some bars!

  /*
   * time to bind each data element to a rectangle in our visualization
   * hence the name data-driven documents (d3)
   */

  /*
   * we need our data as an array of key, value pairs before binding
   */
  let pairs = Array.from(count.entries());
  console.log("pairs:", pairs);

  let bars = plot.selectAll("rect")
    .data(pairs, function(d) { return d[0]; });

  // setting the "key" is important... this is how d3 will tell
  // what is existing data, new data, or old data

  /*
   * okay, this is where things get weird. d3 uses an enter, update,
   * exit pattern for dealing with data. think of it as new data,
   * existing data, and old data. for the first time, everything is new!
   * https://bost.ocks.org/mike/selection/
   * https://bost.ocks.org/mike/join/
   */

  // we use the enter() selection to add new bars for new data
  bars.enter().append("rect")
    // we will style using css
    .attr("class", "bar")
    // the width of our bar is determined by our band scale
    .attr("width", airlineScale.bandwidth())
    // we must now map our letter to an x pixel position
    // note the use of arrow functions here
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#Arrow_functions
    .attr("x", d => airlineScale(d[0]))
    //
    // function(d) {
    //   return letterScale(d[0]);
    // })
    // and do something similar for our y pixel position
    .attr("y", d => countScale(d[1]))
    // here it gets weird again, how do we set the bar height?
    .attr("height", d => plotHeight - countScale(d[1]))
    .each(function(d, i, nodes) {
      console.log("Added bar for:", d[0]);
    });

  // so we can access some of these elements later...
  // add them to our chart global
  chart.plotWidth = plotWidth;
  chart.plotHeight = plotHeight;

  chart.xAxis = xAxis;
  chart.yAxis = yAxis;

  chart.countScale = countScale;
  chart.airlineScale = airlineScale;
};

/*
 * optional: code that allows us to update the chart when
 * the data changes.
 */
let updateBarChart = function() {
  // get latest version of data
  let count = updateData();

  // recalculate counts
  let countMin = 0; // always include 0 in a bar chart!
  let countMax = d3.max(count.values());

  if (isNaN(countMax)) {
    countMax = 0;
  }

  // update our scale based on the new data
  chart.countScale.domain([countMin, countMax]);
  console.log("count bounds:", chart.countScale.domain());

  // re-select our elements
  let svg = d3.select("body").select("svg");
  let plot = svg.select("g#plot");

  console.assert(svg.size() == 1);
  console.assert(plot.size() == 1);

  // now lets update our y-axis
  plot.select("g#y-axis").call(chart.yAxis);

  // and lets re-create our data join
  let pairs = Array.from(count.entries());

  let bars = plot.selectAll("rect")
    .data(pairs, function(d) { return d[0]; });


  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("width", chart.airlineScale.bandwidth())
    .attr("x", d => chart.airlineScale(d[0]))
    .attr("y", d => chart.countScale(d[1]))
    .attr("height", d => chart.plotHeight - chart.countScale(d[1]))


  // for bars that already existed, we must use the update selection
  // and then update their height accordingly
  // we use transitions for this to avoid change blindness
  bars.transition()
    .attr("y", d => chart.countScale(d[1]))
    .attr("height", d => chart.plotHeight - chart.countScale(d[1]));


  bars.exit()
    .each(function(d, i, nodes) {
      console.log("Removing bar for:", d[0]);
    })
    .transition()
    // can change how the transition happens
    // https://github.com/d3/d3-ease
    .ease(d3.easeBounceOut)
    .attr("y", d => chart.countScale(countMin))
    .attr("height", d=> chart.plotHeight - chart.countScale(countMin))
    .remove();

  /*
   * we broke up the draw and update methods, but really it could be done
   * all in one method with a bit more logic. also possible to simplify with
   * using the new join() method, but it is important to understand the
   * enter/update/exit pattern.
   */
};
