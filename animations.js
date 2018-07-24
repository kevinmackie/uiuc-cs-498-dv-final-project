var animateFunctions = [
    [null, null],
    [animateScene1, null],
    [animateScene2,deanimateScene2],
    [animateScene3,deanimateScene3],
    [animateScene4,null]
];

function animateScene( forward ) {
    if (frame > (animateFunctions.length-1)) return;

    const animateFunction = animateFunctions[frame][(forward?0:1)];
    if (animateFunction)
        animateFunction();
}

function animateScene1() {
    console.log(dataSet);

    const referenceData = d3.values(referencesByYear);

    x_year.range([0, chart_dimensions.width])
        .domain(d3.keys(referencesByYear));

    y_papers.domain([0, d3.max(referenceData, function(d) { return d.papers; })])
        .range([0, chart_dimensions.height]);

    const y_papers_axis = d3.scaleLinear()
        .domain([0, d3.max(referenceData, function(d) { return d.papers; })])
        .range([chart_dimensions.height, 0]);

    y_citations.domain([0, d3.max(referenceData, function(d) { return d.citations; })])
        .range([0, chart_dimensions.height]);

    const y_citations_axis = d3.scaleLinear()
        .domain([0, d3.max(referenceData, function(d) { return d.citations; })])
        .range([chart_dimensions.height, 0]);

    y_citations_single.domain([1, d3.max(dataSet, function(d) { return d.citations; })])
        .range([0, chart_dimensions.height]);

    y_citations_single_axis.domain([1, d3.max(dataSet, function(d) { return d.citations; })])
        .range([chart_dimensions.height, 0]);

    const typeSet = d3.set();

    d3.values(dataSet).map(
        function (d) {
            typeSet.add(d.type);
            return d;
        });

    const categoryContinuousColorScale = d3.scaleBand()
        .domain(typeSet.values())
        .range([0, 350]);

    const categoryDiscreteColorScale = d3.scaleOrdinal()
        .domain(typeSet.values())
        .range(typeSet.values().map(function (d) {
            return "hsl( " + categoryContinuousColorScale(d) + ", 75%, 50%)"
        }));

    // d3.select(".chart")
    //     .append("g")
    //     .attr("id", "annotation-lines");
    //
    // d3.select(".chart")
    //     .append("g")
    //     .attr("id","annotation-block")
    //     .append("text")
    //     .attr("id","annotation-text");

    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const chart = d3.select(".chart")
        .attr("width", canvas.width)
        .attr("height", canvas.height);

    const bar = chart.selectAll("g")
        .data(dataSet)
        .enter().append("g")
        .attr("transform",
            function (d) {
                return "translate(" + (margin.left + (x_year(d.year))) + ", " + margin.top + ")";
            });

    bar.append("rect")
        .attr("class", "bar-citations")
        .attr("x", 0)
        .attr("y", chart_dimensions.height)
        .attr("width", x_year.bandwidth() / 2 - 1)
        .attr("height", 0)
        .on("mouseover", function (d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");


        })
        .on("mouseout", function (d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });

    bar.append("rect")
        .attr("class", "bar-papers")
        .attr("width", x_year.bandwidth() / 2 - 1)
        .attr("height", 0)
        .attr("x", x_year.bandwidth() / 2)
        .attr("y", chart_dimensions.height)
        .on("mouseover", function (d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltipDiv.transition()
                .duration(1000)
                .style("opacity", 0);
        })
        .transition()
        .filter(function (d) {
            return (d.year <= 2001)
        })
        .duration(1000)
        .delay(function (d) {
            if (d.year < 2002) return 0; else return (d.year - 2001) * 10
        })
        .attr("height", function (d) {
            return y_papers(1) + 0.5
        })
        .attr("y", function (d) {
            if (!referencesByYear[d.year].paperBarHeight) {
                referencesByYear[d.year].paperBarHeight = 0;
            }
            referencesByYear[d.year].paperBarHeight += y_papers(1);
            return chart_dimensions.height - referencesByYear[d.year].paperBarHeight
        });

    bar.append("circle")
        .attr("class", "circle-citations")
        .attr("cx", 0)
        .attr("cy", chart_dimensions.height)
        .attr("r", 0)
        // .attr("class", (function(d) { return ("type-category-color-" + d.type.toLowerCase().replace(" ","-"))}))
        .attr("stroke", function (d) {
            return categoryDiscreteColorScale(d.type);
        })
        .attr("fill", "black")
        .attr("fill-opacity", "1")
        .attr("stroke-width", 0)
        .on("mouseover", function (d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });

    const xAxisYear = d3.axisBottom().scale(x_year)
        .tickSize(10).ticks(referenceData.length);

    yAxisPapers.scale(y_papers_axis)
        .tickSize(10).ticks(20);

    yAxisCitations.scale(y_citations_axis)
        .tickSize(10).ticks(20);

    d3.select("svg").append("g")
        .attr("id", "xAxisG")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chart_dimensions.height) + ")")
        .call(xAxisYear)
        .selectAll("text")
        .attr("x", -35)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width / 2) + " ," +
            (margin.top + chart_dimensions.height + 50) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    d3.select("svg").append("g")
        .attr("id", "yAxisPapersG")
        .attr("class", "y axis papers")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisPapers);

    d3.select("svg").append("text")
        .attr("id", "yAxisPapersLabel")
        .attr("transform",
            "translate(8," + (margin.top + chart_dimensions.height + margin.bottom + chart_dimensions.height / 2) + ")" +
            ", rotate(-90)")
        .style("text-anchor", "middle")
        .text("Papers");

    d3.select("#yAxisPapersG")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxisPapers)
        .selectAll("text")
        .attr("x", -30)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "start");

    d3.select("#yAxisPapersLabel")
        .transition()
        .duration(1000)
        .attr("transform",
            "translate(8," + (margin.top + chart_dimensions.height / 2) + ")" +
            ", rotate(-90)");

    d3.select("svg").append("g")
        .attr("id", "yAxisCitationsG")
        .attr("class", "y axis citations")
        .attr("transform", "translate(" + (8 + margin.left + chart_dimensions.width) + "," +
            (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisCitations)
        .selectAll("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("id", "yAxisCitationsLabel")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width + 50) + ","
            + ((margin.top + chart_dimensions.height + margin.bottom) + chart_dimensions.height / 2) + "),rotate(-90)")
        .style("text-anchor", "middle")
        .text("Citations");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width / 2) + ","
            + (margin.top / 2) + ")")
        .style("text-anchor", "middle")
        .text("SCADA Cybersecurity Papers and Citations, Year-over-Year, as of July 8th, 2018");

    insertAnnotation("scene-1");
}

