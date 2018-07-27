var animateFunctions = [
    [animateScene0, null],
    [animateScene1, deanimateScene1],
    [animateScene2,deanimateScene2],
    [animateScene3,deanimateScene3],
    [animateScene4,deanimateScene4]
];

function animateScene( forward ) {
    if (frame > (animateFunctions.length-1)) return;

    const animateFunction = animateFunctions[frame][(forward?0:1)];
    if (animateFunction)
        animateFunction();
}

function calculateScales() {
    const referenceData = d3.values(referencesByYear);

    x_year.range([0, chart_dimensions.width])
        .domain(d3.keys(referencesByYear));

    x_year.invert = (
        function(){
            const domain = x_year.domain();
            const range = x_year.range();
            const scale = d3.scaleQuantize().domain(range).range(domain);

            return function(x){
                return scale(x)
            }
        }
    )();

    y_papers.domain([0, d3.max(referenceData, function(d) { return d.papers; })])
        .range([0, chart_dimensions.height]);

    y_papers_axis.domain([0, d3.max(referenceData, function(d) { return d.papers; })])
        .range([chart_dimensions.height, 0]);

    y_citations.domain([0, d3.max(referenceData, function(d) { return d.citations; })])
        .range([0, chart_dimensions.height]);

    y_citations_axis.domain([0, d3.max(referenceData, function(d) { return d.citations; })])
        .range([chart_dimensions.height, 0]);

    y_citations_single.domain([1, d3.max(dataSet, function(d) { return d.citations; })])
        .range([0, chart_dimensions.height]);

    y_citations_single_axis.domain([1, d3.max(dataSet, function(d) { return d.citations; })])
        .range([chart_dimensions.height, 0]);

}

function initializeChartArea() {
    chart = d3.select(".chart")
        .attr("width", canvas.width)
        .attr("height", canvas.height);
}
function createPaperBars() {
    d3.select(".chart").selectAll(".bar-papers-group")
        .data(d3.values(referencesByYear))
        .enter()
        .append("g")
        .classed("bar-papers-group",true)
        .attr("transform",
            function (d) {
                return "translate(" + (margin.left + (x_year(d.year)-x_year.bandwidth()/2)) + ", " + margin.top + ")";
            })
        .append("rect")
        .classed("bar-papers-rect",true)
        .attr("width", x_year.bandwidth() / 2 - 1)
        .attr("height", 0)
        .attr("x", x_year.bandwidth() / 2)
        .attr("y", chart_dimensions.height);
}

function showPaperBars( minYear, maxYear ) {

    d3.selectAll(".bar-papers-rect")
        .filter(function(d) { return ((d.year >= minYear) && (d.year <= maxYear))})
        .transition()
        .duration(1000)
        .attr("height", function (d) {
            return y_papers(d.papers);
        })
        .attr("y", function (d) {
            return (chart_dimensions.height - y_papers(d.papers));
        });
    //
    // .on("mouseover", function (d) {
    //     tooltipDiv.transition()
    //         .duration(200)
    //         .style("opacity", .9);
    //     tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations)
    //         .style("left", (d3.event.pageX) + "px")
    //         .style("top", (d3.event.pageY - 28) + "px");
    // })
    // .on("mouseout", function (d) {
    //     tooltipDiv.transition()
    //         .duration(1000)
    //         .style("opacity", 0);
    // })
}

function createCitationBars() {
    d3.select(".chart").selectAll(".bar-citations-group")
        .data(d3.values(referencesByYear))
        .enter()
        .append("g")
        .classed("bar-citations-group",true)
        .attr("transform",
            function (d) {
                return "translate(" + (margin.left + (x_year(d.year)+x_year.bandwidth()/2)) + ", " + margin.top + ")";
            })
        .append("rect")
        .classed("bar-citations-rect",true)
        .attr("x", 0)
        .attr("y", chart_dimensions.height)
        .attr("width", x_year.bandwidth() / 2 - 1)
        .attr("height", 0);
}

