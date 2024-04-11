/*!
      0   1   2   3   4
    0 T - o - o - o - T
      | \ | / | \ | / |
    1 o - o - o - o - o
      | / | \ | / | \ |
    2 o - o - o - o - o
      | \ | / | \ | / |
    3 o - o - o - o - o
      | / | \ | / | \ |
    4 T - o - o - o - T
*/

/** Object representing a game state. */
var GameState = Object.freeze({
	IN_GAME: -1,
	TIGER_WIN: 0,
	GOAT_WIN: 1,
	DRAW: 2
})

/** Class representing a board. */
class Board {
	/**
     * Board constructor.
     * @param {Board} board - Optional paremeter used to clone and set the properties of this
     * 						   board to that of given board; defaults to null.
     * @param {number} y - Y position value.
     */
	constructor(board=null) {
		// If default constructor, initialize board properties
		if (board == null)
			this.reset();
		else {
			// Copy pieces into new list
			this.pieces = [];
			for (var i = 0; i < board.pieces.length; i++)
				this.pieces.push(board.pieces[i].clone());

			// Copy
			this.goatsMove = board.goatsMove;
			this.goatsInHand = board.goatsInHand;
			this.tigersTrapped = board.tigersTrapped;
			this.goatsCaptured = board.goatsCaptured;
			this.historyMoves = Array.from(board.historyMoves);
		}
	}

	/** Method to reset the board to it's default start state. */
	reset() {
		// Place tigers at default positions
		this.pieces = [];
		this.pieces.push(new Tiger(0, 0));
		this.pieces.push(new Tiger(0, 4));
		this.pieces.push(new Tiger(4, 0));
		this.pieces.push(new Tiger(4, 4));

		// Reset
		this.goatsMove = true;
		this.goatsInHand = PLACEABLE_GOATS;
		this.tigersTrapped = this.goatsCaptured = 0;
		this.historyMoves = [];
	}

	/** Method to switch to the next player. If was goats turn changes to tiger, else goat if tiger. */
	switchToNextPlayer() {
		this.goatsMove = !this.goatsMove;
	}

	/**
	 * Method to check if a given x and y position is within game bounds.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns true if given x and y posiiton is within game bounds, or false otherwise.
	 */
	withinBounds(x, y) {
		// If to x and y are outside bounds, return false
		return !(x < 0 || x > 4 || y < 0 || y > 4);
	}

	/**
	 * Method to a piece at a given x and y position.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns the piece at the given x and y position if it exists, or null otherwise.
	 */
	getPieceAt(x, y) {
		for (var piece of this.pieces)
			if (piece.isPositionAt(x, y))
				return piece;
		return null;
	}

	/**
	 * Method to check if a piece exists at a given x and y position
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns true if a piece exists at given x and y position, or false otherwise.
	 */
	isPieceAt(x, y) {
		return this.getPieceAt(x, y) != null ? true : false;
	}

	/**
	 * Method to check if a goat exists at a given x and y position
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns true if a goat exists at given x and y position, or false otherwise.
	 */
	isGoatAt(x, y) {
		var piece = this.getPieceAt(x, y);
		return (piece != null && piece.isGoat) ? true : false;
	}

	/**
	 * Method to check if a tiger exists at a given x and y position
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns true if a tiger exists at given x and y position, or false otherwise.
	 */
	isTigerAt(x, y) {
		var piece = this.getPieceAt(x, y);
		return (piece != null && piece.isTiger) ? true : false;
	}

	/**
	 * Method to remove piece at gieven x and y position.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns piece removed, or null if piece at given x and y doesnt exist.
	 */
	removePieceAt(x, y) {
		for (var i = 0; i < this.pieces.length; i++)
			if (this.pieces[i].isPositionAt(x, y))
				// Remove and return piece at i from array
				return this.pieces.splice(i, 1)[0];
		return null;
	}

	/**
	 * Method to place goat at given x and y position.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns true if goats to place is greater than 0, position was empty and goat
	 *	was placed, or false otherwise.
	 */
	placeGoatAt(x, y) {
  		// If has goats to place, within bounds and piece doesnt exist at given x and y, place new goat
		if (this.goatsInHand > 0 && this.withinBounds(x, y) && !this.isPieceAt(x, y)) {
	  		this.pieces.push(new Goat(x, y));
	  		this.goatsInHand--;
	  		return true;
	  	}
		return false;
	}