function animateScene2() {
    insertAnnotation("scene-2");

    d3.selectAll(".bar-papers")
        .transition()
        .filter(function(d) { return (d.year > 2001)})
        .duration(1000)
        .delay(function(d) { return (d.year-2001)*10})
        .attr("height",function(d) { return y_papers(1)+0.5})
        .attr("y",function(d) {
            if (!referencesByYear[d.year].paperBarHeight) {
                referencesByYear[d.year].paperBarHeight = 0;
            }
            referencesByYear[d.year].paperBarHeight += y_papers(1);
            return chart_dimensions.height-referencesByYear[d.year].paperBarHeight});
}

function animateScene3() {
    removeAnnotation("scene-1");
    removeAnnotation("scene-2");
    insertAnnotation("scene-3a");
    insertAnnotation("scene-3b");
    insertAnnotation("scene-3c");

    d3.select("#yAxisCitationsG")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + (margin.left + chart_dimensions.width) + "," + margin.top + ")")
        .call(yAxisCitations);

    d3.select("#yAxisCitationsLabel")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + (margin.left + chart_dimensions.width + 52) + "," +
            (margin.top + chart_dimensions.height/2) + "),rotate(-90)");

    d3.selectAll(".bar-citations")
        .transition()
        .delay(function(d) { return (d.year-1980)})
        .duration(1000)
        .attr("height", function(d) { return y_citations(d.citations)+0.5;})
        .attr("y",function(d) {
            if (!referencesByYear[d.year].citationsBarHeight) {
                referencesByYear[d.year].citationsBarHeight = 0;
            }
            referencesByYear[d.year].citationsBarHeight += y_citations(d.citations);
            return (chart_dimensions.height-referencesByYear[d.year].citationsBarHeight)});

    // Remove the post-911 annotation ...
    d3.select("#annotation-line-9-11")
        .transition()
        .duration(1000)
        .attr("x1",0)
        .attr("y1",1000)
        .attr("x2",0)
        .attr("y2",1000);

    d3.select("#annotation-text-9-11")
        .transition()
        .duration(1000)
        .attr("transform","translate(0,1000)");

    // and introduce the annotation regarding citations

    const aimX = (margin.left + x_year(2004));
    const aimY = (margin.top + chart_dimensions.height - y_citations(550));
    const dx = 0;
    const dy = -200;

    d3.select("#annotation-line-citations")
        .transition()
        .duration(1000)
        .attr("x1",(aimX+dx))
        .attr("y1",(aimY+dy))
        .attr("x2",aimX)
        .attr("y2",aimY);

    d3.select("#annotation-text-citations")
        .transition()
        .duration(1000)
        .attr("transform","translate(" + (aimX+dx) + "," + (aimY+dy) + ")");
}

