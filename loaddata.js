const canvas = {width: 900, height: 500};
const margin = {top: 50, left: 50, bottom: 70, right: 70};
const chart_dimensions = {
    width: canvas.width - (margin.left + margin.right),
    height: canvas.height - (margin.top + margin.bottom)
};

const referencesByYear = {};

let frame = 0;

const y_papers = d3.scaleLinear();
const y_citations = d3.scaleLinear();
const y_citations_single = d3.scaleLog();
const y_citations_single_axis = d3.scaleLog();

const yAxisCitations = d3.axisRight();
const yAxisPapers = d3.axisLeft();
const x_year = d3.scaleBand();

let annotationDiv;
let dataSet;
let svg;

function frameForward() {
    if (frame === 4) return;
    frame++;
    toggleVisibility();
    toggleEnabled();
    toggleActive();
    animateScene( true );
}
function frameBack() {
    if (frame === 1) return;
    toggleVisibility();
    toggleEnabled();
    toggleActive();
    animateScene( false );
    frame--;
}
function animateScene( forward ) {
    if (frame > (animateFunctions.length-1)) return;

    const animateFunction = animateFunctions[frame][(forward?0:1)];
    if (animateFunction)
        animateFunction();
}

function jumpToFrame( newFrame ) {
    if (frame === newFrame) return;

    const framesToJump = (newFrame - frame);

    let reverse = (framesToJump < 0);

    let i = 0;
    for (i = 0; i < Math.abs(framesToJump); i++) {
        if (reverse)
            frameBack();
        else
            frameForward();
    }
}
function toggleVisibility() {
    let className = "toggle-visibility-" + frame;

    var elements = document.getElementsByClassName(className);

    for (i=0; i < elements.length; i++) {
        elements[i].classList.toggle("invisible")
    }
}
function toggleEnabled() {
    let className = "toggle-enabled-" + frame;

    var elements = document.getElementsByClassName(className);

    for (i=0; i < elements.length; i++) {
        elements[i].classList.toggle("disabled")
    }
}
function toggleActive() {
    let className = "toggle-active-" + frame;

    var elements = document.getElementsByClassName(className);

    for (i=0; i < elements.length; i++) {
        elements[i].classList.toggle("active")
    }
}
var animateFunctions = [
    [null, null],
    [animateScene1, null],
    [animateScene2,deanimateScene2],
    [animateScene3,deanimateScene3],
    [animateScene4,null]
];

function animateScene1() {
    insertAnnotation( "scene-1" )
}

function removeAnnotation( annotationName ) {
    const rectName = "annotation-rect-" + annotationName;
    const textName = "annotation-text-" + annotationName;
    const lineSetName = "annotation-lines-" + annotationName;
    const lineClass = "annotation-line-" + annotationName;
    const tspanClass = "annotation-tspan-" + annotationName;

    d3.selectAll("." + lineClass)
        .transition()
        .duration(750)
        .attr("opacity",0)
        .remove();

    d3.select("#" + rectName)
        .transition()
        .delay(250)
        .duration(500)
        .attr("opacity",0)
        .remove();

    d3.selectAll("." + tspanClass)
        .transition()
        .delay(250)
        .duration(500)
        .attr("opacity",0)
        .remove();
}

