// Game
let board;
let turnP;
const PLACEABLE_GOATS = 20;
let goatsInHandP;
let goatsCapturedP;
let tigersTrappedP;
let statusP;
let gameOver = false;

// Controls
let gameMode;
let GameMode = Object.freeze({
	PLAYER_VS_PLAYER: 0,
	PLAYER_VS_AI: 1,
	AI_VS_AI: 2
})
let playAsSelect, playAsTiger = true;
let goatP, tigerP;
let goatAlgorithm, tigerAlgorithm;
let Algorithm = Object.freeze({
	MINIMAX: 0,
	MINIMAX_AB: 1,
	MCTS: 2
})
let goatDepth, tigerDepth;
let goatTime, tigerTime;
let delaySpan, delaySlider, delay, hasSimulated = false;
let resetButton;
let pauseButton, paused = false;

// Debugging
let debuggingDiv;
var iterationsCount;
let countP;
let time0, time1, debuggingTime, timeP;
var debuggingScore;
let scoreP;
//let goatWins = 0, goatWinsP, tigerWins = 0, tigerWinsP, draws = 0, drawsP;

/** Function to reset the game to it's default start state. */
let reset = function() {
	board.reset();
 	iterationsCount = goatDebuggingDepth = debuggingTime = debuggingScore = '?';
	if (paused)
		statusP.html('Paused').class('paused');
	else
		statusP.html('Running').class('running');
	gameOver = false;
}

/** Function to update what controls are disabled corresponding to currently selected controls. */
let updateHandler = function() {
	reset();

	if (gameMode.value() == GameMode.PLAYER_VS_PLAYER) {
		// Hide all
		playAsSelect.class('hidden');
		goatP.class('hidden');
		goatAlgorithm.class('hidden');
		goatDepth.class('hidden');
		goatTime.class('hidden');
		tigerP.class('hidden');
		tigerAlgorithm.class('hidden');
		tigerDepth.class('hidden');
		tigerTime.class('hidden');
		delaySpan.class('hidden');
		debuggingDiv.class('hidden');
	} else {
		// Remove all hidden
		playAsSelect.removeClass('hidden');
		playAsSelect.removeClass('disabled');
		goatP.removeClass('hidden');
		goatAlgorithm.removeClass('hidden');
		goatDepth.removeClass('hidden');
		tigerP.removeClass('hidden');
		tigerAlgorithm.removeClass('hidden');
		tigerDepth.removeClass('hidden');
		debuggingDiv.removeClass('hidden');

		if (gameMode.value() == GameMode.PLAYER_VS_AI) {
			if (playAsTiger) {
				// Show goat algorithm selector
				goatAlgorithm.removeClass('disabled');

				// If goat is MCTS, disable corresponding selector
				if (goatAlgorithm.value() == Algorithm.MCTS) {
					goatDepth.class('disabled');
					goatTime.removeClass('disabled');
					delaySpan.class('hidden');
				} else {
					goatDepth.removeClass('disabled');
					goatTime.class('disabled');
					delaySpan.removeClass('hidden');
				}

				// Disable tiger controls
				tigerAlgorithm.class('disabled');
				tigerDepth.class('disabled');
				tigerTime.class('disabled');
			} else {
				// Show tiger algorithm controls
				goatAlgorithm.class('disabled');
				goatDepth.class('disabled');
				goatTime.class('disabled');

				// Disable goat selector
				tigerAlgorithm.removeClass('disabled');

				// If tiger is MCTS, disable corresponding selector
				if (tigerAlgorithm.value() == Algorithm.MCTS) {
					tigerDepth.class('disabled');
					tigerTime.removeClass('disabled');
					delaySpan.class('hidden');
				} else {
					tigerDepth.removeClass('disabled');
					tigerTime.class('disabled');
					delaySpan.removeClass('hidden');
				}
			}
		} else if (gameMode.value() == GameMode.AI_VS_AI) {
			// Show algorithms
			goatAlgorithm.removeClass('disabled');
			tigerAlgorithm.removeClass('disabled');

			// If goat is MCTS, disable corresponding selector
			if (goatAlgorithm.value() == Algorithm.MCTS) {
				goatDepth.class('disabled');
				goatTime.removeClass('disabled');
			} else {
				goatDepth.removeClass('disabled');
				goatTime.class('disabled');
			}

			// If tiger is MCTS, disable corresponding selector
			if (tigerAlgorithm.value() == Algorithm.MCTS) {
				tigerDepth.class('disabled');
				tigerTime.removeClass('disabled');
			} else {
				tigerDepth.removeClass('disabled');
				tigerTime.class('disabled');
			}

			// Hide delay timer if both goat and tiger are using MCTS
			if (goatAlgorithm.value() == Algorithm.MCTS && tigerAlgorithm.value() == Algorithm.MCTS)
				delaySpan.class('hidden');
			else
				delaySpan.removeClass('hidden');

			// Disable play as
			playAsSelect.class('disabled');
		}
	}
}