function showCitationBars(minYear,maxYear) {
    d3.selectAll(".bar-citations-rect")
        .filter(function(d) { return (d.year >= minYear && d.year <= maxYear)})
        .transition()
        .duration(1000)
        .attr("y",function (d) { return (chart_dimensions.height-y_citations(d.citations)); })
        .attr("height",function(d) { return y_citations(d.citations)});
    // .on("mouseover", function (d) {
    //     tooltipDiv.transition()
    //         .duration(200)
    //         .style("opacity", .9);
    //     tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations)
    //         .style("left", (d3.event.pageX) + "px")
    //         .style("top", (d3.event.pageY - 28) + "px");
    // })
    // .on("mouseout", function (d) {
    //     tooltipDiv.transition()
    //         .duration(500)
    //         .style("opacity", 0);
    // });
}

function showYearAxis() {
    const xAxisYear = d3.axisBottom().scale(x_year)
        .tickSize(10).ticks(d3.keys(referencesByYear));

    d3.select(".chart").append("g")
        .attr("id", "xAxisG")
        .classed("x axis",true)
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chart_dimensions.height) + ")")
        .call(xAxisYear)
        .selectAll("text")
        .attr("x", -35)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start");

    d3.select(".chart").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width / 2) + " ," +
            (margin.top + chart_dimensions.height + 50) + ")")
        .style("text-anchor", "middle")
        .text("Year");
}

function createPaperAxis() {
    yAxisPapers.scale(y_papers_axis)
        .tickSize(10).ticks(20);

    d3.select(".chart").append("g")
        .attr("id", "yAxisPapersG")
        .classed("y-axis-papers",true)
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisPapers);

    d3.select("svg").append("text")
        .attr("id", "yAxisPapersLabel")
        .attr("transform",
            "translate(8," + (margin.top + chart_dimensions.height + margin.bottom + chart_dimensions.height / 2) + ")" +
            ", rotate(-90)")
        .style("text-anchor", "middle")
        .text("Papers");
}

function showPaperAxis() {
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
}
function createCitationAxis() {
    yAxisCitations.scale(y_citations_axis)
        .tickSize(10).ticks(20);

    d3.select(".chart").append("g")
        .attr("id", "yAxisCitationsG")
        .classed("y-axis-citations",true)
        .attr("transform", "translate(" + (8 + margin.left + chart_dimensions.width) + "," +
            (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisCitations)
        .selectAll("text")
        .classed("citation-legend",true)
        .attr("x", 15)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "start");

    d3.select(".chart").append("text")
        .attr("id", "yAxisCitationsLabel")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width + 50) + ","
            + ((margin.top + chart_dimensions.height + margin.bottom) + chart_dimensions.height / 2) + "),rotate(-90)")
        .style("text-anchor", "middle")
        .text("Citations");

}

function showCitationAxis() {

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
}
function showTitleIntro() {
    d3.select("#chart-div")
        .classed("invisible",false);

    const div = d3.select("#chart-div")
        .append("div");

    div.attr("id","intro-title")
        .attr("style","width: 900px; height: 500px; padding: 80px;position: relative; z-index: 2; top: 0; left: 0; background-color: rgb(158,202,225); opacity: 0");

    div.append("h4")
        .attr("align","left")
        .html("Welcome");

    div.append("p")
        .html("<p>This website contains a narrative visualization presenting data related to research into cybersecurity " +
            "for SCADA systems. SCADA (Supervisory Control and Data Acquisition) systems are used for " +
            "monitoring and control of critical infrastructure elements such as pipelines, power distribution " +
            "networks, nuclear power facilities.</p>");

    div.append("p")
        .html("<p>The narrative visualization is divided into two parts. The first part presents the overarching " +
            "story of SCADA security research as it has developed over the last 30+ years. This is done " +
            "using animated bar charts showing key metrics of papers published and citations received year over year.</p>");

    div.append("p")
        .html("<p>The second part allows you to explore the literature yourself by filtering and selecting data " +
            "and seeing the underlying research papers.</p>");
    div.append("p")
        .html("<p>Use the right arrow button in the top left of this page to navigate to the next scene in the " +
            "narrative visualization.</p>");

    d3.select("#intro-title")
        .transition()
        .duration(1000)
        .style("opacity",0.95);

    d3.select("#chart-id")
        .transition()
        .duration(1000)
        .style("opacity",1.0);
}
function hideTitleIntro() {

    d3.select("#intro-title")
        .transition()
        .duration(500)
        .style("opacity",0)
        .remove();

}

