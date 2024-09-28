function Square({ value, onSquareClick }) {
    return (
        <button className="square" onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay }) {
    function handleClick(i) {
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? 'X' : 'O';
        onPlay(nextSquares);
    }

    const { winner, line } = calculateWinner(squares);
    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else {
        status = 'Your Turn: ' + (xIsNext ? 'X' : 'O');
    }

    return (
        <div id="main-container">
            <div className="status">{status}</div>
            <div className="board-row">
                <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
            </div>
            <div className="board-row">
                <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
            </div>
            <div className="board-row">
                <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
                <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
                <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
            </div>
            {winner && <WinningLine line={line} />}
        </div>
    );
}

function WinningLine({ line }) {
    const style = calculateLineStyle(line);
    return (
        <div>
            {line !== null && (
                <>
                    {line < 3 && ( // Horizontal lines
                        <div id="winning-line-horizontal" style={style}></div>
                    )}
                    {line >= 3 && line < 6 && ( // Vertical lines
                        <div id="winning-line-vertical" style={style}></div>
                    )}
                    {line === 6 && ( // Left diagonal
                        <div id="winning-line-left-diagonal" style={style}></div>
                    )}
                    {line === 7 && ( // Right diagonal
                        <div id="winning-line-right-diagonal" style={style}></div>
                    )}
                </>
            )}
        </div>
    );
}

function calculateLineStyle(line) {
    if (line === null) return {};

    const positions = [
        // Horizontal lines
        { top: '184px', left: '21px', width: '90%', height: '10px', transform: 'rotate(0deg)' },   // Row 1
        { top: '344px', left: '21px', width: '90%', height: '10px', transform: 'rotate(0deg)' },  // Row 2
        { top: '484px', left: '21px', width: '90%', height: '10px', transform: 'rotate(0deg)' },  // Row 3
        // Vertical lines
        { top: '152px', left: '64px', width: '10px', height: '70%', transform: 'rotate(0deg)' },   // Col 1
        { top: '152px', left: '214px', width: '10px', height: '70%', transform: 'rotate(0deg)' },  // Col 2
        { top: '152px', left: '364px', width: '10px', height: '70%', transform: 'rotate(0deg)' },  // Col 3
        // Diagonal lines
        { top: '530px', left: '-110px', width: '115%', height: '10px', transform: 'rotate(45deg)' }, // Diagonal 1
        { top: '520px', left: '50px', width: '115%', height: '10px', transform: 'rotate(-45deg)' }  // Diagonal 2
    ];

    return positions[line];
}




function Game() {
    const [history, setHistory] = React.useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = React.useState(0);
    const [xIsNext, setXIsNext] = React.useState(null);
    const [showMovements, setShowMovements] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [loadingDots, setLoadingDots] = React.useState('');
    const [playerMode, setPlayerMode] = React.useState(null);
    const [computerSymbol, setComputerSymbol] = React.useState(null); // Set default computer symbol

    const currentSquares = history[currentMove];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setLoadingDots(prev => (prev.length < 3 ? prev + '.' : ''));
        }, 400);

        const loadingTimeout = setTimeout(() => {
            setLoading(false);
            clearInterval(interval);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(loadingTimeout);
        };
    }, []);

    // Function to handle playing a move
    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
        setXIsNext(!xIsNext); // Toggle turn
    }

    // Helper function to determine if there's a winner
    function calculateWinner(squares) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
            [0, 4, 8], [2, 4, 6]             // Diagonal
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a]; // Return 'X' or 'O' (the winner)
            }
        }
        return null; // No winner yet
    }

    // React hook to handle computer's move
    React.useEffect(() => {
        // Prevent the computer from making a move if there's already a winner
        if (playerMode === 1 && xIsNext === false && !calculateWinner(currentSquares)) {
            // Add delay before the computer plays
            const timeoutId = setTimeout(() => {
                const nextSquares = [...currentSquares];

                const availableSquares = nextSquares
                    .map((square, index) => (square === null ? index : null))
                    .filter(index => index !== null);

                if (availableSquares.length > 0) {
                    const randomSquare = availableSquares[Math.floor(Math.random() * availableSquares.length)];

                    // Ensure the computer uses the correct symbol
                    const computerSymbol = xIsNext === false ? 'O' : 'X'; // Correctly assign based on xIsNext state
                    nextSquares[randomSquare] = computerSymbol;

                    // Call handlePlay to update the board after the computer's move
                    handlePlay(nextSquares);
                }
            }, 400); // 400ms delay for computer's move

            // Cleanup timeout if effect is re-triggered
            return () => clearTimeout(timeoutId);
        }
    }, [xIsNext, playerMode, currentSquares, computerSymbol]);



    const jumpTo = nextMove => {
        setCurrentMove(nextMove);
    };

    const handleSelectSymbol = symbol => {
        setXIsNext(symbol === 'X'); // Set to true if symbol is 'X', false otherwise
        setComputerSymbol(symbol === 'X' ? 'O' : 'X'); // Set computer symbol based on player selection
    };

    const handleStartNewGame = () => {
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setXIsNext(null);
        setPlayerMode(null);
        setShowMovements(false);
    };

    const handlePlayerMode = mode => {
        setPlayerMode(mode);
    };

    const movements = history.map((_, move) => (
        move > 0 && (
            <li key={move}>
                <button id="movements" onClick={() => jumpTo(move)}>
                    {'Go to movement #' + move}
                </button>
            </li>
        )
    ));

    const toggleMovements = () => {
        setShowMovements(!showMovements);
    };

    if (loading) {
        return (
            <div id="title-tic-tac-toe">
                <h1 id="loading-title">Tic Tac Toe</h1>
                <h2>Loading{loadingDots}</h2>
            </div>
        );
    }

    if (playerMode === null) {
        return (
            <div id="title-tic-tac-toe">
                <div className="select-option-mode">
                    <h2>Select Player Mode:</h2>
                    <button onClick={() => handlePlayerMode(1)}>1 Player</button>
                    <button onClick={() => handlePlayerMode(2)}>2 Players</button>
                </div>
            </div>
        );
    }

    if (xIsNext === null) {
        return (
            <div id="title-tic-tac-toe">
                <div className="select-option">
                    <h2>Select Your Symbol:</h2>
                    <button className="select-symbol" onClick={() => handleSelectSymbol('X')}>X</button>
                    <button className="select-symbol" onClick={() => handleSelectSymbol('O')}>O</button>
                </div>
            </div>
        );
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            </div>
            <div className="game-info">
                {history.length > 1 && (
                    <div className="movements-toggle">
                        <button onClick={toggleMovements}>
                            {showMovements ? 'Hide Movements' : 'Show Movements'}
                        </button>
                        {showMovements && (
                            <div className="movements-container">
                                <ol>{movements}</ol>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="game-controls">
                <button id="start-new-game" onClick={handleStartNewGame}>
                    Start New Game
                </button>
            </div>
        </div>
    );
}







function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: i };
        }
    }
    return { winner: null, line: null };
}

// Rendering the Game component
ReactDOM.render(<Game />, document.getElementById('root'));