	/**
	 * Method to capture a goat at given x and y positon.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns false if given x and y doesn't have a goat, or true if goat was removed.
	 */
	captureGoatAt(x, y) {
		if (this.isGoatAt(x, y)) {
			this.removePieceAt(x, y);
			this.goatsCaptured++;
			return true;
		}
		return false;
	}

	/**
	 * Method to move a piece to a given x and y position.
     * @param {Vector} from - Vector x and y from position value.
     * @param {number} x - X to position value.
     * @param {number} y - Y to position value.
     * @param {boolean} simulated - Optional parameter simulated can be assigned to state if move
     *	has already been simulated or not; defaults to false.
     * @return {boolean} Returns true if piece was moved, or false otherwise.
	 */
	move(from, x, y, simulated=false) {
		var piece = this.getPieceAt(from.x, from.y);
		// If piece is null, return false
		if (piece == null)
			return false;

		if (piece.move(this, x, y, simulated)) {
			// If all goats have been placed, push move properties to queue (from, to)
			if (this.goatsInHand == 0)
				this.historyMoves.push([from, piece.position]);
			return true;
		}
		return false;

	}

	/**
	 * Method to get and return the number of tigers trapped.
	 * @return {number} Number of tigers trapped on the board.
	 */
	numOfTigersTrapped() {
		var count = 0;
		// Loop all tigers on board and count number of trapped tigers
		for (var piece of this.pieces)
			if (piece.isTiger)
				if (piece.isTrapped(this))
					count++;
		return count;
	}

    /**
     * Method to get the number of possible captures that can be made by all the tigers on the board.
	 * @return {number} Number of possible captures that can be made.
     */
    numOfPossibleCaptures() {
        var count = 0;
		for (var piece of this.pieces)
			if (piece.isTiger)
				count += piece.numOfPossibleCaptures(this);
		return count;
    }

 	/**
     * Method to get the number of tigers occupying a corner on the board.
	 * @return {number} Number of tigers occupying a corner on the board.
     */
    numOfTigersInCorners() {
        var count = 0;
		for (var piece of this.pieces)
			if (piece.isTiger)
				// If in a corner, increase count
				if ((piece.position.x == 0 && piece.position.y == 0) ||
					(piece.position.x == 0 && piece.position.y == 4) ||
					(piece.position.x == 4 && piece.position.y == 4) ||
					(piece.position.x == 4 && piece.position.y == 0))
                    count++;
        return count;
    }

    /**
     * Method to get the number of outside goats on the board. Goat is outside if along outside edge of board.
	 * @return {number} Number of outside goats on the board.
     */
    numOfOutsideGoats() {
    	var count = 0;
		for (var x = 0; x < 5; x++)
			for (var y = 0; y < 5; y++)
				// If on outside of board, and piece doesnt exist, increase count
				if (x < 1 || x > 3 || y < 1 || y > 3)
					if (this.isGoatAt(x, y))
						count++;
		return count;
	}

    /**
     * Method to get and return selected piece.
	 * @return {Piece} Returns selected piece, or null if piece is not currently selected.
     */
    getSelectedPiece() {
    	var piece = this.pieces[this.pieces.length - 1];
    	return piece.isMoving ? piece : null;
    }

    /**
     * Method to return state of if piece is currently selected.
	 * @return {boolean} Returns true if selected, or false otherwise.
     */
    isPieceSelected() {
    	return this.getSelectedPiece() != null;
    }

    /**
     * Method to select a piece at a given x and y to be moved.
     * @param {number} x - X position value.
     * @param {number} y - Y position value.
	 * @return {boolean} Returns true if piece was selected, or false otherwise.
     */
    selectPieceAt(x, y) {
		if (this.withinBounds(x, y))
			// If piece exists at given x and y
			for (var i = 0; i < this.pieces.length; i++)
				if (this.pieces[i].isPositionAt(x, y)) {
		      		// If goat move and player is moving goat, or if tiger move and moving tiger, select piece and return true
		      		if ((this.goatsMove && this.pieces[i].isGoat) ||
		      			(!this.goatsMove && this.pieces[i].isTiger)) {
		      			this.pieces[i].isMoving = true;
		   			    this.pieces.splice(this.pieces.length - 1, 0, this.pieces.splice(i, 1)[0]);
		      			return true;
		      		}
		      	}
      	return false;
    }

    /** Method used to unselect the currently selected piece. */
    unselectPiece() {
		this.pieces[this.pieces.length - 1].isMoving = false;
    }

