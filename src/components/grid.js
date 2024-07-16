import React from 'react';
import './components.css'
const Grid = ({ gridData, onButtonClick, isGameActive, isPlayerTurn }) => {
    return (
        <div className="board">
            {gridData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {row.map((cell) => (
                        <button
                            key={cell.id}
                            className={`${cell.isClicked
                                ? "clicked"
                                : cell.recent
                                    ? "recent"
                                    : cell.AIPlace
                                        ? "placed"
                                        : !isGameActive || !isPlayerTurn
                                            ? "no-hover"
                                            : ""
                                }`}
                            onClick={() => onButtonClick(cell.row, cell.col, cell.id)}
                        ></button>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Grid;
