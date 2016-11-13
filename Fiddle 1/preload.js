function imageObject(W,H,raw) {
	this.w = W;
	this.h = H;
	this.data = raw;
}

function loadImages() { // create imageObject for each image in the Letters folder, and store it in images[]
    for (var i = 0; i < 26; i++) {
    	var img = new Image();
    	img.i = i;	
    	img.crossOrigin = "Anonymous";
    	
    	img.addEventListener("load", function() {
		    var tempCanvas = document.createElement('canvas');
			tempCanvas.height = this.height;
			tempCanvas.width = this.width;
			var tempCtx = tempCanvas.getContext('2d');
			tempCtx.drawImage(this, 0, 0); // Draw image on temporary canvas
			var data = tempCtx.getImageData(0, 0, this.width, this.height).data;
			console.log("Loaded image "+this.i);
			images[this.i] = new imageObject(this.width, this.height, data.slice());
			// tempCanvas stuff should garabage-collect?
		});

		img.src = "Letters/"+i+".png";
    }
}

var images = [];
loadImages();