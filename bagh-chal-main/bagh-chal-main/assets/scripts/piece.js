/** Class representing a generic piece. */
class Piece {
    /**
     * Piece constructor.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @param texture - Piece texture.
     */
	constructor(x, y, texture) {
		// Set position
		this.position = createVector(x, y);
		this.prevPosition = null;

		// Set object texture
		this.texture = texture;

		// If piece is currently being moved
		this.isMoving = false;

		// Type
		this.isGoat = this.isTiger = false;
	}

	/**
	 * Method to return boolean result of given position values.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @return {boolean} Returns true if this piece's position is at the given x and y,
	 * 	or false otherwise.
	 */
	isPositionAt(x, y) {
		return this.position.x == x && this.position.y == y;
	}

	/**
	 * Method to return boolean result of if this piece can move to a given position or not.
     * @param {Board} board - Board object of current game.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @param {number} distance - Optional paraemter distance can be assigned to change the squares distance away
	 *                             from this piece's x and y; defaults to 1.
     * @return {boolean} Returns true if this piece can be moved to an empty position at the given x and y, or false otherwise.
	 */
	canMove(board, x, y, distance=1) {
		// If to x and y are outside bounds, or...
		if (!board.withinBounds(x, y) ||

			// If to x and y are greater than distance square away, or...
			x < this.position.x - distance || x > this.position.x + distance ||
			y < this.position.y - distance || y > this.position.y + distance ||

			// If any piece exists at move position, return false
			board.isPieceAt(x, y))
			return false;

		// If current position x and y are at diagonal position, and...
		return (((this.position.x % 2 == 1 && this.position.y % 2 == 1) ||
			(this.position.x % 2 == 0 && this.position.y % 2 == 0)) &&

			// If to x and y are both even or both odd (diagonal), or...
			((x % 2 == 0 && y % 2 == 0) || (x % 2 == 1 && y % 2 == 1))) ||

			// If only moving horizontally or vertically, return true, otherwise false
			(x < this.position.x && y == this.position.y) || (x > this.position.x && y == this.position.y) ||
			(y < this.position.y && x == this.position.x) || (y > this.position.y && x == this.position.x)
	}

	/**
	 * Method to simulate and return all the possible moves this piece can make.
     * @param {Board} board - Board object of current game.
     * @return {Vector[]} Vector array of all the possible moves this piece can make.
	 */
	simulateMoves(board) {
		var moves = [];
		// Loop neighbouring tiles
        for (var x = this.position.x - 1; x < this.position.x + 2; x++)
            for (var y = this.position.y - 1; y < this.position.y + 2; y++)
                // If tile is not at this goats position and within bounds
                if (!(this.position.x == x && this.position.y == y) && board.withinBounds(x, y))
                	// If can move, push to new vector position list
                	if (this.canMove(board, x, y))
                		moves.push(createVector(x, y));
        return moves;
	}

	/**
	 * Method to simulate and return boards array of all possible piece moves.
     * @param {Board} board - Board object of current game.
     * @return {Board[]} Boards array of all possible moves this piece can make.
	 */
	simulateBoards(board) {
		var boards = [];
		var moves = this.simulateMoves(board);
		// For each move, clone board object and move piece
		for (var move of moves) {
			var tempBoard = board.clone();
			tempBoard.move(this.position, move.x, move.y, true);
			boards.push(tempBoard);
		}
		return boards;
	}

	/**
	 * Method to draw a ghost piece at a given x and y position, if the position is empty.
	 * @param {Board} board - Board object of current game.
	 * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @param {boolean} simulated - Optional parameter simulated can be assigned to state if draw
     *								 has already been simulated or not. If not simulated, checks if
     * 								 given x and y position is empty; defaults to false.
     */
	drawAsGhost(board, x, y, simulated=false) {
		// If position is empty, draw ghost piece
		if (simulated || !board.isPieceAt(x, y)) {
	        tint(255, 128);
			image(this.texture, x * tileSize + tileSize / 2,
								y * tileSize + tileSize / 2,
								this.texture.width * normalize * .8,
								this.texture.height * normalize * .8);
			tint(255, 255);
		}
	}

	/** Draw. */
	draw() {
		// if piece is currently being dragged, draw at mouse position
		if (this.isMoving) {
			image(this.texture, mouseX, mouseY,
								this.texture.width * normalize,
								this.texture.height * normalize);
		}
		// Else, draw piece on it's board position
		else
			image(this.texture, (this.position.x * tileSize + tileSize / 2),
				                (this.position.y * tileSize + tileSize / 2),
				                this.texture.width * normalize * .8,
				                this.texture.height * normalize * .8);
	}
}

/** Class representing a goat piece. */
class Goat extends Piece {
	/**
     * Goat constructor.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     */
	constructor(x, y) {
		super(x, y, textures[1]);
		this.isGoat = true;
	}

	/**
	 * Method to move this goat piece to a given x and y position.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @param {boolean} simulated - Optional parameter simulated can be assigned to state if move
     *	                             has already been simulated or not; defaults to false.
     * @return {boolean} Returns true if position was empty and goat was moved, false otherwise.
	 */
	move(board, x, y, simulated=false) {
		// If simulated or can move, move piece
		if (simulated || this.canMove(board, x, y)) {
       		this.position = createVector(x, y);
        	return true;
      	}
      	return false;
	}

