const canvas = {width: 900, height: 500};
const margin = {top: 50, left: 50, bottom: 70, right: 70};
const chart_dimensions = {
    width: canvas.width - (margin.left + margin.right),
    height: canvas.height - (margin.top + margin.bottom)
};

const referencesByYear = {};

let brush;

var frame = -1;

const y_papers = d3.scaleLinear();
const y_citations = d3.scaleLinear();
const y_citations_single = d3.scaleLog();
const y_citations_single_axis = d3.scaleLog();
const y_citations_axis = d3.scaleLinear();
const y_papers_axis = d3.scaleLinear();
let chart;

const yAxisCitations = d3.axisRight();
const yAxisPapers = d3.axisLeft();
const x_year = d3.scaleBand();
const categoryMap = {
    "Review": "Review",
    "Article": "Article",
    "Article in Press": "Press Article",
    "Business Article": "Press Article",
    "Editorial":"Press Article",
    "Conference Paper": "Conference",
    "Conference Review": "Conference",
    "Book": "Book",
    "Open Access":"Open Access",
    "Short Survey": "Short Survey",
    "Note": "Note",
    "Unknown": "Unknown",
    "Abstract Report": "Abstract Report",
    "undefined": "Unknown"};

const legendColorMap = {
        "Review": "#1f77b4",
        "Article": "#d62728",
        "Press Article": "#e377c2",
        "Conference": "#9467bd",
        "Book": "#ff7f0e",
        "Open Access":"#2ca02c",
        "Short Survey":"#8c564b",
        "Note": "#17becf",
        "Unknown": "#7f7f7f",
        "Abstract Report":"#bcbd22"};

const categoryDiscreteColorScale = d3.scaleOrdinal()
    .domain(d3.keys(legendColorMap))
    .range(d3.values(legendColorMap));

var filter_applied = false;
var year_filter = { min: -1, max: -1 };
var citations_filter = { min: -1, max: -1 };

var brush_applied = false;
var year_brush = { min: -1, max: -1 };
var citations_brush = { min: -1, max: -1 };
var category_filter = {
    "Review": true,
    "Article": true,
    "Press Article": true,
    "Conference": true,
    "Book": true,
    "Open Access": true,
    "Short Survey": true,
    "Note": true,
    "Unknown": true,
    "Abstract Report": true
};

var dataSet;
var svg;
