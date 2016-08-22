var width, height;
var Mouse = {
	x: 0.0,
	y: 0.0,
	r: 200.0
};

function distSq(v1,v2){
	return (v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y);
}

function Particle(CX,CY,R) {
//function Particle(CX,CY,R,M,M2){
	this.ctr = new Vector(CX,CY);
	this.pos = new Vector(CX,CY);
	this.vel = new Vector(0.0,0.0);
	this.r = R;
	// this.acc = new Vector(0.0,0.0);
	// this.gforce = new Vector(0.0,0.0);
	// this.m = M;
	// this.m2 = M2; 	
	var gconst = 10.0;

	this.applyForce = function(Force){
		var fAcc = new Vector(Force.x/this.m, Force.y/this.m);				// a = F/m
		this.acc.add(fAcc);
	};

	this.update = function() {
		// calculate the G force: newton law of universal gravitation
			// //this.gforce = new Vector(this.ctr.x - this.pos.x, this.ctr.y - this.pos.y);

		var gforce = new Vector(Math.round((this.ctr.x - this.pos.x)*1000.0)/1000.0, Math.round((this.ctr.y - this.pos.y)*1000.0)/1000.0);
		gforce.normalize();
		var dist = Math.sqrt(distSq(this.pos, this.ctr));
		dist = Math.min(dist, 500.0) / 500.0;	
		gforce.mult(dist * gconst);	

		// if(Math.abs(distSquare) > 1){
		// 	var mag = gconst * this.m * this.m2 / distSquare;
		// 	this.gforce.mult(mag);
		// 	// Change acceleration
		// 	var gAcc = new Vector(this.gforce.x/this.m, this.gforce.y/this.m);				// a = F/m
		// 	this.acc.add(gAcc);
		// 	console.log(this.gforce.mag());
		// }

		this.vel = new Vector(gforce.x, gforce.y);
		this.constrain(Mouse, Mouse.r);
		this.move();
	};

	this.move = function(){
		//this.vel.add(this.acc);
		// this.gforce = new Vector(Math.round((this.ctr.x - this.pos.x)*1000.0)/1000.0, Math.round((this.ctr.y - this.pos.y)*1000.0)/1000.0);
		// this.gforce.normalize();
		// this.gforce.mult(gconst);
		// this.vel.add(this.gforce);

		this.vel.mult(0.92);
		this.pos.add(this.vel);

		var wiggle = new Vector.random2D();
		wiggle.normalize();
		wiggle.mult(1);
		this.pos.add(wiggle);
	};	

	this.draw = function(ctx){		
		ctx.fillStyle = "rgba(255,0,0,0.1)";
		ctx.beginPath();
	    ctx.arc(this.ctr.x, this.ctr.y, this.r, 0, 2*Math.PI);
	    ctx.fill();
	    ctx.closePath();

		ctx.fillStyle = "rgb(25,25,25)";
		ctx.beginPath();
	    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
	    ctx.fill();
	    ctx.closePath();
	};

}

Particle.prototype.constrain = function(m,rad) { // assumes rad is way bigger than this.r
	var dist = distSq(m,this.pos);
	if(dist < Math.pow(rad+this.r,2)){
		dist = Math.sqrt(dist);
		var interleave = 1 - (rad - dist)/rad;
		var push = new Vector(this.pos.x - m.x, this.pos.y - m.y);
		push.normalize();
		push.mult(interleave * 10);
		this.vel.add(push);
	}
};

function PSys(){
	var parts = [];
	addRing(30,250);
	addRing(10,100);
	addRing(20,175);
	addRing(5,45);

	function addRing(count,radius) {
		var ang = Math.random()*Math.PI*2, incr = Math.PI*2.0/count;
		for(var i=0; i < count; i++) {
			parts.push(
				new Particle(width/2.0+Math.cos(ang)*radius, height/2.0+Math.sin(ang)*radius, 10.0, 0,0)
			);
			ang += incr;
		}
	}

	this.draw = function(context){
		for(var i =0; i <parts.length; i++)
			parts[i].draw(context);
	};
	this.update = function(){
		for(var i =0; i <parts.length; i++)
			parts[i].update();
	};
};

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d");
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;
	var psystem = new PSys();
	addEventListeners();
	run();

	function addEventListeners(){
		window.onresize = function(event) {

		};
		document.body.addEventListener("mousemove", function(event) {
			Mouse.x = event.clientX;
			Mouse.y = event.clientY;
		});

		document.body.addEventListener("mousedown", function(event) {

		});

		document.body.addEventListener("wheel", function(WheelEvent) {
			 Mouse.r += WheelEvent.deltaY < 0 ? 5.0 : -5.0;
		});
		window.onkeydown = function(e) {
		
		};
	}

	function run() {		
		context.clearRect(0, 0, width, height);
		psystem.update();
		psystem.draw(context);

		// draw mouse's circle
		context.fillStyle = "rgba(255,25,25,0.4)";
		context.beginPath();
		context.arc(Mouse.x, Mouse.y, Mouse.r, 0, 2*Math.PI);
		context.fill();
		context.closePath();

		requestAnimationFrame(run);
	}	


};
