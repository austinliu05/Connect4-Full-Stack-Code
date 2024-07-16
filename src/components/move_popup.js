import React from 'react';
import './components.css'

const MovePopup = ({ message }) => (
    <div className="move-popup">
        <div>
            <h1>{message}</h1>
            {message === "AI's turn" && (
                <div className="lds-spinner">
                    <div></div><div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div><div></div>
                    <div></div><div></div>
                </div>
            )}
        </div>
    </div>
);

export default MovePopup;
