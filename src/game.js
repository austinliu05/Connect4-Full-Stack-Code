import "./game.css";
import './components/components.css'
import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { database } from "./firebase_config";
import Grid from "./components/grid";
import Popup from "./components/popup";
import MovePopup from "./components/move_popup";

const ROWS = 6;
const COLUMNS = 7;

const Game = () => {
    const [hasWon, setHasWon] = useState(false);
    const [hasLost, setHasLost] = useState(false);
    const [hasDraw, setHasDraw] = useState(false);
    const [isGameActive, setIsGameActive] = useState(true);
    const [isInvalid, setInvalid] = useState(false);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [record, setRecord] = useState({ Ties: 0, Losses: 0, Wins: 0 });

    const generateGrid = () => {
        const grid = [];
        for (let row = 0; row < ROWS; row++) {
            const currentRow = [];
            for (let col = 0; col < COLUMNS; col++) {
                currentRow.push({
                    id: `row${row}-col${col}`,
                    row,
                    col,
                    isClicked: false,
                    AIPlace: false,
                });
            }
            grid.push(currentRow);
        }
        return grid;
    };

    const [gridData, setGridData] = useState(generateGrid());

    const handleButtonClick = (row, col, id) => {
        console.log(`Button clicked at row ${row}, column ${col}`);
        if (!isGameActive || !isPlayerTurn) {
            return;
        }
        if (gridData[row][col].isClicked || gridData[row][col].AIPlace) {
            setInvalid(true);
            return;
        } else if (
            row < 5 &&
            !gridData[row + 1][col].isClicked &&
            !gridData[row + 1][col].AIPlace
        ) {
            setInvalid(true);
            return;
        }
        setInvalid(false);

        const newGridData = gridData.map((rowData) =>
            rowData.map((cell) => {
                if (cell.id === id) {
                    return { ...cell, isClicked: true };
                }
                return { ...cell };
            })
        );

        setGridData(newGridData);
        let board = [];
        for (let i = 0; i < 6; i++) {
            let currRow = [];
            for (let j = 0; j < 7; j++) {
                let val = 0;
                if (newGridData[i][j].isClicked) {
                    val = 1;
                } else if (newGridData[i][j].AIPlace) {
                    val = -1;
                }
                if (j === 3) {
                    val = val * 8;
                } else if (j === 2 || j === 4) {
                    val = val * 4;
                } else if (j === 1 || j === 5) {
                    val = val * 2;
                }
                currRow.push(val);
            }
            board.push(currRow);
        }
        let data = { x: row, y: col, board: board };
        console.log(data);
        sendData(data);
        setIsPlayerTurn(false);
    };

    const [data, setData] = useState([{}]);
    const sendData = (data) => {
        fetch("https://apoxie.pythonanywhere.com/connect4", {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((responseData) => {
                console.log("Server Response:", responseData);
                responseData = JSON.parse(responseData);

                if (responseData["status"] === "WIN") {
                    setHasWon(true);
                    setIsGameActive(false);
                    updateRecord(record.Wins, record.Losses + 1, record.Ties);
                } else if (responseData["status"] === "LOSE") {
                    setHasLost(true);
                    setIsGameActive(false);
                    updateRecord(record.Wins + 1, record.Losses, record.Ties);
                } else if (responseData["status"] === "DRAW") {
                    setHasDraw(true);
                    setIsGameActive(false);
                    updateRecord(record.Wins, record.Losses, record.Ties + 1);
                }
                setData(responseData["board"]);
                let board = responseData["board"];
                const newGridData = JSON.parse(JSON.stringify(gridData));
                let x = responseData["x"] - 1;
                let y = 5 - responseData["y"];

                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 7; j++) {
                        if (i === y && x === j) {
                            newGridData[y][x] = {
                                ...newGridData[y][x],
                                recent: true,
                                AIPlace: true,
                            };
                        } else if (board[i][j] >= 1) {
                            newGridData[i][j] = { ...newGridData[i][j], isClicked: true };
                        } else if (board[i][j] <= -1) {
                            newGridData[i][j] = {
                                ...newGridData[i][j],
                                AIPlace: true,
                                recent: false,
                            };
                        } else {
                            newGridData[i][j] = {
                                ...newGridData[i][j],
                                AIPlace: false,
                                isClicked: false,
                                recent: false,
                            };
                        }
                    }
                }
                setGridData(newGridData);
                setIsPlayerTurn(true);
                fetchRecord();
            })
            .catch((error) => {
                console.error("Error sending data:", error);
            });
    };

    const resetGameState = () => {
        setHasDraw(false);
        setHasLost(false);
        setHasWon(false);
        setIsGameActive(true);
        setInvalid(false);
        setIsPlayerTurn(true);
        const newGridData = gridData.map((rowData) =>
            rowData.map((cell) => {
                return { ...cell, isClicked: false, AIPlace: false, recent: false };
            })
        );

        setGridData(newGridData);
    };

    const updateRecord = (wins, losses, ties) => {
        const recordRef = ref(database, "Connect4/Record");
        set(recordRef, {
            Wins: wins,
            Losses: losses,
            Ties: ties,
        })
            .then(() => {
                console.log("Record updated successfully");
            })
            .catch((error) => {
                console.error("Error updating record: ", error);
            });
    };

    const fetchRecord = () => {
        const recordRef = ref(database, "Connect4/Record");
        onValue(recordRef, (snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot);
                setRecord(snapshot.val());
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching record: ", error);
        });
    };

    useEffect(() => {
        fetchRecord();
    }, []);

    return (
        <div className="game">
            <div className="popup-container">
                <Grid
                    gridData={gridData}
                    onButtonClick={handleButtonClick}
                    isGameActive={isGameActive}
                    isPlayerTurn={isPlayerTurn}
                />
                <div className="popup-content">
                    {hasWon && <Popup message="You Win!" />}
                    {hasDraw && <Popup message="Draw!" />}
                    {hasLost && <Popup message="You Lose!" />}
                    {isInvalid && (
                        <div className="invalid-popup">
                            <div>
                                <h1>Invalid Move!</h1>
                            </div>
                        </div>
                    )}
                    {(hasLost || hasDraw || hasWon) && (
                        <button
                            id="playAgainButton"
                            className="play-again-btn"
                            onClick={resetGameState}
                        >
                            Play Again?
                        </button>
                    )}
                    {isPlayerTurn && isGameActive && !isInvalid && (
                        <MovePopup message="Your turn" />
                    )}
                    {!isPlayerTurn && isGameActive && (
                        <MovePopup message="AI's turn" />
                    )}
                    <div className="record-counter">
                        <h2 className="Wins">Wins: <span className="green">{record.Wins}</span></h2>
                        <h2 className="Losses">Losses: <span className="red">{record.Losses}</span></h2>
                        <h2 className="Ties">Ties: <span className="black">{record.Ties}</span></h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
