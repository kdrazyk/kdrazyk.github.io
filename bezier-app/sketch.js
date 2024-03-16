// Bezier (Editor)
// The Coding Train / Simon Tiger

let bg_color = '#0e1a24';
let end_color = '#34B9F8';
let bezier_color = '#24A9E8';
let hand_color = '#FEDD5D';
let line_color = '#EECD4D';
let line2_color = '#3e4a54';

let buttonStyle = 'background-color: #8e9aA4; border-color: #8e9aA4; border-radius: 4px; color: #0e1a24; font-size: large; width: 120px;';

let path;
let moving = null;
let controlMode = "A";

function setup() {
    createCanvas(windowWidth, windowHeight);
    path = new Path();

    let selectMode = createButton('Aligned');
    let button = createButton('Reset');
    selectMode.position(140, 10);

    selectMode.style(buttonStyle);
    button.style(buttonStyle);


    
    button.position(10, 10);
    button.mousePressed(() => {
	path.points = [];
	path.points.push(createVector(width / 2 - 100, height / 2));
	path.points.push(createVector(width / 2 - 50, height / 2 - 50));
	path.points.push(createVector(width / 2 + 50, height / 2 + 50));
	path.points.push(createVector(width / 2 + 100, height / 2));
    })
    button.touchStarted(() => {
	path.points = [];
	path.points.push(createVector(width / 2 - 100, height / 2));
	path.points.push(createVector(width / 2 - 50, height / 2 - 50));
	path.points.push(createVector(width / 2 + 50, height / 2 + 50));
	path.points.push(createVector(width / 2 + 100, height / 2));
    })

    selectMode.mousePressed(() => {
	if (controlMode == "A") {
	    selectMode.html("Mirrored");
	    controlMode = "B";
	}
	else if (controlMode == "B") {
	    selectMode.html("Free");
	    controlMode = "C";
	}
	else if (controlMode == "C") {
	    selectMode.html("Aligned");
	    controlMode = "A";
	}
    })

    selectMode.touchStarted(() => {
	if (controlMode == "A") {
	    selectMode.html("Mirrored");
	    controlMode = "B";
	}
	else if (controlMode == "B") {
	    selectMode.html("Free");
	    controlMode = "C";
	}
	else if (controlMode == "C") {
	    selectMode.html("Aligned");
	    controlMode = "A";
	}
    })

    
}

function mousePressed() {
    if (mouseButton == LEFT) {
	for (const p of path.points) {
	    if (dist(p.x, p.y, mouseX, mouseY) < 10) {
		moving = p;
		return;
	    }
	}
    }
    
}
 
function doubleClicked() {
    path.addSegment(mouseX, mouseY);
}

function mouseDragged() {
    if (moving) {
	path.movePoint(moving, mouseX, mouseY, controlMode);
    }
}

function mouseReleased() {
    if (moving) moving = null;
}

function touchStarted() {
    var fs = fullscreen();
    if (!fs) {
	fullscreen(true);
    }
    
    if (touches.length == 2) {
	path.addSegment(mouseX, mouseY);
	return false;
    } else {
	for (const p of path.points) {
	    if (dist(p.x, p.y, mouseX, mouseY) < 50) {
		moving = p;
		return false;
	    }
	}
    }
    
    // prevent default
    return false;
}

function touchMoved() {
    if (moving) {
	path.movePoint(moving, mouseX, mouseY, controlMode);
    }
    return false;
}

function touchEnded() {
    if (moving) moving = null;
    return false;
}


function draw() {
    background(bg_color);

    // if (mySelect.selected() == 'Aligned') { controlMode = 'A'; }
    // else if (mySelect.selected() == 'Mirrored') { controlMode = 'B'; }
    // else if (mySelect.selected() == 'Free') { controlMode = 'C'; }
    
    if (controlMode == "D") {
	path.auto = true;
	path.autoSetAllControlPoints(controlSpacing.getValue());
    } else {
	path.auto = false;
    }
    // if (resetState.getValue() == true) {
    // 	path.points = [];
    // 	path.points.push(createVector(width / 2 - 100, height / 2));
    // 	path.points.push(createVector(width / 2 - 50, height / 2 - 50));
    // 	path.points.push(createVector(width / 2 + 50, height / 2 + 50));
    // 	path.points.push(createVector(width / 2 + 100, height / 2));
    // 	resetState.setValue(false);
    // }
    path.render();
}

class Path {
    constructor() {
	this.points = [];
	this.points.push(createVector(width / 2 - 100, height / 2));
	this.points.push(createVector(width / 2 - 50, height / 2 - 50));
	this.points.push(createVector(width / 2 + 50, height / 2 + 50));
	this.points.push(createVector(width / 2 + 100, height / 2));
	this.closed = false;
	this.auto = false;
    }

    serialize() {
	return JSON.stringify({
	    points: this.points.map((p) => {
		return { x: p.x - width / 2, y: p.y - height / 2 };
	    }),
	    closed: this.closed,
	});
    }

    loopIndex(i) {
	return (i + this.points.length) % this.points.length;
    }

    toggleClosed() {
	if (this.closed) {
	    this.closed = false;
	    this.points.pop();
	    this.points.pop();
	} else {
	    this.closed = true;
	    const anchor1 = this.points[this.points.length - 1];
	    const control1 = this.points[this.points.length - 2];
	    const anchor2 = this.points[0];
	    const control2 = this.points[1];
	    const newControl1 = p5.Vector.lerp(anchor1, control1, -1);
	    const newControl2 = p5.Vector.lerp(anchor2, control2, -1);
	    this.points.push(newControl1, newControl2);
	}
    }