/** Function to change play as (Tiger or goat) on play as selector change. */
let changePlayAs = function() {
	playAsTiger = playAsSelect.value() == 0 ? true : false;
	updateHandler();
}

/** Function used to toggle if the game is currently paused or unpaused. */
let togglePause = function() {
	paused = !paused;
	if (paused) {
		pauseButton.html('Resume');
		if (!gameOver)
			statusP.html('Paused').class('paused');
	} else {
		pauseButton.html('Pause');
		if (!gameOver)
			statusP.html('Running').class('running');
	}
}

/** Function to initialise new game. */
function initialise() {
	board = new Board();

	var handler = createDiv();
	handler.parent('#bagh-chal');
	handler.id('handler');

	// --- Game Properties ---
	var propertiesDiv = createDiv();
	propertiesDiv.child(createElement('h3', 'Game'));
	propertiesDiv.parent('#handler');
	propertiesDiv.id('properties');

	// Turn
	var turnSpan = createSpan('Turn: ');
	turnSpan.parent('#properties');
	turnSpan.child(turnP = createP('?'));

	// Goats In-Hand
	var goatsInHandSpan = createSpan('Goats In-Hand: ');
	goatsInHandSpan.parent('#properties');
	goatsInHandSpan.child(goatsInHandP = createP('?'));

	// Goats Captured
	var goatsCapturedSpan = createSpan('Goats Captured: ');
	goatsCapturedSpan.parent('#properties');
	goatsCapturedSpan.child(goatsCapturedP = createP('?'));

	// Tigers Trapped
	var tigersTrappedSpan = createSpan('Tigers Trapped: ');
	tigersTrappedSpan.parent('#properties');
	tigersTrappedSpan.child(tigersTrappedP = createP('?'));

	// Status
	var statusSpan = createSpan('Status: ');
	statusSpan.parent('#properties');
	statusSpan.child(statusP = createP('Running').class('running'));

	// --- Controls ---
	var controlsDiv = createDiv();
	controlsDiv.parent('#handler');
	controlsDiv.id('controls');
	controlsDiv.child(createElement('h3', 'Controls'));

	// Game Mode
	controlsDiv.child(gameMode = createSelect());
	gameMode.option('Game Mode');
	gameMode.option('Player vs Player', 0);
	gameMode.option('Player vs AI', 1);
	gameMode.option('AI vs AI', 2);
	gameMode.value(1);
	gameMode.changed(updateHandler);

	// Play As
	controlsDiv.child(playAsSelect = createSelect());
	playAsSelect.option('Play As');
	playAsSelect.option('Tiger', 0);
	playAsSelect.option('Goat', 1);
	playAsSelect.value(playAsTiger ? 0 : 1);
	playAsSelect.changed(changePlayAs);

	// Goat Algorithm/Depth
	controlsDiv.child(goatP = createP('Goat'));
	controlsDiv.child(goatAlgorithm = createSelect());
	goatAlgorithm.option('Algorithm');
	goatAlgorithm.option('Minimax', 0);
	goatAlgorithm.option('Alpha-Beta', 1);
	goatAlgorithm.option('MCTS', 2);
	goatAlgorithm.value(1);
	goatAlgorithm.changed(updateHandler);

	controlsDiv.child(goatDepth = createSelect());
	goatDepth.option('Depth');
	goatDepth.option('Depth 1 (Very Easy)', 1);
	goatDepth.option('Depth 2 (Easy)', 2);
	goatDepth.option('Depth 3 (Moderate)', 3);
	goatDepth.option('Depth 4 (Hard)', 4);
	goatDepth.option('Depth 5 (Very Hard)', 5);
	goatDepth.value(3);
	goatDepth.changed(reset);

	controlsDiv.child(goatTime = createSelect());
	goatTime.option('Time');
	goatTime.option('2s', 2);
	goatTime.option('4s', 4);
	goatTime.option('6s', 6);
	goatTime.option('8s', 8);
	goatTime.option('10s', 10);
	goatTime.value(2);
	goatTime.changed(reset);

	// Tiger Algorithm/Depth
	controlsDiv.child(tigerP = createP('Tiger'));
	controlsDiv.child(tigerAlgorithm = createSelect());
	tigerAlgorithm.option('Algorithm');
	tigerAlgorithm.option('Minimax', 0);
	tigerAlgorithm.option('Alpha-Beta', 1);
	tigerAlgorithm.option('MCTS', 2);
	tigerAlgorithm.value(1);
	tigerAlgorithm.changed(updateHandler);

	controlsDiv.child(tigerDepth = createSelect());
	tigerDepth.option('Depth');
	tigerDepth.option('Depth 1 (Very Easy)', 1);
	tigerDepth.option('Depth 2 (Easy)', 2);
	tigerDepth.option('Depth 3 (Moderate)', 3);
	tigerDepth.option('Depth 4 (Hard)', 4);
	tigerDepth.option('Depth 5 (Very Hard)', 5);
	tigerDepth.value(3);
	tigerDepth.changed(reset);

	controlsDiv.child(tigerTime = createSelect());
	tigerTime.option('Time');
	tigerTime.option('2s', 2);
	tigerTime.option('4s', 4);
	tigerTime.option('6s', 6);
	tigerTime.option('8s', 8);
	tigerTime.option('10s', 10);
	tigerTime.value(2);
	tigerTime.changed(reset);

	// Delay
	delaySpan = createSpan('Min. Simulation Delay');
	delaySpan.parent('#controls');
	delaySpan.child(delaySlider = createSlider(0, 500, 250));

	// Reset
	controlsDiv.child(resetButton = createButton('Reset'));
	resetButton.mousePressed(reset);

	// Pause
	controlsDiv.child(pauseButton = createButton('Pause'));
	pauseButton.mousePressed(togglePause);

	// --- AI Debugging ---
	debuggingDiv = createDiv();
	debuggingDiv.parent('#handler');
	debuggingDiv.id('debugging');
	debuggingDiv.child(createElement('h3', 'AI Debugging'));

	// Iterations
	var iterationsSpan = createSpan('Iterations: ');
	iterationsSpan.parent('#debugging');
	iterationsSpan.child(countP = createP('?'));

	// Time
	var timeSpan = createSpan('Time to Run: ');
	timeSpan.parent('#debugging');
	timeSpan.child(timeP = createP('?'));

	// Score
	var scoreSpan = createSpan('Score/Wins: ');
	scoreSpan.parent('#debugging');
	scoreSpan.child(scoreP = createP('?'));

	// Tiger Wins
	//var scoreSpan = createSpan('Tiger Wins: ');
	//scoreSpan.parent('#debugging');
	//scoreSpan.child(tigerWinsP = createP('?'));

	// Goat Wins
	//var scoreSpan = createSpan('Goat Wins: ');
	//scoreSpan.parent('#debugging');
	//scoreSpan.child(goatWinsP = createP('?'));

	// Draws
	//var scoreSpan = createSpan('Draws: ');
	//scoreSpan.parent('#debugging');
	//scoreSpan.child(drawsP = createP('?'));

	// Update what's disabled/hidden
	$('select > option:first-child').attr('disabled', true);
	updateHandler();
}

