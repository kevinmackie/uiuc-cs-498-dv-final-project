function initializeVisualization() {
    loaddata( dataloaded );
}

function dataloaded() {
    d3.select("#loading-message")
        .classed("invisible",true);
    d3.select("#chart-id")
        .classed("invisible",false);

    frameForward();
}

function frameForward() {
    if (frame === 4) return;
    frame++;
    toggleVisibility();
    toggleEnabled();
    toggleActive();
    animateScene( true );
}
function frameBack() {
    if (frame === 0) return;
    toggleVisibility();
    toggleEnabled();
    toggleActive();
    animateScene( false );
    frame--;
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

