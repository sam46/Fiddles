var width, height;
function dist2(x1,y1,x2,y2){
	return (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
};

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d");
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;

	var points = [], bpoints = [];
	var active_point = -1;

	function drawPoint(p,r,highlight) {
		r = highlight ? 1.5*r : r;
		var x = p.x, y = p.y;
		context.beginPath();
		context.arc(x,y, r, 0,2*Math.PI);
		context.fillStyle = highlight ? 'red': 'blue';
		context.fill();
		context.closePath();
	}

	function Segment(init,end) {
		this.p1 = new Vector(init.x, init.y);
		this.p2 = new Vector(end.x, end.y);
		this.lerp = function(percent) { // 0 <= percent <=1
			return new Vector(this.p1.x + percent*(this.p2.x-this.p1.x), this.p1.y + percent*(this.p2.y-this.p1.y));
		};
	}

	// returns the final point on the b-curve at t
	function reduce(pts,t) {	// 0 <= t <=1
		// reduce control points until you have just a line
		if(pts.length == 2)
			return (new Segment(pts[0],pts[1])).lerp(t);

		var newPts = [];
		for(var i = 0; i<pts.length-1; i++)
			newPts.push((new Segment(pts[i],pts[i+1])).lerp(t));	
		return reduce(newPts,t);
	}

	function update() {
		bpoints = [];
		var steps = 1000;
		for(var i = 0; i<steps; i++)
			bpoints.push(reduce(points,i/steps));
	}

	var flag = 0;
	canvas.addEventListener("mousedown", function(event) {
	    flag = 1;
	}, false);

	canvas.addEventListener("mousemove", function(event) {
	    if((flag === 1)  && (active_point != -1)) {   
	       points[active_point].x = event.clientX;
	       points[active_point].y = event.clientY;
	       update();
	    }

	    if(points.length > 0) {
		    var min = 10000000, ind = -1;
			for(var i =0; i < points.length; i++) {
				var d2 = dist2(points[i].x, points[i].y, event.clientX, event.clientY);
				points[i].md2 = d2;
				if(d2 <= min) { 
				 	min = d2;
					ind = i;
				}
			}
			active_point = points[ind].md2 < 25 ? ind : -1; // highlight/point-selection radius
		}
	}, false);

	canvas.addEventListener("mouseup", function(event) {
	    flag = 0;
		if(active_point == -1) {
			var pt = {x:event.clientX, y:event.clientY, md2:1000000};
			points.push(pt);
			if(points.length > 1)
				update();
		}
	}, false);

	run();

	function run() {		
		context.clearRect(0,0, width, height);

		for(var i =0; i < points.length; i++)
				drawPoint(points[i],4, i==active_point);
		
		var count = bpoints.length;
		if(count>1) {
			context.beginPath();
			context.moveTo(points[0].x, points[0].y);
			for (var i = 0; i < count-1; i++)
				context.lineTo(bpoints[(i+1)%count].x, bpoints[(i+1)%count].y);				
			context.stroke();
			context.closePath();
		}

		requestAnimationFrame(run);
	}	

};