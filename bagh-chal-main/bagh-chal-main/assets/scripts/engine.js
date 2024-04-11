/**
 * Function to return simulated boards.
 * @param {Board} board - Board object of current game.
 * @return {Board[]} Array of simulated board objects.
 */
let simulateBoards = function(board) {
	return board.goatsMove ? board.simulateGoatBoards() : board.simulateTigerBoards();
}

/**
 * Function used to shuffle a array randomly using the Fisher-Yates shuffle algorithm.
 * @param {Object} array - Array to shuffle.
 * @return {Object[]} Shuffled array.
 */
let shuffle = function(array) {
    var length = array.length;

	// While elements exist
	while (length != 0) {
		// Select random element
		var i = Math.floor(Math.random() * length);
		length--;

		// Get and swap random element within array
		var tempValue = array[length];
		array[length] = array[i];
		array[i] = tempValue;
  	}

  	return array;
}

/**
 * Function used to evaluate and return a given board. Written from the perspective
 *  of the tiger.
 * @param {GameState} state - Game state of current game.
 * @param {Board} board - Board object of current game.
 * @param {number} depth - Current algorithm depth; defaults to 0.
 * @return {number} If tiger win returns 100000,
 *					if goat win returns  -100000,
 *					if draw returns      -50000,
 *					else returns board evaluation;
 *					 +1000 score for every goat captured,
 *					 +200  score for every possible capture,
 *					 +50   score for every tiger in a corner,
 *					 -500  score for every trapped tiger,
 *					 -10   score for every outside goats.
 */
let evaluate = function(state, board, depth=0) {
	// Calculate score
	if (state == GameState.TIGER_WIN)
		return 100000;
	else if (state == GameState.GOAT_WIN)
		return -100000;
	else if (state == GameState.DRAW)
		return -50000;
	else
		return 1000 * board.goatsCaptured
				+ 200 * board.numOfPossibleCaptures()
				+ 50 * board.numOfTigersInCorners()
				- 500 * board.tigersTrapped
				- 10 * board.numOfOutsideGoats()
				+ depth;
}

/**
 * Function to simulate a minimax with alpha-beta pruning board of the best move.
 * @param {Board} board - Board object of current game.
 * @param {boolean} ab - Optional paremeter can be toggeled to use alpha-beta pruning or not;
 *                        defaults to true.
 * @param {number} alpha - Optional paremter used in alpha-beta pruning; defaults to negative infinity.
 * @param {number} beta - Optional paremter used in alpha-beta pruning; defaults to infinity.
 * @return {Board} Returns board object of best move.
 */
let alphaBeta = function(board, aB=true, depth=4, alpha=-Infinity, beta=Infinity) {
	// Increase iterations taken count
	iterationsCount++;

	// Get board game state
	var state = board.getGameState();

	// Simulate and shuffle boards
	var boards = shuffle(simulateBoards(board));

	// If at max depth, board has no moves or is game over, return evaluated score
	if (depth < 1 || boards.length == 0 || state != GameState.IN_GAME)
		return [evaluate(state, board, depth), board];

	var bestBoard = null;
	var score = !board.goatsMove ? -Infinity : Infinity;
	if (!board.goatsMove)
		for (var board of boards) {
			board.switchToNextPlayer();
			var result = alphaBeta(board, aB, depth-1, alpha, beta)[0];

			// If result is higher than current highest score
			if (result > score) {
				score = result;
				bestBoard = board;
			}

			// Alpha-beta pruning
			if (aB) {
                if (score >= beta)
                    break;
                if (score > alpha)
                    alpha = score;
			}
		}
	else
		for (var board of boards) {
			board.switchToNextPlayer();
			var result = alphaBeta(board, aB, depth-1, alpha, beta)[0];

			// If result is lower than current lowest score
			if (result < score) {
				score = result;
				bestBoard = board;
			}

			// Alpha-beta pruning
			if (aB) {
                if (score <= alpha)
                    break;
                if (beta > score)
                    beta = score;
			}
		}
	return [score, bestBoard];
}

/** Class representing a node. */
class Node {
	/**
	 * Node constructor method.
     * @param {Board} board - Board object of current game.
     * @param {Node} parent - Optional paremeter parent node object; defaults to null. If not
     *  					   assigned current move becomes opposite of parent node.
	 */
	constructor(board, parent=null) {
		this.board = board;
		this.parent = parent;
		this.boards = simulateBoards(board);
		this.children = [];
		this.visits = 0;
		this.wins = 0;
	}

	/**
	 * Method to check and return if this node has unexamined boards.
	 * @return {boolean} Returns true if this node has unexamined boards, or false otherwise.
	 */
	hasUnexaminedBoards() {
		return this.boards.length > 0;
	}

	/**
	 * Method to find and return a random unexamined board.
	 * @return {Board} Returns unexamined board.
	 */
	getRandomUnexaminedBoard() {
		return this.boards.splice(Math.floor(Math.random() * this.boards.length), 1)[0];
	}

