const canvas = {width: 900, height: 500};
const margin = {top: 50, left: 50, bottom: 70, right: 70};
const chart_dimensions = {
    width: canvas.width - (margin.left + margin.right),
    height: canvas.height - (margin.top + margin.bottom)
};

const referencesByYear = {};

var frame = 0;

const y_papers = d3.scaleLinear();
const y_citations = d3.scaleLinear();
const y_citations_single = d3.scaleLog();
const y_citations_single_axis = d3.scaleLog();

const yAxisCitations = d3.axisRight();
const yAxisPapers = d3.axisLeft();
const x_year = d3.scaleBand();
const categoryDiscreteColorScale = d3.scaleOrdinal();

var filter_applied = false;
var year_filter = { min: -1, max: -1 };
var citations_filter = { min: -1, max: -1 };

var brush_applied = false;
var year_brush = { min: -1, max: -1 };
var citations_brush = { min: -1, max: -1 };

var dataSet;
var svg;
