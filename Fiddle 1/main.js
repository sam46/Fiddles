var width, height;
var Mouse = {
	x: width*2,
	y: 0,
	r: 90.0
};

function distSq(v1,v2){
	return (v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y);
}

function Particle(CX,CY,R) {
//function Particle(CX,CY,R,M,M2){
	this.ctr = new Vector(CX,CY);
	this.pos = new Vector(Math.random()*width, Math.random()* height);
	this.vel = new Vector(0.0,0.0);
	this.r = R;
	this.jiggle = 1.0;
	// this.acc = new Vector(0.0,0.0);
	// this.gforce = new Vector(0.0,0.0);
	// this.m = M;
	// this.m2 = M2; 	
	var gconst = 30.0;

	// this.applyForce = function(Force){
	// 	var fAcc = new Vector(Force.x/this.m, Force.y/this.m);				// a = F/m
	// 	this.acc.add(fAcc);
	// };

	this.update = function() {
		// calculate the G force: newton law of universal gravitation
			// //this.gforce = new Vector(this.ctr.x - this.pos.x, this.ctr.y - this.pos.y);

		var gforce = new Vector(Math.round((this.ctr.x - this.pos.x)*1000.0)/1000.0, Math.round((this.ctr.y - this.pos.y)*1000.0)/1000.0);
		gforce.normalize();
		var dist = Math.sqrt(distSq(this.pos, this.ctr));
		dist = Math.min(dist, 1000.0) / 1000.0;	
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

		// give it some jiggle
		this.pos.add((new Vector.random2D()).mult(this.jiggle));
	};	

	this.draw = function(ctx){		
		// ctx.fillStyle = "rgba(255,0,0,0.1)";
		// ctx.beginPath();
	 //    ctx.arc(this.ctr.x, this.ctr.y, this.r, 0, 2*Math.PI);
	 //    ctx.fill();
	 //    ctx.closePath();

		ctx.fillStyle = "#6D6A60";
		ctx.beginPath();
	    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
	    ctx.fill();
	    ctx.closePath();			

	};

}

// push particles away from an intersecting circle
Particle.prototype.constrain = function(m,rad) { // assumes rad is way bigger than this.r
	var dist = distSq(m,this.pos);
	if(dist < Math.pow(rad+this.r,2)){
		dist = Math.sqrt(dist);
		var interleave = 1 - (rad - dist)/rad;
		var push = new Vector(this.pos.x - m.x, this.pos.y - m.y);
		push.normalize();
		push.mult(interleave * 20);
		this.vel.add(push);
	}
};

// function PSys(){
// 	var parts = [];

// 	for (var i = 1; i <= 10; i++) {
// 		addRing(i*60, i*25, 1);
// 	}
// 	this.count = parts.length;

// 	function addRing(count,radius,pRad) {
// 		var ang = Math.random()*Math.PI*2, incr = Math.PI*2.0/count;
// 		for(var i=0; i < count; i++) {
// 			parts.push(
// 				new Particle(width/2.0+Math.cos(ang)*radius, height/2.0+Math.sin(ang)*radius, pRad, 0,0)
// 			);
// 			ang += incr;
// 		}
// 	}

// 	this.draw = function(context){
// 		for(var i =0; i <parts.length; i++)
// 			parts[i].draw(context);
// 	};
// 	this.update = function(){
// 		for(var i =0; i <parts.length; i++)
// 			parts[i].update();
// 	};
// };


// creates a particle array from an image with particles positioned at non-white pixels
function imageToParticles(imgObj, scaleX, scaleY, offX, offY,rad) { 
	var parts = [];

	for(var i = 0; i < imgObj.data.length; i += 4) {
		var px = i/4;
		var x = px % imgObj.w,
			y = px / imgObj.w;
		// we'll accept a pixel if it's non-white (its R, G and B values are less than a whitness bar)  (ignoreing alpha)
		var score = colorCriteria(imgObj.data[i], imgObj.data[i + 1], imgObj.data[i + 2]);
		// limit the number of particles as it can get very large:
		if(score < 0.1) continue; // if the pixel is very white
		if(Math.random() < 0.5) continue;	

		parts.push(new Particle(x*scaleX + offX, y*scaleY + offY, rad*score));
	}


	function colorCriteria(r,g,b){
		// could be improved further
		var avg = ((r + g + b)/3.0)/ 255.0;	// normalized
		return 1 - avg;
	}

	 return parts;
}

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d");
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;
	//var psystem = new PSys();
	var showMouse = false;
	var btn = document.getElementById('btn');
	var txt = document.getElementById('txt');
	var letters = [];
	var randomParticles = [];
	for (var i = 0; i < 300; i++) {
		var temp = new Particle(Math.random()*width, Math.random()*height,1);
		temp.jiggle = 1 + Math.random()*5;
		randomParticles.push(temp);	
	}

	addEventListeners();
	setupNewWord("test");
	run();

	function setupNewWord(word) {	
		word = word.toLowerCase();
		var perLine = 5, 	// letters per line
			spacing = 0, // spacing between letters
			scl = 2;	// scale the letter 
		letters = [];

		var lastEnd = 0;	// the last particle's x position of the previous letter
		for(var i = 0; i < word.length; i++) {
			var ascii = word.charCodeAt(i);

			if(ascii < 97 || ascii > 122) continue;
			if(i == 0){
				letters.push(imageToParticles(images[ascii - 97],scl,scl, 50,  height/2 - 100, 2));
				lastEnd += 50 + images[ascii - 97].w*scl + spacing;
				continue;
			}

			letters.push(imageToParticles(images[ascii - 97],scl,scl, lastEnd + spacing,  height/2 - 100, 2));
			lastEnd += images[ascii - 97].w*scl + spacing;
		}
	}

	function addEventListeners(){
		window.onresize = function(event) {

		};

		document.body.addEventListener("mousemove", function(event) {
			Mouse.x = event.clientX;
			Mouse.y = event.clientY;
		});

		document.body.addEventListener("mousedown", function(event) {
			showMouse = !showMouse;
		});

		document.body.addEventListener("wheel", function(WheelEvent) {
			 Mouse.r += WheelEvent.deltaY < 0 ? 5.0 : -5.0;
		});

		window.onkeydown = function(e) {
		
		};

		btn.onclick = function(){
			setupNewWord(txt.value)
		};
	}

	function run() {		
		context.clearRect(0, 0, width, height);
		// psystem.update();
		// psystem.draw(context);

		var partsCount = 20;

		partsCount += randomParticles.length;
		for (var i = 0; i < randomParticles.length; i++) {
			randomParticles[i].update();
			randomParticles[i].draw(context);
		}

		for(var j =0; j <letters.length; j++){
		 	var parts = letters[j];
		 	partsCount += parts.length;
			for (var i = 0; i < parts.length; i++) {
				parts[i].update();
				parts[i].draw(context);
		 	}
		 }




		// draw mouse's circle
		if(showMouse){
			context.fillStyle = "rgba(255,0,25,0.2)";
			context.beginPath();
			context.arc(Mouse.x, Mouse.y, Mouse.r, 0, 2*Math.PI);
			context.fill();
			context.closePath();
		}

		context.textAlign = 'left';
	    context.font = '14px sans-serif';
	    context.fillStyle = 'gray';
		context.fillText("particles: "+partsCount, 15, 25);
		//context.fillText("particles: "+psystem.count, 25, 30);
		context.fillText("mouse click: show brush", 15, 50);
		context.fillText("mouse wheel: change brush radius", 15, 75);

		requestAnimationFrame(run);
	}	

};