function animateScene4() {
    removeAnnotation("scene-3a");
    removeAnnotation("scene-3b");
    removeAnnotation("scene-3c");

    d3.selectAll(".bar-papers")
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", chart_dimensions.height);

    d3.select("#yAxisPapersG")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + (margin.left) + "," +
            (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisPapers);

    d3.select("#yAxisPapersLabel")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + margin.left + "," + (margin.top+chart_dimensions.height+2*margin.bottom) +
            "), rotate(90)");

    d3.selectAll(".bar-citations")
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", chart_dimensions.height);

    d3.selectAll(".circle-citations")
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("cx",x_year.bandwidth()/2)
        .attr("cy",function(d) {
            if (d.citations === 0)
                return chart_dimensions.height;
            else
                return (chart_dimensions.height-y_citations_single(d.citations)) })
        .attr("r",5)
        .attr("fill","black")
        .attr("fill-opacity","0")
        .attr("stroke-width", 2);

    yAxisCitations.scale(y_citations_single_axis);

    d3.select("#yAxisCitationsG")
        .transition()
        .delay(1000)
        .duration(1000)
        .call(yAxisCitations.tickFormat(d3.format("d")));
    // .selectAll("text")
    // .attr("x",15)
    // .attr("y",0)
    // .attr("dx",0)
    // .attr("dy","0.35em")
    // .style("text-anchor", "start");

    d3.timer(function() {
        d3.select(".chart")
            .attr("class", "brush")
            .call(d3.brush().on("brush", brushed));

    },1100);

    // const tr = d3.select("tbody")
    //     .selectAll("tr").data(
    //         [
    //             {
    //                 title: "Let's make this a bit more interesting with a much much longer titles a bit more interesting with a much much longer titles a bit more interesting with a much much longer titles a bit more interesting with a much much longer titles a bit more interesting with a much much longer titles a bit more interesting with a much much longer title", authors: "Mackie, K - and a long list of authors", citations: 10
    //             },
    //             {
    //                 title: "Title2", authors: "Mackie, K2", citations: 12
    //             },
    //         ])
    //     .enter()
    //     .append("tr");
    //
    // tr.append("td")
    //     .text(function(d) { return d.title } );
    // tr.append("td")
    //     .text(function(d) { return d.authors } );
    // tr.append("td")
    //     .text(function(d) { return d.citations } );
}
function deanimateScene2() {
}

function deanimateScene3() {
    console.log("De-nimate 3");
}

function brushed() {
    console.log("Brushed");
    console.log(d3.event);
}

