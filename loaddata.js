function loaddata( dataloaded ) {
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
        dataloaded();
    });
}
