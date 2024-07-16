import React from 'react';
import './components.css'

const Popup = ({ message }) => (
    <div className="gameEnd-popup">
        <div>
            <h1>{message}</h1>
        </div>
    </div>
);

export default Popup;