function animateScene0() {

    showTitleIntro();

    initializeChartArea();
    calculateScales();

    createPaperBars();
    showYearAxis();
    createPaperAxis();
    showPaperAxis();
    showPaperBars(0, 2019);

    createCitationBars();
    createCitationAxis();
    showCitationAxis();
    showCitationBars(0,2019);

    showChartTitle("SCADA Cybersecurity papers and citations queried from Scopus, as of July 2018");
}
function animateScene1() {

    hideTitleIntro();
    hideCitationBars();
    hideCitationAxis();
    hidePaperBars(2002,2019);

    showPaperBars(0,2001);
    changeChartTitle("SCADA Cybersecurity papers published, year-over-year, up to 2001")
    insertAnnotation("scene-1");

}
function createCitationCircles() {
    d3.select(".chart")
        .selectAll("circle").data(dataSet)
        .enter()
        .append("circle")
        .attr("class", "circle-citations")
        .attr("cx", function(d) { return margin.left + x_year(d.year) + x_year.bandwidth()/2} )
        .attr("cy", chart_dimensions.height)
        .attr("r", 0)
        .attr("stroke", function (d) {
            return categoryDiscreteColorScale(d.type);
        })
        .attr("fill", "black")
        .attr("fill-opacity", "1")
        .attr("stroke-width", 0);
    // .on("mouseover", function (d) {
    //     tooltipDiv.transition()
    //         .duration(200)
    //         .style("opacity", .9);
    //     tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations)
    //         .style("left", (d3.event.pageX) + "px")
    //         .style("top", (d3.event.pageY - 28) + "px");
    // })
    // .on("mouseout", function (d) {
    //     tooltipDiv.transition()
    //         .duration(500)
    //         .style("opacity", 0);
    // });

}

function showChartTitle( title ) {
    d3.select(".chart")
        .append("text")
        .attr("class","chart-title")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width / 2) + ","
            + (margin.top / 2) + ")")
        .style("text-anchor", "middle")
        .style("opacity",0)
        .text(title);

    d3.select(".chart-title")
        .transition()
        .duration(1000)
        .style("opacity",1);
}

function changeChartTitle(title) {
    console.log(d3.select(".chart-title"));
    d3.select(".chart-title")
        .transition()
        .duration(1000)
        .text(title);
}

function animateScene2() {
    insertAnnotation("scene-2");
    showPaperBars(2002,2019);
    changeChartTitle("SCADA Cybersecurity papers, year-over-year, up to July 2018")
}

function animateScene3() {
    removeAnnotation("scene-1");
    removeAnnotation("scene-2");

    createCitationAxis();
    showCitationAxis();
    createCitationBars();
    showCitationBars(0,2019);

    changeChartTitle("SCADA Cybersecurity papers published and citations received, up to July 2018");
    insertAnnotation("scene-3a");
    insertAnnotation("scene-3b");
    insertAnnotation("scene-3c");

    //
    // d3.selectAll(".bar-citations")
    //     .transition()
    //     .delay(function(d) { return (d.year-1980)})
    //     .duration(1000)
    //     .attr("height", function(d) { return y_citations(d.citations)+0.5;})
    //     .attr("y",function(d) {
    //         if (!referencesByYear[d.year].citationsBarHeight) {
    //             referencesByYear[d.year].citationsBarHeight = 0;
    //         }
    //         referencesByYear[d.year].citationsBarHeight += y_citations(d.citations);
    //         return (chart_dimensions.height-referencesByYear[d.year].citationsBarHeight)});
}


function hidePaperBars(minYear,maxYear) {
    d3.selectAll(".bar-papers-rect")
        .filter(function(d) { return (d.year >= minYear && d.year <= maxYear);})
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", chart_dimensions.height);
}

function hidePaperAxis() {
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

}

