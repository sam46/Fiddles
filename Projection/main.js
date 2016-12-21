function Vec3D(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Vec3D.prototype.rotateX = function(th){
	var y = this.y, z = this.z;
	this.y = Math.cos(th)*y - Math.sin(th)*z;
	this.z = Math.sin(th)*y + Math.cos(th)*z;  
	return this; 
},
Vec3D.prototype.rotateY = function(th){
	var x = this.x, z = this.z;
	this.x = Math.cos(th)*x - Math.sin(th)*z;
	this.z = Math.sin(th)*x + Math.cos(th)*z;  
	return this; 
}
Vec3D.prototype.rotateZ = function(th){
	var y = this.y, x = this.x;
	this.y = Math.cos(th)*y - Math.sin(th)*x;
	this.x = Math.sin(th)*y + Math.cos(th)*x;
	return this; 
}

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d");
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;

	var t, accumulator, absoluteTime, timestep = 17;

	var num = 5, points = [];
	var scl = 30, granular = 10.0;
	for(var i = 0; i < num*granular; i++){
		for(var j= 0; j < num*granular; j++){
			for(var k=0; k <num*granular; k++){
				if(i==num*granular-1 || j==num*granular-1 || k == num*granular-1 || i==0 || j==0 || k == 0)
					points.push(new Vec3D(scl*i/granular,scl*j/granular,scl*k/granular));
			}
		}
	}
	
	console.log(points.length);
	
	for(var i = 0; i < points.length; i++)
		points[i].rotateY(Math.PI/3.0);

	t = 0;
	accumulator = 0.0;
	absoluteTime = performance.now();
	run();

	function run() {		
		var newTime = performance.now()*1.0;
		var deltaTime = newTime - absoluteTime;
		if(deltaTime > 0.0)	{
			absoluteTime = newTime;
			accumulator += deltaTime;
			while(accumulator >= timestep) {	
				
				for(var i = 0; i < points.length; i++)
					points[i].rotateX(0.01).rotateY(0.006).rotateZ(-0.006);
				
				accumulator -= timestep;
				t++;					
			}
		}

		context.clearRect(0,0, width, height);
		context.save();
		var shiftY = (num*granular-1)*scl/granular; 
		context.translate(width/2, height/2 - shiftY);
		for(var i = 0; i < points.length; i++){
			context.beginPath();
			context.arc(points[i].x, points[i].z, 1, 0,2*Math.PI);
			context.fillStyle = 'rgb(0,255,'+ Math.floor(255*(points[i].y+shiftY)/(2*num*(scl-1)))+')';
			context.fill();
			context.closePath();
		}
		context.restore();
		requestAnimationFrame(run);
	}	

};