    numSegments() {
	return floor(this.points.length / 3);
    }

    getSegment(i) {
	return [
	    this.points[this.loopIndex(i * 3 + 0)],
	    this.points[this.loopIndex(i * 3 + 1)],
	    this.points[this.loopIndex(i * 3 + 2)],
	    this.points[this.loopIndex(i * 3 + 3)],
	];
    }

    addSegment(x, y) {
	const prevAnchor = this.points[this.points.length - 2];
	const prevControl = this.points[this.points.length - 1];

	const anchor = createVector(x, y);
	const control1 = p5.Vector.lerp(prevControl, prevAnchor, -1);
	const control2 = p5.Vector.lerp(control1, anchor, 0.5);

	this.points.push(control1, control2, anchor);
    }

    movePoint(point, x, y, mode) {
	const i = this.points.indexOf(point);

	if (i % 3 == 0) {
	    const dx = x - point.x;
	    const dy = y - point.y;
	    point.set(x, y);
	    if (i - 1 >= 0 || this.closed) {
		this.points[this.loopIndex(i - 1)].add(dx, dy);
	    }
	    if (i + 1 < this.points.length || this.closed) {
		this.points[this.loopIndex(i + 1)].add(dx, dy);
	    }
	    if (mode == "D") this.autoSetAllControlPoints();
	} else if (mode != "D") {
	    point.set(x, y);
	    const anchorI = i % 3 == 1 ? i - 1 : i + 1;
	    const otherI = i % 3 == 1 ? i - 2 : i + 2;
	    if ((otherI >= 0 && otherI < this.points.length) || this.closed) {
		const anchor = this.points[this.loopIndex(anchorI)];
		const other = this.points[this.loopIndex(otherI)];
		if (mode == "A") {
		    const dist = p5.Vector.dist(anchor, other);
		    const disp = p5.Vector.sub(anchor, point);
		    disp.setMag(dist);
		    other.set(p5.Vector.add(anchor, disp));
		} else if (mode == "B") {
		    other.set(p5.Vector.lerp(anchor, point, -1));
		}
	    }
	}
    }

    autoSetControlPoint(anchorI, controlSpacing) {
	if ((anchorI - 3 < 0 || anchorI + 3 >= this.points.length) && !this.closed)
	    return;

	const anchorLeftI = this.loopIndex(anchorI - 3);
	const anchorRightI = this.loopIndex(anchorI + 3);
	const anchor = this.points[anchorI];
	const anchorLeft = this.points[anchorLeftI];
	const anchorRight = this.points[anchorRightI];
	const dispLeft = p5.Vector.sub(anchorLeft, anchor);
	const dispRight = p5.Vector.sub(anchorRight, anchor);
	const magLeft = dispLeft.mag();
	const magRight = dispRight.mag();
	dispLeft.normalize();
	dispRight.normalize();
	const dirLeft = p5.Vector.sub(dispLeft, dispRight);
	const dirRight = p5.Vector.sub(dispRight, dispLeft);
	dirLeft.setMag(magLeft * controlSpacing);
	dirRight.setMag(magRight * controlSpacing);
	this.points[this.loopIndex(anchorI - 1)].set(
	    p5.Vector.add(anchor, dirLeft)
	);
	this.points[this.loopIndex(anchorI + 1)].set(
	    p5.Vector.add(anchor, dirRight)
	);
    }

    autoSetEdgePoints(controlSpacing) {
	if (this.closed) return;

	this.points[1].set(
	    p5.Vector.lerp(this.points[0], this.points[2], controlSpacing)
	);
	this.points[this.points.length - 2].set(
	    p5.Vector.lerp(
		this.points[this.points.length - 1],
		this.points[this.points.length - 3],
		controlSpacing
	    )
	);
    }

    autoSetAllControlPoints(controlSpacing) {
	for (let i = 0; i < this.points.length; i += 3) {
	    this.autoSetControlPoint(i, controlSpacing);
	}
	this.autoSetEdgePoints(controlSpacing);
    }

    render() {
	if (!this.auto) {
	    for (let i = 0; i < this.numSegments(); i++) {
		const seg = this.getSegment(i);

		stroke(line_color);
		strokeWeight(5);
		line(seg[0].x, seg[0].y, seg[1].x, seg[1].y);
		line(seg[2].x, seg[2].y, seg[3].x, seg[3].y);

		stroke(line2_color);
		strokeWeight(3);
		line(seg[1].x, seg[1].y, seg[2].x, seg[2].y);
	    }
	}
      

	stroke(bezier_color);
	strokeWeight(10);
	noFill();
	beginShape();
	vertex(this.points[0].x, this.points[0].y);
	for (let i = 0; i < this.numSegments(); i++) {
	    const seg = this.getSegment(i);
	    bezierVertex(seg[1].x, seg[1].y, seg[2].x, seg[2].y, seg[3].x, seg[3].y);
	}
	endShape();

	for (let i = 0; i < this.points.length; i++) {
	    const p = this.points[i];
	    if (i % 3 == 0) {
		noStroke();
		fill(end_color);
		circle(p.x, p.y, 20);
	    } else if (!this.auto) {
		noStroke();
		fill(hand_color);
		circle(p.x, p.y, 16);
	    }
	}
    }
}

/* full screening will change the size of the canvas */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling the page.
 */
document.ontouchmove = function(event) {
    event.preventDefault();
};