function hideCitationBars() {
    d3.selectAll(".bar-citations-rect")
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", chart_dimensions.height);
}
function morphCitationAxisForward() {
    yAxisCitations.scale(y_citations_single_axis);

    d3.select("#yAxisCitationsG")
        .transition()
        .delay(1000)
        .duration(1000)
        .call(yAxisCitations.tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("x",15)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .style("text-anchor", "start");
}
function showCitationCircles() {
    d3.selectAll(".circle-citations")
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("cy",function(d) {
            if (d.citations === 0)
                return (margin.top+chart_dimensions.height);
            else
                return (margin.top + chart_dimensions.height-y_citations_single(d.citations)) })
        .attr("r",5)
        .attr("fill","black")
        .attr("fill-opacity","0")
        .attr("stroke-width", 3);
}

function enableBrush() {
    brush = d3.brush()
        .on("brush", brushed).on("start",brushStart).on("end",brushEnd);
    d3.select(".chart")
        .append("g")
        .attr("class", "brush")
        .call(brush);
}

function animateScene4() {
    removeAnnotation("scene-3a");
    removeAnnotation("scene-3b");
    removeAnnotation("scene-3c");

    hidePaperBars(0,2019);
    hidePaperAxis();
    hideCitationBars();

    createCitationCircles();
    morphCitationAxisForward();
    showCitationCircles();

    changeChartTitle("Every paper queried from Scopus, plotted by year and citation count and colored by type");
    enableBrush();

    createLegend();
}

function deanimateScene1() {
    removeAnnotation("scene-1");
    showPaperBars(2002,2019);
    showCitationBars(0,2019);
    showCitationAxis();
    showTitleIntro();
}
function deanimateScene2() {
    removeAnnotation("scene-2");
    hidePaperBars(2002,2019);
}

function hideCitationAxis() {
    d3.select("#yAxisCitationsLabel")
        .transition()
        .duration(500)
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width + 50) + ","
            + ((margin.top + chart_dimensions.height + margin.bottom) + chart_dimensions.height / 2) + "),rotate(-90)");

    d3.select("#yAxisCitationsG")
        .transition()
        .duration(500)
        .attr("transform", "translate(" + (8 + margin.left + chart_dimensions.width) + "," +
            (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisCitations);
}

function deanimateScene3() {
    removeAnnotation("scene-3a");
    removeAnnotation("scene-3b");
    removeAnnotation("scene-3c");
    insertAnnotation("scene-2");
    insertAnnotation("scene-1");

    hideCitationBars();
    hideCitationAxis();

}

function disableBrush() {
    clearBrush();

    d3.select(".chart").selectAll(".brush").remove();

}

function morphCitationAxisBackward() {
    yAxisCitations.scale(y_citations_axis);

    d3.select("#yAxisCitationsG")
        .transition()
        .duration(500)
        .call(yAxisCitations.tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "start");
}

function hideCitationCircles() {
    d3.selectAll(".circle-citations")
        .transition()
        .duration(500)
        .attr("cy", (margin.top+chart_dimensions.height))
        .attr("r", 0)
        .attr("stroke-width", 0)
        .remove();
}

function deanimateScene4() {
    deleteLegend();
    disableBrush();
    clearFilters();

    hideCitationCircles();
    morphCitationAxisBackward();

    showCitationBars(0,2019);
    showPaperAxis();
    showPaperBars(0,2019);

    insertAnnotation("scene-3a");
    insertAnnotation("scene-3b");
    insertAnnotation("scene-3c");
}
function clearFilters() {
    brush_applied = false;
    year_filter.min = -1;
    year_filter.max = -1;
    filter_applied = false;
    d3.keys(category_filter).forEach(function(d) { category_filter[d] = true;})
}
function deleteLegend() {
    d3.select(".filter-category tbody").selectAll("tr").remove();
}
function brushStart() {
    if (d3.event.selection === null)
        clearBrush();
    brush_applied = true;
    year_brush.min = -1;
    year_brush.max = -1;
    citations_brush.min = -1;
    citations_brush.max = -1;
}

function clearBrush() {
    filter_applied = false;
    brush_applied = false;
    updateBrush();
    updateReferencesTable();
}

function isInsideBrush(d) {
    return (
        category_filter[d.type] &&
        (
            !brush_applied ||
            ((d.year >= year_brush.min) && (d.year <= year_brush.max) &&
                (d.citations >= citations_brush.min) && (d.citations <= citations_brush.max))
        )
    );
}