  	/**
  	 * Method to get whether this is a terminal (leaf) node or not.
  	 * @return {boolean} True if this node has no children, or false otherwise.
  	 */
  	isLeaf() {
  		return !(this.children.length > 0);
  	}

  	/**
	 * Method to create a new child node.
     * @param {Board} board - Board object of current game.
  	 * @return {Node} New child node object created.
  	 */
	push(board) {
		var child = new Node(board, this);
		this.children.push(child);
		return child;
	}

  	/**
	 * Method to get and return a random child node.
  	 * @return {Node} Random child node.
  	 */
	getRandomChild() {
		return this.children[Math.floor(Math.random() * this.children.length)];
	}

	/**
     * Method to calculate and return upper confidence bound score of a given child node.
     * @param {Node} child - Child node object.
     * @param {number} bias - Bias parameter applied in the UCB algorithm. Bias is used to vary the 
     *                         amount of exploration versus exploitation; defaults to 2.
     * @return {number} UCB child score.
     */
 	calculateUCBScore(child, bias=2) {
    	return ((child.wins / child.visits) * Math.sqrt(bias * Math.log(this.visits) / child.visits));
  	}

  	/**
  	 * Method to get and return the best upper confidence bound trees child node.
  	 * @return {Node} Best UCB child node.
  	 */
  	getUCBChild() {
		var max = -Infinity;
		var bestChild = null;
		for (var child of this.children) {
			var ucb = this.calculateUCBScore(child);
			if (ucb > max) {
				max = ucb;
				bestChild = child;
			}
		}
		return bestChild;
  	}

	/**
	 * Method to get and return the highest visited child node.
     * @return {Node} Highest visited child node.
     */
	getHighestVisitedChild() {
		var max = -Infinity;
		var bestChild = null;
		for (var child of this.children)
			if (child.visits > max) {
				max = child.visits;
				bestChild = child;
			}
		return bestChild;
	}

	/**
	 * Method to get and return the highest score child node.
     * @return {Node} Highest score child node.
     */
	getHighestScoreChild() {
		var max = -Infinity;
		var bestChild = null;
		for (var child of this.children) {
			var score = (child.wins / child.visits);
			if (score > max) {
				max = score;
				bestChild = child;
			}
		}
		return bestChild;
	}

	/**
	 * Method used to update this nodes statistics and backpropagate until at root node.
	 * @param {GameState} result - Game state result of simulation.
	 */
	update(result) {
		this.visits++;

		// If draw, add half a win to score
		if (result == GameState.DRAW)
			this.wins += .5;
		// Else, if this is a tiger node and tiger win or if goat node and goat win, increment wins
		else if ((!board.goatsMove && result == GameState.TIGER_WIN) ||
			(board.goatsMove && result == GameState.GOAT_WIN))
			this.wins++;

		// Backpropagate until at root node
		if (this.parent != null)
			this.parent.update(result);
	}
}

/**
 * Function to simulate a Monte Carlo Tree Search board of the best move.
 * @param {number} iterations - Number of iterations to run MCTS for.
 * @param {number} timeout - Optional paremter is used to end MCTS if algorithm takes longer 
 *                            than timeout seconds; default to 2.
 * @return {Board} Returns board object of best move.
 */
let mcts = function(board, iterations, timeout=2) {
	var root = new Node(board);

	// Run MCTS for given iterations or until algorithm timesout
    var time = Date.now() + timeout * 1000;
    while(Date.now() < time) {
    	// Selection
		var node = selection(root);

		// Expansion
		node = expansion(node);

		// Simulation
		var result = simulation(node);

		// Backpropagation
		node.update(result);
	}

	// Set iterations taken count
	iterationsCount = root.visits;
	debuggingScore = root.wins;

    // Get and return best (highest score) child node
	return root.getHighestScoreChild();
}

/**
 * Method to search and return best upper confidence bound child node.
 * @return {Node} Best UCT Child node.
 */
let selection = function(node) {
	while (!node.hasUnexaminedBoards() && !node.isLeaf())
		node = node.getUCBChild();
	return node;
}

/**
 * Method to search and return an unexamined child node containing unexplored boards.
 * @return {Node} New unexamined child node.
 */
let expansion = function(node) {
	if (node.hasUnexaminedBoards()) {
		var board = node.getRandomUnexaminedBoard();
		board.switchToNextPlayer();
		node = node.push(board);
	}
	return node;
}

/**
 * Method to simulate and play and finish a random board.
 * @return {GameState} Game state result of node simulation.
 */
let simulation = function(node) {
	var boards = node.boards;
	while (boards.length > 0) {
		// Get random board
		var board = boards[Math.floor(Math.random() * boards.length)];

		// If board game state (win/lose/draw) is over, return result
		var state = board.getGameState();
		if (state != GameState.IN_GAME)
			return state;

		// Simulate boards
		board.switchToNextPlayer();
		boards = simulateBoards(board);
	}
}