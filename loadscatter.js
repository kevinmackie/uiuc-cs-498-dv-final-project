var referencesByYear = {};

var state = 0;


function frameForward() {
    state++;
    toggleVisibility();
    toggleEnabled();
}
function frameBack() {
    toggleVisibility();
    toggleEnabled();
    state--;
}
function toggleVisibility() {
    let className = "toggle-visibility-" + state;

    var elements = document.getElementsByClassName(className);

    for (i=0; i < elements.length; i++) {
        elements[i].classList.toggle("invisible")
    }
}
function toggleEnabled() {
    let className = "toggle-enabled-" + state;

    var elements = document.getElementsByClassName(className);

    for (i=0; i < elements.length; i++) {
        elements[i].classList.toggle("disabled")
    }
}

d3.dsv(",", "./data.csv", function(d) {

    const dataobj = {
        year: +d.Year,
        citations: +d["Cited by"]
    };

    if (!referencesByYear[dataobj.year])
        referencesByYear[dataobj.year] = { year: dataobj.year, papers: 0, citations: 0};

    referencesByYear[dataobj.year].papers++;
    referencesByYear[dataobj.year].citations += dataobj.citations;

    return dataobj;

}).then(function(data) {

    const canvas = {width: 900, height: 500};
    const margin = {top: 50, left: 50, bottom: 50, right: 50};
    const chart_dimensions = {
        width: canvas.width - (margin.left + margin.right),
        height: canvas.height - (margin.top + margin.bottom)
    };

    const referenceData = d3.values(referencesByYear);

    const x_year = d3.scaleBand()
        .range([0, chart_dimensions.width])
        .domain(d3.keys(referencesByYear));

    const y_citations = d3.scaleLog()
        .domain([1, d3.max(data, d => d.citations)])
        .range([0, chart_dimensions.height]);


    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const chart = d3.select(".chart")
        .attr("width", canvas.width)
        .attr("height", canvas.height);


    const bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform",
            function (d) {
                let y = 0;
                if (d.citations > 0) {
                    y = y_citations(d.citations);
                }

                return "translate(" +
                    (margin.left + x_year(d.year)) + ", " +
                    (margin.top + (chart_dimensions.height - y)) + ")";
            });

    bar.append("circle")
        .attr("class","scatter-citations")
        .attr("cx",0)
        .attr("cy",0)
        .attr("r",3)
        .attr("stroke","orange")
        .attr("fill","none")
        .attr("stroke-width",2)
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    const xAxisYear = d3.axisBottom().scale(x_year)
        .tickSize(20).ticks(referenceData.length);

    const yAxisCitations = d3.axisRight().scale(y_citations)
        .tickSize(10).ticks(20);

    d3.select("svg").append("g")
        .attr("id", "xAxisG")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left + (x_year.bandwidth()/2)) + "," + (margin.top + chart_dimensions.height) +")")
        .call(xAxisYear)
        .selectAll("text")
        .attr("x",-25)
        .attr("y",-x_year.bandwidth()/2)
        .attr("dx",0)
        .attr("dy","0.35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width/2) + " ," +
            (margin.top + chart_dimensions.height + 40) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    d3.select("svg").append("g")
        .attr("id", "yAxisCitationsG")
        .attr("class", "y axis citations")
        .attr("transform", "translate(" + (margin.left + chart_dimensions.width) + "," +
            (margin.top + chart_dimensions.height) + ") scale(1,-1)")
        .call(yAxisCitations.tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("transform","scale(1,-1)")
        .attr("x",15)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width + 42) + ","
            + (margin.top + chart_dimensions.height/2) + "),rotate(90)")
        .style("text-anchor", "middle")
        .text("Citations");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width/2) + ","
            + (margin.top/2) + ")")
        .style("text-anchor", "middle")
        .text("SCADA Cybersecurity Papers and Citations, Year-over-Year, as of July 8th, 2018");
});