	/**
	 * Method to simulate and return boards array of all possible goat placements. Each board contains all the
	 *  possible placements a goat can make.
     * @return {Board[]} Boards array of all possible goat placements.
	 */
	simulatePlacements() {
		var boards = [];

		// Push all empty tiles on board to list
		for (var x = 0; x < 5; x++)
			for (var y = 0; y < 5; y++)
				if (!this.isPieceAt(x, y)) {
					var tempBoard = this.clone();
					tempBoard.placeGoatAt(x, y);
					boards.push(tempBoard);
				}
		return boards;
	}

	/**
	 * Method to simulate and return boards array of all possible goat moves. Each board either contains a
	 *  potential placement if goats to place in hand or a potential move a goat can make.
     * @return {Board[]} Boards array of all possible goat placements/moves.
	 */
	simulateGoatBoards() {
		var boards = [];
		// If board has goats to place, simulate goat placements
		if (this.goatsInHand > 0)
			boards = boards.concat(this.simulatePlacements())
		// Else, simulate goat moves
		else
			for (var piece of this.pieces)
				if (piece.isGoat)
					boards = boards.concat(piece.simulateBoards(this));
		return boards;
	}

	/**
	 * Method to simulate and return boards array of all possible tiger moves. Each board contains a
	 *  potential move a tiger can take.
     * @return {Board[]} Boards array of all possible tiger moves.
	 */
	simulateTigerBoards() {
		var boards = [];
		for (var piece of this.pieces)
			if (piece.isTiger)
				boards = boards.concat(piece.simulateBoards(this));
		return boards;
	}

	/**
	 * Method to return game goat win state. Goat wins if all tigers are trapped.
	 * @return {boolean} Returns true if goat win, or false otherwise.
	 */
	isGoatWin() {
		return (this.tigersTrapped = this.numOfTigersTrapped()) >= 4;
	}

	/**
	 * Method to return game tiger win state. Tiger wins if atleast 5 goats have been captured.
	 * @return {boolean} Returns true if tiger win, or false otherwise.
	 */
	isTigerWin() {
		return this.goatsCaptured >= 5;
	}

    /**
     * Method to return position string of a given history move.
     * @param {Vector[,]} move - Vector array of from and to move positions.
     * @param {boolean} invert - Optional parameter invert can be used to return inverted result,
     *  						  eg in previous '1211' (default=false).
     * @return {string} Returns history string of given move. For example, '1112' if piece was
     *  previously at position '11' (xy) and moved to position '12'.
     */
	getHistoryStringOf(move, invert=false) {
		var from = move[0].x.toString() + move[0].y.toString();
		var to = move[1].x.toString() + move[1].y.toString();
		return invert ? to + from : from + to;
	}

	/**
	 * Method to return game draw state.
	 * @return {boolean} Returns true if game is a draw, or false otherwise.
	 */
	isDraw() {
		// Prevent array getting longer than required
		if (this.historyMoves.length > 5)
			this.historyMoves.shift();

		// If all goats have been placed and enough moves have been played, check for draw
		if (this.goatsInHand == 0 && this.historyMoves.length > 4) {
			var length = this.historyMoves.length;

			// If pieces are moving back and forth, return draw (true)
			var move1 = this.getHistoryStringOf(this.historyMoves[length - 1]);
			var move2 = this.getHistoryStringOf(this.historyMoves[length - 2]);
			var move3Invert = this.getHistoryStringOf(this.historyMoves[length - 3], true);
			var move4Invert = this.getHistoryStringOf(this.historyMoves[length - 4], true);
			if ((move1 == move3Invert) && (move2 == move4Invert))
				return true;

			// If pieces are circling, return draw
			var move4 = this.getHistoryStringOf(this.historyMoves[length - 4]);
			var move5 = this.getHistoryStringOf(this.historyMoves[length - 5]);
			if ((move1 == move4) && (move2 == move5))
				return true;
		}
		return false;
	}

	/**
	 * Method to get and return current game state.
	 * @return {GameState} Returns game state, of in-game (-1), tiger win (0), goat win (1) or draw (2).
 	 */
	getGameState() {
		if (this.isTigerWin())
			return GameState.TIGER_WIN;
		else if (this.isGoatWin())
			return GameState.GOAT_WIN;
		else if (this.isDraw())
			return GameState.DRAW;
		else
			return GameState.IN_GAME;
	}

	/** Draw. */
	draw() {
		// Draw board
		image(textures[0], canvasSize / 2, canvasSize / 2, canvasSize, canvasSize);

		// Draw pieces
		for (var piece of this.pieces)
			piece.draw();
	}

	/**
	 * Method to clone this board object.
	 * @return {Goat} Returns new cloned board object.
	 */
	clone() {
		return new Board(this);
	}
}