function brushed() {
    // Set the current brush filter
    const topLeft = {
        x: d3.event.selection[0][0],
        y: d3.event.selection[0][1]
    };
    const bottomRight = {
        x: d3.event.selection[1][0],
        y: d3.event.selection[1][1]
    };

    const minYear = Math.round(x_year.invert(topLeft.x-margin.left+x_year.bandwidth()/2));
    const maxYear = Math.round(x_year.invert(bottomRight.x-margin.left-x_year.bandwidth()/2));

    let minCitations = 0;
    if ((bottomRight.y-margin.top) < chart_dimensions.height)
        minCitations = Math.round(y_citations_single_axis.invert(bottomRight.y-margin.top));

    const maxCitations = Math.round(y_citations_single_axis.invert(topLeft.y-margin.top));

    let brush_changed = false;

    if (year_brush.min !== minYear || year_brush.max !== maxYear) {
        year_brush.min = minYear;
        year_brush.max = maxYear;
        brush_changed = true;
    }
    if (citations_brush.min !== minCitations || citations_brush.max !== maxCitations) {
        citations_brush.min = minCitations;
        citations_brush.max = maxCitations;
        brush_changed = true;
    }

    if (brush_changed) {
        updateBrush();
    }
}
function brushEnd() {
    if (d3.event.selection === null) {
        brush_applied = false;
        updateBrush();
        updateReferencesTable();
    }
    else {
        brush_applied = true;
        updateReferencesTable();
    }
}
function clearReferenceTable() {
    d3.selectAll(".publications tbody tr").remove();
}
function updateReferencesTable() {
    let selection;

    clearReferenceTable();
    if (brush_applied) {
        selection = d3.select(".publications tbody").selectAll("tr").data(dataSet.sort(function(a,b) {
            return d3.descending(a.citations,b.citations); } ))
            .enter()
            .filter(function(d) { return isInsideBrush(d); })
            .append("tr");
        selection.append("td")
            .html(function(d) { return d.year; });
        selection.append("td")
            .html(function(d) { return d.type; });
        selection.append("td")
            .append("a")
            .attr("href",function(d) { return d.url; })
            .attr("target","_blank")
            .html(function(d) { return d.title; });
        selection.append("td")
            .html(function(d) { return d.authors; });
        selection.append("td")
            .html(function(d) { return d.citations; });
    }
}

function updateLegend() {
    d3.select(".filter-category checkbox").data(d3.keys(category_filter))
        .property("checked",function(d) {
            if (category_filter[d])
                return true;
            else
                return null;
        })
}

function createLegend() {
    const selection = d3.select(".filter-category tbody").selectAll("tr").data(d3.keys(category_filter))
        .enter()
        .append("tr");
    selection.append("td")
        .append("input")
        .attr("id",function(d) {
            return "checkbox-" + d.toLowerCase().replace(" ","-");
        } )
        .attr("type","checkbox")
        .attr("width","40px")
        .property("checked",function(d) {
            if (category_filter[d])
                return true;
            else
                return null;
        })
        .on("change",function(d) {
            category_filter[d] = d3.select("#"+ "checkbox-" + d.toLowerCase().replace(" ","-")).property("checked");
            updateBrush();
            updateReferencesTable();
        });
    selection.append("td")
        .attr("bgcolor",function(d) {
            return d3.color(categoryDiscreteColorScale(d)).hex();
        })
        .attr("width","20px")
        .on("mouseover",function(d) { mouseOverCategory(d); })
        .on("mouseout",function() { updateBrush()});
    selection.append("td")
        .html(function(d) { return d})
        .on("mouseover",function(d) { mouseOverCategory(d); })
        .on("mouseout",function() { updateBrush()});

    updateLegend();
}

function updateBrush() {
    d3.selectAll(".circle-citations")
        .classed("outside-brush",function(d) {
            return (!isInsideBrush(d));
        })
        .classed("inside-brush",function(d) {
            return (isInsideBrush(d));
        });
}
function categorySelected(category) {
    category_filter[category] = this.checked;
    updateLegend();
    updateReferencesTable();
}
function mouseOverCategory(category) {
    d3.selectAll(".circle-citations")
        .classed("outside-brush",function(d) {
            return (d.type !== category);
        })
        .classed("inside-brush", function(d) {
            return (d.type === category);
        });
}