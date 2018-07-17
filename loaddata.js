var referencesByYear = {};

var frame = 1;

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

    console.log("Frames to jump = " + framesToJump);
    console.log("Reverse " + reverse);
    console.log("Abs to jump " + Math.abs(framesToJump));
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
    [null, null],
    [animateScene2,deanimateScene2],
    [animateScene3,deanimateScene3],
    [null,null]
];

function animateScene2() {
    console.log("Animate 2");
}

function animateScene3() {
    console.log("Animate 3");
}

function deanimateScene2() {
    console.log("De-animate 2");
}

function deanimateScene3() {
    console.log("De-nimate 3");
}
d3.dsv(",", "./data.csv", function(d) {

    const dataobj = {
        year: +d.Year,
        citations: +d["Cited by"],
        type: d.Type
    };

    if (!referencesByYear[dataobj.year])
        referencesByYear[dataobj.year] = { year: dataobj.year, papers: 0, citations: 0};

    referencesByYear[dataobj.year].papers++;
    referencesByYear[dataobj.year].citations += dataobj.citations;

    return dataobj;

}).then(function(data) {

    const canvas = {width: 900, height: 500};
    const margin = {top: 50, left: 50, bottom: 70, right: 50};
    const chart_dimensions = {
        width: canvas.width - (margin.left + margin.right),
        height: canvas.height - (margin.top + margin.bottom)
    };

    const referenceData = d3.values(referencesByYear);

    const x_year = d3.scaleBand()
        .range([0, chart_dimensions.width])
        .domain(d3.keys(referencesByYear));

    const y_papers = d3.scaleLinear()
        .domain([0, d3.max(referenceData, d => d.papers)])
        .range([0,chart_dimensions.height]);

    const y_papers_axis = d3.scaleLinear()
        .domain([0, d3.max(referenceData, d => d.papers)])
        .range([chart_dimensions.height,0]);

    const y_citations = d3.scaleLinear()
        .domain([0, d3.max(referenceData, d => d.citations)])
        .range([0,chart_dimensions.height]);

    const y_citations_axis = d3.scaleLinear()
        .domain([0, d3.max(referenceData, d => d.citations)])
        .range([chart_dimensions.height,0]);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const annotations = {
        a_911_attack: {
            className: "invisible toggle-visibility-1",
            type: d3.annotationLabel,
            note: {
                label: "A massive terrorist attack on the United States",
                bgPadding: 20,
                title: "September 11th, 2001",
                align:"middle",
                orientation:"leftRight",
                lineType:"vertical"
            },
            connector:{end:"arrow",
                type:"line"},
            // This is where arrow is pointing
            x: x_year("2001")+x_year.bandwidth()/2,
            y: chart_dimensions.height - y_papers(referencesByYear["2001"].papers),
            // This is where the text box is offset
            dy: -50,
            dx: -50,
        },
        a_911_abrupt_increase: {
            className: "invisible toggle-visibility-1",
            type: d3.annotationLabel,
            note: {
                label: "Abrupt increase in cyber-security research",
                bgPadding: 20,
                title: "Post 9-11",
                align: "middle",
                orientation: "leftRight",
                lineType: "vertical"
            },
            connector: {
                end: "arrow",
                type: "line"
            },
            // This is where arrow is pointing
            x: x_year("2002")+x_year.bandwidth()/2,
            y: chart_dimensions.height - y_papers(referencesByYear["2002"].papers),
            // This is where the text box is offset
            dy: -80,
            dx: -100
        },
        a_2010_peak_citations: {
            className: "invisible toggle-visibility-3",
            type: d3.annotationCalloutCircle,
            note: {
                label: "Citations suddenly increase -- Why?",
                bgPadding: 20,
                title: "High citation count",
                align:"middle",
                orientation:"leftRight",
                lineType:"vertical"
            },
            connector:{end:"arrow",
                type:"line"},
            // This is where arrow is pointing
            x: x_year("2010")+x_year.bandwidth()/2,
            y: chart_dimensions.height - y_citations(referencesByYear["2010"].citations),
            // This is where the text box is offset
            dy: 50,
            dx: -100,
            subject: { radius: 30, radiusPadding: 10 }
        },
        a_linear_increase: {
            className: "invisible toggle-visibility-2",
            type: d3.annotationLabel,
            note: {
                label: "Research has grown steadily",
                bgPadding: 20,
                title: "15 years after 9-11",
                align: "middle",
                orientation: "leftRight",
                lineType: "vertical"
            },
            connector: {
                end: "arrow",
                type: "line"
            },
            // This is where arrow is pointing
            x: x_year("2016")+x_year.bandwidth()/2,
            y: chart_dimensions.height - y_papers(referencesByYear["2016"].papers),
            // This is where the text box is offset
            dy: 100,
            dx: -200
        },
        a_citation_dropoff: {
            className: "invisible toggle-visibility-4",
            type: d3.annotationLabel,
            note: {
                label: "Citation counts drop off",
                bgPadding: 20,
                title: "About 5 years ago",
                align: "middle",
                orientation: "leftRight",
                lineType: "vertical"
            },
            connector: {
                end: "arrow",
                type: "line"
            },
            // This is where arrow is pointing
            x: x_year("2013"),
            y: chart_dimensions.height - y_citations(referencesByYear["2013"].citations),
            // This is where the text box is offset
            dy: -20,
            dx: -150
        },
        a_paper_citation_ratio: {
            className: "invisible toggle-visibility-2",
            type: d3.annotationCalloutCircle,
            note: {
                label: "After 9-11 the trend has been consistently about 10 citations per published paper on average",
                bgPadding: 20,
                title: "Paper-citation ratio",
                align:"middle",
                orientation:"leftRight",
                lineType:"vertical"
            },
            connector:{end:"arrow",
                type:"line"},
            // This is where arrow is pointing
            x: x_year("2005"),
            y: chart_dimensions.height - y_citations(referencesByYear["2005"].citations),
            // This is where the text box is offset
            dy: -80,
            dx: -50,
            subject: { radius: 20, radiusPadding: 5 }
        }
    };

    // const makeAnnotations = d3.annotation()
    //     .editMode(false)
    //     .notePadding(15)
    //     .annotations(d3.values(annotations));

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
        })
        .transition()
        .filter(function(d) { return (d.year <= 2001)})
        .delay(function(d) { if (d.year < 2002) return 0; else return (d.year-2001)})
        .duration(1000)
        .attr("height", function(d) { return y_citations(d.citations)+0.5;})
        .attr("y",function(d) {
            if (!referencesByYear[d.year].citationsBarHeight) {
                referencesByYear[d.year].citationsBarHeight = 0;
            }
            referencesByYear[d.year].citationsBarHeight += y_citations(d.citations);
            return (chart_dimensions.height-referencesByYear[d.year].citationsBarHeight)});

    bar.append("rect")
        .attr("class","bar-papers")
        .attr("width", x_year.bandwidth()/2-1)
        .attr("height", 0)
        .attr("x",x_year.bandwidth()/2)
        .attr("y",chart_dimensions.height)
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


    // d3.select("svg")
    //     .append("g")
    //     .attr("class", "annotation-group")
    //     .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    //     .call(makeAnnotations);

    const xAxisYear = d3.axisBottom().scale(x_year)
        .tickSize(10).ticks(referenceData.length);

    const yAxisPapers = d3.axisLeft().scale(y_papers_axis)
        .tickSize(10).ticks(20);

    const yAxisCitations = d3.axisRight().scale(y_citations_axis)
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
        .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
        .call(yAxisPapers)
        .selectAll("text")
        .attr("x",-30)
        .attr("y",0)
        .attr("dx",0)
        .attr("dy","0.35em")
        .style("text-anchor", "start");

    d3.select("svg").append("text")
        .attr("transform",
            "translate(8," + (margin.top + chart_dimensions.height/2) + "),rotate(-90)")
        .style("text-anchor", "middle")
        .text("Papers");

    d3.select("svg").append("g")
        .attr("id", "yAxisCitationsG")
        .attr("class", "y axis citations")
        .attr("transform", "translate(" + (margin.left + chart_dimensions.width) + "," +
            (margin.top) + ")")
        .call(yAxisCitations)
        .selectAll("text")
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
