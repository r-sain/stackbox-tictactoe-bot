import { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const [playerSymbol, setPlayerSymbol] = useState('');
  const [turn, setTurn] = useState(true);
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('Computer');
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [gridArray, setGridArray] = useState(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const cellsRef = useRef([]);

  useEffect(() => {
    const symbol = prompt('Choose your symbol (X or O):');
    const playerName = prompt('Enter your name:');
    if (
      symbol &&
      (symbol.toUpperCase() === 'X' || symbol.toUpperCase() === 'O')
    ) {
      setPlayerSymbol(symbol.toUpperCase());
    } else {
      setPlayerSymbol('X');
    }
    if (playerName) {
      setP1Name(playerName);
    }
  }, []);

  const handleClick = index => {
    if (!gameOver && gridArray[index] === null && turn) {
      const tempArray = [...gridArray];
      tempArray[index] = playerSymbol;
      setGridArray(tempArray);
      setTurn(false);
      checkWinner(tempArray);
    }
  };

  const handleComputerMove = () => {
    if (!gameOver) {
      fetch('https://hiring-react-assignment.vercel.app/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gridArray),
      })
        .then(response => response.json())
        .then(data => {
          const position = data;
          if (
            typeof position === 'number' &&
            position >= 0 &&
            position < 9 &&
            gridArray[position] === null
          ) {
            const tempArray = [...gridArray];
            tempArray[position] = playerSymbol === 'X' ? 'O' : 'X';
            setGridArray(tempArray);
            setTurn(true);
            checkWinner(tempArray);
          } else {
            console.error('Invalid move position from API.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  };

  const checkWinner = currentGrid => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    let winner = null;
    let winningCells = [];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentGrid[a] &&
        currentGrid[a] === currentGrid[b] &&
        currentGrid[a] === currentGrid[c]
      ) {
        winner = currentGrid[a];
        winningCells = combination;
        break;
      }
    }

    if (winner) {
      if (winner === playerSymbol) {
        alertWithDelay('Player wins!');
        setP1Wins(prevWins => prevWins + 1);
      } else {
        alertWithDelay('Computer wins!');
        setP2Wins(prevWins => prevWins + 1);
      }
      setGameOver(true);
    } else if (currentGrid.every(cell => cell !== null)) {
      alertWithDelay("It's a draw!");
    }

    cellsRef.current.forEach((cell, index) => {
      if (winningCells.includes(index)) {
        cell.classList.add('winning-cell');
      } else {
        cell.classList.remove('winning-cell');
      }
    });
  };

  const alertWithDelay = message => {
    setTimeout(() => {
      alert(message);

      setTimeout(() => {
        cellsRef.current.forEach(cell => {
          cell.classList.remove('winning-cell');
        });

        setGridArray(Array(9).fill(null));
        setTurn(true);
        setGameOver(false);
      }, 1000);
    }, 500);
  };

  useEffect(() => {
    if (!turn) {
      handleComputerMove();
    }
  }, [turn, gameOver]);

  useEffect(() => {
    cellsRef.current = cellsRef.current.slice(0, gridArray.length);
  }, [gridArray.length]);

  return (
    <div className="app">
      <div className={`player ${turn ? 'true' : 'false'}`}>
        <span>{p1Name ? p1Name : 'Player'}</span>
        <span id="wins">wins: {p1Wins}</span>
      </div>
      <div className="tictactoe">
        <div className="box">
          {gridArray.map((cellValue, index) => (
            <div
              key={index}
              className="cell"
              ref={el => (cellsRef.current[index] = el)}
              onClick={() => handleClick(index)}
            >
              {cellValue}
            </div>
          ))}
        </div>
      </div>
      <div className={`player ${!turn ? 'true' : 'false'}`}>
        <span>{p2Name ? p2Name : 'Player 2'}</span>{' '}
        <span id="wins">wins: {p2Wins}</span>
      </div>
    </div>
  );
};

export default App;