/**
 * Function to simulate and return a Minimax board.
 * @param {number} depth - Depth of algorithm search.
 * @return {Board} Simulated board containing new move.
 */
let simulateMinimaxBoard = function(depth) {
	var result = alphaBeta(board, false, depth);
	debuggingScore = result[0];
	return result[1];
}

/**
 * Function to simulate and return a Minimax with Alpha-Beta Pruning board.
 * @param {number} depth - Depth of algorithm search.
 * @return {Board} Simulated board containing new move.
 */
let simulateAlphaBetaBoard = function(depth) {
	var result = alphaBeta(board, true, depth);
	debuggingScore = result[0];
	return result[1];
}

/**
 * Function to simulate and and return a Monte Carlo Tree Search board.
 * @return {Board} Simulated board containing new move.
 */
let simulateMCTSBoard = function(time) {
	return mcts(board, 10000, time).board;
}

/** Method to handle and set a new simulated board based on the current game settings. */
let simulateBoard = function() {
	// If AI turn
	if ((gameMode.value() == GameMode.PLAYER_VS_AI && playAsTiger && board.goatsMove) ||
		(gameMode.value() == GameMode.PLAYER_VS_AI && !playAsTiger && !board.goatsMove) ||
		(gameMode.value() == GameMode.AI_VS_AI) &&
		(!hasSimulated || delaySlider.value() == 0)) {
		// Reset count
		iterationsCount = 0;
		// Record time before starting simulation
		time0 = performance.now();

		if (board.goatsMove) {
			if (goatAlgorithm.value() == Algorithm.MINIMAX)
				board = simulateMinimaxBoard(goatDepth.value());
			else if (goatAlgorithm.value() == Algorithm.MINIMAX_AB)
				board = simulateAlphaBetaBoard(goatDepth.value());
		 	else if (goatAlgorithm.value() == Algorithm.MCTS)
		 		board = simulateMCTSBoard(goatTime.value());
		} else {
		 	if (tigerAlgorithm.value() == Algorithm.MINIMAX)
				board = simulateMinimaxBoard(tigerDepth.value());
			else if (tigerAlgorithm.value() == Algorithm.MINIMAX_AB)
				board = simulateAlphaBetaBoard(tigerDepth.value());
		 	else if (tigerAlgorithm.value() == Algorithm.MCTS)
		 		board = simulateMCTSBoard(tigerTime.value());
		}

		// Record time after finishing simulation
		debuggingTime = (Math.round(((time1 = performance.now()) - time0) * 100) / 100) + 'ms';

		// Simulation finished
		hasSimulated = true;
	}

	// If AI has just played, begin delay timer
	if (hasSimulated)
		delay = performance.now() - (time1 - time0);

	// If delay timer is greater than threshold time, allow simulation
	if (delay - time0 > delaySlider.value())
		hasSimulated = false;
}

