var width, height;

function dist2(x1,y1,x2,y2){
	return (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
};

function toPolar(x,y){
	return {
		ang: Math.atan2(y,x),
		r: Math.sqrt(dist2(0,0,x,y))
	};
};

function rotate(v, angle){	// rotate vector v by angle. The assumed coor-sys has origin at inital point of v. 
	return {  // multiply point by roatition matrix:
		x: v.x*(Math.cos(angle) - Math.sin(angle)),
		y: v.y*(Math.cos(angle) + Math.sin(angle))
	} 
};

function dot(arg1,arg2,arg3,arg4){
	if(arg3)
		return arg1*arg3 + arg2*arg4;
	return arg1.x*arg2.x + arg1.y*arg2.y;
};

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d");
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;


	var points = [ 

	];
	var cpoints = [

	];
	var curves = [];
	var active_point = -1;



	function drawPoint(p,r,highlight){
		r = highlight ? 1.5*r : r;
		var x = p.x, y = p.y;
		context.beginPath();
		context.arc(x,y, r, 0,2*Math.PI);
		context.fillStyle = highlight ? 'red': 'blue';
		context.fill();
		context.closePath();
	}


	function bezier(pt1,pt2,pre){
		this.p1 = {x:pt1.x, y:pt1.y};
		this.p2 = {x:pt2.x, y:pt2.y};
		tilt = Math.atan2(this.p2.y-this.p1.y,this.p2.x-this.p1.x);
		d = Math.sqrt(dist2(this.p1.x, this.p1.y, this.p2.x,this.p2.y));
		theta = 2*Math.PI - Math.PI/3 + tilt, r = 0.25*d/Math.cos(Math.PI/3);	// in case there's no pre
		this.cp1 = {
			x: this.p1.x + r*Math.cos(theta),
			y: this.p1.y + r*Math.sin(theta)
		};
		
		var temp;
		this.computeCp1 = function() {
			theta = Math.PI + Math.atan2(pre.cp2.y-this.p1.y, pre.cp2.x-this.p1.x);	// the angle of the vector cp-p1. remember that pre's cp2, p1 and cp1 should all lie on a line
			temp = Math.PI-(tilt - Math.atan2(pre.cp2.y-this.p1.y, pre.cp2.x-this.p1.x));
			// want the projection of (cp1-p1) along (p2-p1) to be 1/4 the length of (p2-p1)
			r = 0.25*d/Math.cos(temp);	// temp is the angle between the two said vectors
			this.cp1 = {	
				x: this.p1.x + r*Math.cos(theta),
				y: this.p1.y + r*Math.sin(theta)
			};
		}

		if(pre != null)
			this.computeCp1();	// recompute Cp1



		this.cp2 = { // cp2 is cp1 but shifted by d/2 along the direction of (p2-p1)
			x: this.cp1.x + (this.p2.x-this.p1.x)/2,
			y: this.cp1.y + (this.p2.y-this.p1.y)/2
		};
		

		// when cp1 and pre.cp1 are on the same side of p1, we'll have to flip cp2 of the previous bezier to make the transition smooth.
		if((pre != null) && dot(this.cp1.x-this.p1.x, this.cp1.y-this.p1.y, pre.cp2.x-this.p1.x, pre.cp2.y-this.p1.y) > 0) {
			var pt = new Vector(pre.cp2.x - pre.p2.x, pre.cp2.y - pre.p2.y),
				ax = new Vector(pre.p1.x - pre.p2.x, pre.p1.y - pre.p2.y);
			var th = 2*dot(pt,ax)/Math.sqrt(dist2(pt.x,pt.y,0,0)*dist2(ax.x,ax.y,0,0));
			// flip cp2 of the previous bezier.
			this.pre_cp2_opposite = rotate(pt,Math.PI+th);
			this.pre_cp2_opposite.x += pre.p2.x;
			this.pre_cp2_opposite.y += pre.p2.y;
			pre.cp2.x = this.pre_cp2_opposite.x;
			pre.cp2.y = this.pre_cp2_opposite.y;

			// pre.cp2 has changed so recompute this.cp1
			this.computeCp1();
		}

		var v = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
		var u = new Vector(this.cp1.x - this.p1.x, this.cp1.y - this.p1.y);
		var proj_u = new Vector(v.x,v.y);
		proj_u.mult(dot(u,v)/dot(v,v));
		this.height = (new Vector(u.x-proj_u.x, u.y-proj_u.y)).mag();




		this.draw = function(){
			context.strokeStyle = 'black';
			context.beginPath();
			context.moveTo(this.p1.x,this.p1.y);
			context.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.p2.x, this.p2.y);
			context.stroke();
			context.closePath();

			if(true){

				drawPoint(this.cp1,2,false);
				drawPoint(this.cp2,2,false);
				context.strokeStyle = 'gray';
				context.beginPath();
				context.moveTo(this.p1.x,this.p1.y);
				context.lineTo(this.cp1.x,this.cp1.y);
				context.stroke();
				context.closePath();			
				context.beginPath();
				context.moveTo(this.p2.x,this.p2.y);
				context.lineTo(this.cp2.x,this.cp2.y);
				context.stroke();
				context.closePath();
			}

		};
	};

	var flag = 0;
	canvas.addEventListener("mousedown", function(event){
	    flag = 1;



	}, false);

	canvas.addEventListener("mousemove", function(event){


	    if(flag === 1){
	        if(active_point != -1){
	        	console.log(active_point);
	        	points[active_point].x = event.clientX;
	        	points[active_point].y = event.clientY;
	   		}
	    }

	    if(points.length > 0){
		    var min = 10000000, ind = -1;
			for(var i =0; i < points.length; i++){
				var d2 = dist2(points[i].x, points[i].y, event.clientX, event.clientY);
				points[i].md2 = d2;
				if(d2 <= min){
				 	min = d2;
					ind = i;
				}
			}
			active_point = points[ind].md2 < 100 ? ind : -1;
		}


	}, false);

	canvas.addEventListener("mouseup", function(event){
	    // if(flag === 0){
	    //     console.log("click");
	    // }
	    // else if(flag === 1){
	    //     console.log("drag");
	    //     if(active_point != -1){
	    //     	console.log(active_point);
	    //     	points[active_point].x = event.clientX;
	    //     	points[active_point].y = event.clientY;
	   	// 	}
	    // }
	    flag = 0;

	if(active_point == -1) {
		var pt = {x:event.clientX, y:event.clientY, md2:1000000};
		points.push(pt);
		if(points.length > 1){
			var pre = (curves.length > 0) ? curves[curves.length-1] : null;
			console.log(pre);
			curves.push(new bezier(points[points.length-2],points[points.length-1], pre));
		}
	}

	}, false);



	run();





	function run() {		
		context.clearRect(0,0, width, height);

		//context.save();
		//context.translate(width/2, height/2);
		/*context.beginPath();
		context.moveTo(20,20);
		context.bezierCurveTo(20,100,200,100,200,20);
		context.stroke();*/

		// for (var i = 0; i < count; i++) {
		// 	context.beginPath();
		// 	context.arc(points[i].x, points[i].y, 3, 0,2*Math.PI);
		// 	context.fillStyle = 'red';
		// 	context.fill();
		// 	context.closePath();
		// }


		var r = 4;
		for(var i =0; i < points.length; i++)
				drawPoint(points[i],r, i==active_point);
		

		// context.strokeStyle = 'gray';
		// context.beginPath();
		// context.moveTo(points[4].x,points[4].y);
		// context.lineTo(points[1].x,points[1].y);
		// context.stroke();
		// context.closePath();
		// context.beginPath();
		// context.moveTo(points[5].x,points[5].y);
		// context.lineTo(points[1].x,points[1].y);
		// context.stroke();
		// context.closePath();

		for(var i = 0 ; i < curves.length; i++)
			curves[i].draw();









		//context.restore();

		requestAnimationFrame(run);
	}	

};