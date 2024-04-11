const MAX_CANVAS_SIZE = 512;
var tileSize, normalize, canvasSize, textures = [];

/** Get and update canvas size on update. */
let updateCanvas = function() {
	// Get size making sure container maintains a box
	var width = $('#bagh-chal').width();
	var height = $('body').height();
	var size = height < width ? height : width;
	canvasSize = size > MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE : size;

	// Normalize canvas size to to number between 0 and 1
	normalize = canvasSize / MAX_CANVAS_SIZE;

	// Tilesize
	tileSize = canvasSize / 5;
}

/** Setup */
function setup() {
	// Setup canvas
	updateCanvas();
	var canvas = createCanvas(canvasSize, canvasSize);
	canvas.parent('#bagh-chal');
	canvas.id('game');

	// Set properties
	imageMode(CENTER, CENTER);

	// Load textures
	textures[0] = loadImage('assets/images/board.png');
	textures[1] = loadImage('assets/images/goat.png');
	textures[2] = loadImage('assets/images/tiger.png');

	// Initialise new game
	initialise();
}

/** On window resize update camvas size. */
function windowResized() {
	updateCanvas();
	resizeCanvas(canvasSize, canvasSize);
}