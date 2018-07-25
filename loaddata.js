function loaddata( dataloaded ) {
    d3.dsv(",", "./data.csv", function(d) {

        const dataobj = {
            year: +d.Year,
            citations: +d["Cited by"],
            type: categoryMap[d.Source],
            authors: d["Authors"],
            title: d.Title,
            abstract: d.Abstract
        };

        if (d.DOI) {
            dataobj.url = "http://doi.org/" + d.DOI;
        } else {
            dataobj.url = "http://scholar.google.com/scholar?q=" + dataobj.title;
        }

        if (!referencesByYear[dataobj.year])
            referencesByYear[dataobj.year] = { year: dataobj.year, papers: 0, citations: 0};

        referencesByYear[dataobj.year].papers++;
        referencesByYear[dataobj.year].citations += dataobj.citations;

        return dataobj;

    }).then(function(data) {
        dataSet = data;
        dataloaded();
    });
}