/** Handle key presses. */
function keyPressed() {
	// Reset
	if (key == 'r' || key == 'R')
		reset();

	// Toggle pause
	if (key == 'p' || key == 'P')
		togglePause();

	// Unselect piece
	if (key == 'Escape')
		board.unselectPiece();
}

/** Handle mouse clicks. */
function mouseClicked() {
	// Get mouse position relative to board tile size
  	var x = floor(mouseX / tileSize);
  	var y = floor(mouseY / tileSize);

  	// If paused, unselect piece
  	if (paused || gameOver)
		board.unselectPiece();
  	// If goats turn and player has goats to place, place goat at mouse x and y tile position
   	else if (board.goatsMove && board.goatsInHand > 0) {
   		if (board.placeGoatAt(x, y))
	  		board.switchToNextPlayer();
   	} else
  		// If piece is not currently selected, select piece at mouse x and y tile position
	    if (!board.isPieceSelected()) {
	    	board.selectPieceAt(x, y);
		// Else, if moving, move piece to mouse x and y tile position
		} else {
			if (board.move(board.getSelectedPiece().position, x, y))
				board.switchToNextPlayer();
			board.unselectPiece();
	    }
}

let prevGoatsMove, prevGoatsInHand, prevGoatsCaptured,
	prevTigersTrapped, prevCount, prevTime, prevScore;