function insertAnnotation( annotationName ) {
    const rectName = "annotation-rect-" + annotationName;
    const textName = "annotation-text-" + annotationName;
    const lineSetName = "annotation-lines-" + annotationName;
    const lineClass = "annotation-line-" + annotationName;
    const tspanClass = "annotation-tspan-" + annotationName;

    const annotation = annotations[annotationName];
    // First add the text lines to the graph so we can calculate the geometry
    // of it
    d3.select(".chart")
        .append("text")
        .attr("id",textName)
        .selectAll("tspan").data(annotation.text)
        .enter()
        .append("tspan")
        .attr("class",tspanClass)
        .attr("opacity",0)
        .attr("text-anchor","start")
        .attr("x",10)
        .attr("y",function(d,i) { return (i*15) })
        .text(function(d,i) { return annotation.text[i]});

    // Now calculate the bounding rectangle of this text area
    const annotationText = document.getElementById(textName);
    const SVGRect = annotationText.getBBox();
    const rectDimensions = {
        height: (10 + SVGRect.height + 10),
        width: (10 + SVGRect.width + 10)
    };
    const textBlockDimensions = annotationText.getBoundingClientRect();

    // Remove the text, as we will want to add it in a different order so that z layering works
    d3.select("#"+textName).remove();

    const textBlockTopLeft = {
        x: (margin.left+(x_year(annotation.textCenter.year)+(x_year.bandwidth()*0.75))-textBlockDimensions.width/2),
        y: (margin.top+chart_dimensions.height-y_papers(annotation.textCenter.papers)+textBlockDimensions.height/2)
    };

    const lineStartingPoint = {
        x: (textBlockTopLeft.x + (textBlockDimensions.width/2)),
        y: (textBlockTopLeft.y + (textBlockDimensions.height/2))
    };

    d3.select(".chart")
        .append("g")
        .attr("id",lineSetName)
        .selectAll("line").data(annotation.aimingPoints)
        .enter()
        .append("line")
        .attr("class",lineClass)
        .attr("opacity",0)
        .attr("style","stroke:rgb(0,0,0);stroke-width:0.5px")
        .attr("x1",lineStartingPoint.x)
        .attr("y1",lineStartingPoint.y)
        .attr("x2",function(d,i) {
            return (margin.left + (x_year(annotation.aimingPoints[i].year)+x_year.bandwidth()*0.75));
        })
        .attr("y2",function(d,i) {
            return (margin.top + chart_dimensions.height - y_papers(annotation.aimingPoints[i].papers))
        });

    d3.select(".chart")
        .append("rect")
        .attr("id",rectName)
        .attr("opacity",0)
        .attr("x",textBlockTopLeft.x-10)
        .attr("y",textBlockTopLeft.y-20)
        .attr("height",rectDimensions.height)
        .attr("width", rectDimensions.width)
        .attr("fill","lightgrey");

    // Under our text section create tspans for every line of text in the annotation
    d3.select(".chart")
        .append("text")
        .attr("id",textName)
        .selectAll("tspan").data(annotation.text)
        .enter()
        .append("tspan")
        .attr("class",tspanClass)
        .attr("opacity",0)
        .attr("text-anchor","start")
        .attr("x",textBlockTopLeft.x)
        .attr("y",function(d,i) { return (textBlockTopLeft.y + i*15) })
        .text(function(d,i) { return annotation.text[i]});

    d3.selectAll("." + lineClass)
        .transition()
        .delay(500)
        .duration(500)
        .attr("opacity",1);

    d3.select("#" + rectName)
        .transition()
        .duration(1000)
        .attr("opacity",1);

    d3.selectAll("." + tspanClass)
        .transition()
        .duration(1000)
        .attr("opacity",1);
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

    // Figure out the aiming point of the annotation line
    const svgX = (margin.left + x_year(2002));
    const svgY = (margin.top + chart_dimensions.height - y_papers(30)); // todo: change bar charts to single rect and use value of point for Y too


    // const svg = $('.chart')[0];
    //
    // const svgPoint = svg.createSVGPoint();
    // svgPoint.x = svgX;
    // svgPoint.y = svgY;
    //
    // const m = svgPoint.matrixTransform(svg.getScreenCTM());
    //

    const annotationGroup = document.getElementById("annotation-group-9-11");
    const annotationText = document.getElementById("annotation-text-9-11");
    const annotationTextDimensions = annotationText.getBoundingClientRect();

    // Figure out where to position the annotation text, relative to the aiming point
    const dx = -annotationTextDimensions.width/2;
    const dy = -200;

    d3.select("#annotation-line-9-11")
        .transition()
        .duration(1000)
        .attr("display","block")
        .attr("x1",(svgX+dx+annotationTextDimensions.width/2))
        .attr("y1",(svgY+dy+annotationTextDimensions.height/2))
        .attr("x2",(svgX+x_year.bandwidth()/2))
        .attr("y2",(svgY));

    d3.select("#annotation-group-9-11")
        .transition()
        .duration(1000)
        .attr("display","block");

    d3.select("#annotation-text-9-11")
        .transition()
        .attr("transform","translate(" + (svgX+dx) + "," + (svgY+dy) + ")");

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
        .call(yAxisCitations.tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("x",15)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .style("text-anchor", "start");

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

function brushed() {
    console.log("Brushed");
    console.log(d3.event);
}
function deanimateScene2() {
}

function deanimateScene3() {
    console.log("De-nimate 3");
}
d3.dsv(",", "./data.csv", function(d) {

    const dataobj = {
        year: +d.Year,
        citations: +d["Cited by"],
        type: d.Source
    };

    if (!referencesByYear[dataobj.year])
        referencesByYear[dataobj.year] = { year: dataobj.year, papers: 0, citations: 0};

    referencesByYear[dataobj.year].papers++;
    referencesByYear[dataobj.year].citations += dataobj.citations;

    return dataobj;

}).then(function(data) {

    dataSet = data;

    const referenceData = d3.values(referencesByYear);

    x_year.range([0, chart_dimensions.width])
        .domain(d3.keys(referencesByYear));

    y_papers.domain([0, d3.max(referenceData, d => d.papers)])
        .range([0,chart_dimensions.height]);

    const y_papers_axis = d3.scaleLinear()
        .domain([0, d3.max(referenceData, d => d.papers)])
        .range([chart_dimensions.height,0]);

    y_citations.domain([0, d3.max(referenceData, d => d.citations)])
        .range([0,chart_dimensions.height]);

    const y_citations_axis = d3.scaleLinear()
        .domain([0, d3.max(referenceData, d => d.citations)])
        .range([chart_dimensions.height,0]);

    y_citations_single.domain([1, d3.max(data, d => d.citations)])
        .range([0, chart_dimensions.height]);

    y_citations_single_axis.domain([1, d3.max(data, d => d.citations)])
        .range([chart_dimensions.height,0]);

    const typeSet = d3.set();

    d3.values(data).map(
        function(d) {
            typeSet.add(d.type);
            return d;
        });

    const categoryContinuousColorScale = d3.scaleBand()
        .domain(typeSet.values())
        .range([0,350]);

    const categoryDiscreteColorScale = d3.scaleOrdinal()
        .domain(typeSet.values())
        .range(typeSet.values().map(function(d) {
            return "hsl( " + categoryContinuousColorScale(d) + ", 75%, 50%)"}));

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
        .data(data)
        .enter().append("g")
        .attr("transform",
            function (d) {
                return "translate(" + (margin.left + (x_year(d.year))) + ", " + margin.top + ")";
            });

    bar.append("rect")
        .attr("class","bar-citations")
        .attr("x",0)
        .attr("y",chart_dimensions.height)
        .attr("width", x_year.bandwidth()/2-1)
        .attr("height", 0)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");


        })
        .on("mouseout", function(d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });

    bar.append("rect")
        .attr("class","bar-papers")
        .attr("width", x_year.bandwidth()/2-1)
        .attr("height", 0)
        .attr("x",x_year.bandwidth()/2)
        .attr("y",chart_dimensions.height)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltipDiv.transition()
                .duration(1000)
                .style("opacity", 0);
        })
        .transition()
        .filter(function(d) { return (d.year <= 2001)})
        .duration(1000)
        .delay(function(d) { if (d.year < 2002) return 0; else return (d.year-2001)*10})
        .attr("height",function(d) { return y_papers(1)+0.5})
        .attr("y",function(d) {
            if (!referencesByYear[d.year].paperBarHeight) {
                referencesByYear[d.year].paperBarHeight = 0;
            }
            referencesByYear[d.year].paperBarHeight += y_papers(1);
            return chart_dimensions.height-referencesByYear[d.year].paperBarHeight});

    bar.append("circle")
        .attr("class","circle-citations")
        .attr("cx",0)
        .attr("cy",chart_dimensions.height)
        .attr("r",0)
        // .attr("class", (function(d) { return ("type-category-color-" + d.type.toLowerCase().replace(" ","-"))}))
        .attr("stroke",function(d) { return categoryDiscreteColorScale(d.type); })
        .attr("fill","black")
        .attr("fill-opacity","1")
        .attr("stroke-width", 0)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv	.html("Year: " + d.year + "<br/>" + "Papers: " + d.papers + "<br/>" + "Citations: " + d.citations )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
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
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chart_dimensions.height) +")")
        .call(xAxisYear)
        .selectAll("text")
        .attr("x",-35)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width/2) + " ," +
            (margin.top + chart_dimensions.height + 50) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    d3.select("svg").append("g")
        .attr("id", "yAxisPapersG")
        .attr("class", "y axis papers")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisPapers);

    d3.select("svg").append("text")
        .attr("id","yAxisPapersLabel")
        .attr("transform",
            "translate(8," + (margin.top + chart_dimensions.height + margin.bottom + chart_dimensions.height/2) + ")" +
            ", rotate(-90)")
        .style("text-anchor", "middle")
        .text("Papers");

    d3.select("#yAxisPapersG")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxisPapers)
        .selectAll("text")
        .attr("x",-30)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .style("text-anchor", "start");

    d3.select("#yAxisPapersLabel")
        .transition()
        .duration(1000)
        .attr("transform",
            "translate(8," + (margin.top + chart_dimensions.height/2) + ")" +
            ", rotate(-90)");

    d3.select("svg").append("g")
        .attr("id", "yAxisCitationsG")
        .attr("class", "y axis citations")
        .attr("transform", "translate(" + (8+ margin.left + chart_dimensions.width) + "," +
            (margin.top + chart_dimensions.height + margin.bottom) + ")")
        .call(yAxisCitations)
        .selectAll("text")
        .attr("x",15)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("id","yAxisCitationsLabel")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width + 50) + ","
            + ((margin.top + chart_dimensions.height + margin.bottom) + chart_dimensions.height/2) + "),rotate(-90)")
        .style("text-anchor", "middle")
        .text("Citations");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(" + (margin.left + chart_dimensions.width/2) + ","
            + (margin.top/2) + ")")
        .style("text-anchor", "middle")
        .text("SCADA Cybersecurity Papers and Citations, Year-over-Year, as of July 8th, 2018");

    frameForward();
});