	/**
	 * Method to draw a ghost goat at a given x and y position.
	 * @param {Board} board - Board object of current game.
	 * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @param {boolean} simulated - Optional parameter simulated can be assigned to state if draw
     *								 has already been simulated or not. If not simulated, checks if
     * 								 given x and y position is empty; defaults to false.
     */
	static drawAsGhost(board, x, y, simulated=false) {
		// If position is empty, draw ghost piece
		if (simulated || !board.isPieceAt(x, y)) {
			var texture = textures[1];
	        tint(255, 128);
			image(texture, x * tileSize + tileSize / 2,
								y * tileSize + tileSize / 2,
								texture.width * normalize * .8,
								texture.height * normalize * .8);
			tint(255, 255);
		}
	}

	/**
	 * Method to clone this goat object.
	 * @return {Goat} Returns new cloned goat object.
	 */
	clone() {
		return new Goat(this.position.x, this.position.y);
	}
}

/** Class representing a tiger piece. */
class Tiger extends Piece {
	/**
     * Tiger constructor.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     */
	constructor(x, y) {
		super(x, y, textures[2]);
		this.isTiger = true;
	}

	/**
	 * Method to return boolean true if this piece can be captured, or false otherwise. Can capture is true
	 *  when given x and y position is empty and a goat exists between from and to position.
	 */
	canCapture(board, x, y) {
		if (this.canMove(board, x, y, 2))
      		// If can move, find if goat exists at midpoint between from and to positions
			return board.isGoatAt((this.position.x + x) / 2, (this.position.y + y) / 2);
		return false;
	}

	/**
	 * Method to move this tiger piece to a given x and y position. If given x and y distance is 2,
	 * 	tiger captures goat.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
     * @param {boolean} simulated - Optional parameter simulated can be assigned to state if move
     *	                             has already been simulated or not; defaults to false.
     * @return {boolean} Returns true if position was empty and tiger was moved, false otherwise.
	 */
	move(board, x, y, simulated=false) {
		var canCapture = false;
		// If simulated, can move or capture, move piece
		if (simulated || this.canMove(board, x, y) || (canCapture = (this.canCapture(board, x, y)))) {
			// If can capture goat, capture
			if (canCapture)
				board.captureGoatAt((this.position.x + x) / 2, (this.position.y + y) / 2);
       		this.position = createVector(x, y);
			return true;
      	}
      	return false;
	}

	/**
     * Method to return the number of possible captures that this tiger can make.
     * @param {Board} board - Board object of current game.
     * @return {number} Number of possible captures this tiger can make; defaults to 0 if none.
	 */
    numOfPossibleCaptures(board) {
        var count = 0;
 		// Loop neighbouring tiles
        for (var x = this.position.x - 2; x < this.position.x + 3; x++)
            for (var y = this.position.y - 2; y < this.position.y + 3; y++)
                // If tile is not at this tigers position and within bounds
                if (!(this.position.x == x && this.position.y == y) && board.withinBounds(x, y))
                	if (this.canCapture(board, x, y))
                		count++;
		return count;
    }

	/**
	 * Method to simulate and return all the possible captures this tiger can make.
     * @param {Board} board - Board object of current game.
     * @return {Vector[]} Vector array of all the possible captures this tiger can make.
	 */
	simulateCaptures(board) {
		var captures = [];
 		// Loop neighbouring tiles
        for (var x = this.position.x - 2; x < this.position.x + 3; x++)
            for (var y = this.position.y - 2; y < this.position.y + 3; y++)
                // If tile is not at this tigers position and within bounds
                if (!(this.position.x == x && this.position.y == y) && board.withinBounds(x, y))
                	// If can capture, push new vector position to list and goat vector position
                	if (this.canCapture(board, x, y))
	     				captures.push(createVector(x, y));
        return captures;
	}

	/**
	 * Method to simulate and return boards array of all possible tiger moves.
     * @param {Board} board - Board object of current game.
     * @return {Board[]} Boards array of all possible moves this tiger can make.
     *	If capture move exists, ignores distance 1 moves.
	 */
	simulateBoards(board) {
		// If tiger has capture moves
		var captures = this.simulateCaptures(board);
		if (captures.length > 0) {
			var boards = [];
			// For each capture move, clone board object, move piece and capture goat
			for (var capture of captures) {
				var tempBoard = board.clone();
				tempBoard.captureGoatAt((this.position.x + capture.x) / 2, (this.position.y + capture.y) / 2);
				tempBoard.move(this.position, capture.x, capture.y, true);
				boards.push(tempBoard);
			}
			return boards;
		}
		// Else, return distance 1 moves
		else
			return super.simulateBoards(board);
	}

	/**
	 * Method to return trapped state. Trapped is true when tiger cannot capture, or more.
     * @param {Board} board - Board object of current game.
     * @return {boolean} Returns true if tiger is trapped, or false otherwise.
	 */
	isTrapped(board) {
		// Loop neighbouring tiles
        for (var x = this.position.x - 2; x < this.position.x + 3; x++)
            for (var y = this.position.y - 2; y < this.position.y + 3; y++)
                // If tile is not at this tigers position and within bounds
                if (!(this.position.x == x && this.position.y == y) && board.withinBounds(x, y))
                	// If neighbouring tiles are in capture tile range, check if can capture
                	if (x < this.position.x - 1 || x > this.position.x + 2 ||
                		y < this.position.y - 1 || y > this.position.y + 2) {
	                	if (this.canCapture(board, x, y))
    	            		return false;
    	            // Else check if can move
    	            } else if (this.canMove(board, x, y))
	    	            return false;
        return true;
	}S

	/**
	 * Method to clone this tiger object.
	 * @return {Goat} Returns new cloned tiger object.
	 */
	clone() {
		return new Tiger(this.position.x, this.position.y);
	}
}