//let prevGoatWins, prevTigerWins, prevDraws;

/** Draw. */
function draw() {
	background('#b89560');

	// If game isn't over, not paused and not player vs player, simulate AI
	if (!gameOver && !paused && gameMode.value() != GameMode.PLAYER_VS_PLAYER)
		simulateBoard();

	// Turn
	if (prevGoatsMove != board.goatsMove)
		board.goatsMove ? turnP.html('Goat').class('goat') : turnP.html('Tiger').class('tiger');
	prevGoatsMove = board.goatsMove;

	// Goats In-Hand
	if (prevGoatsInHand != board.goatsInHand)
		goatsInHandP.html(board.goatsInHand);
	prevGoatsInHand = board.goatsInHand;

	// Goats Captured
	if (prevGoatsCaptured != board.goatsCaptured)
		goatsCapturedP.html(board.goatsCaptured);
	prevGoatsCaptured = board.goatsCaptured;

	// Tigers Trapped
	if (prevTigersTrapped != board.tigersTrapped)
		tigersTrappedP.html(board.tigersTrapped);
	prevTigersTrapped = board.tigersTrapped;

	// Iterations
	if (prevCount != iterationsCount)
		countP.html(iterationsCount);
	prevCount = iterationsCount;

	// Time
	if (prevTime != debuggingTime)
		timeP.html(debuggingTime);
	prevTime = debuggingTime;

	// Score
	if (prevScore != debuggingScore)
		scoreP.html(debuggingScore);
	prevScore = debuggingScore;

	// Tiger Wins
	//if (prevTigerWins != tigerWins)
	//	tigerWinsP.html(tigerWins);
	//prevTigerWins = tigerWins;

	// Goat Wins
	//if (prevGoatWins != goatWins)
	//	goatWinsP.html(goatWins);
	//prevGoatWins = goatWins;

	// Draws
	//if (prevDraws != draws)
	//	drawsP.html(draws);
	//prevDraws = draws;

	// Draw board
	board.draw();

	if (!paused || !gameOver) {
		// Draw ghost piece if goats in hand, goats turn and goat move
		if (board.goatsInHand > 0 &&
			((gameMode.value() == GameMode.PLAYER_VS_PLAYER && board.goatsMove) ||
			(gameMode.value() == GameMode.PLAYER_VS_AI && !playAsTiger && board.goatsMove))) {
			// Get mouse position relative to board tile size
  			var x = floor(mouseX / tileSize);
  			var y = floor(mouseY / tileSize);

  			// Draw ghost goat
			Goat.drawAsGhost(board, x, y, false);
		} else {
			// Else, if piece is selected, and...
			var piece = board.getSelectedPiece();
			if (piece != null) {
				// Get mouse position relative to board tile size
		  		var x = floor(mouseX / tileSize);
		  		var y = floor(mouseY / tileSize);

	  			// If piece can make a valid move, draw ghost piece
	  			if ((piece.isGoat && piece.canMove(board, x, y)) ||
	  				(piece.isTiger && (piece.canMove(board, x, y) || piece.canCapture(board, x, y))))
					piece.drawAsGhost(board, x, y, true);
			}
		}
	}

	if (!gameOver) {
		var gameState = board.getGameState();

		// If game over, update winner in status
		if (gameState == GameState.TIGER_WIN) {
			//tigerWins++;
			statusP.html('Tigers Win!').class('tiger');
		}
		else if (gameState == GameState.GOAT_WIN) {
			//goatWins++;
			statusP.html('Goats Win!').class('goat');
		}
		else if (gameState == GameState.DRAW) {
			//draws++
			statusP.html('Draw!').class('draw');
		}

		// If game over, stop game
		if (gameState != GameState.IN_GAME)
		 	gameOver = true;
		 	//reset();
	 }
}