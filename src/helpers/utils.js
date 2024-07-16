// helpers/firebaseHelpers.js
import { ref, set, onValue } from "firebase/database";
import { database } from "../firebase_config";

export const updateRecord = (wins, losses, ties) => {
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

export const fetchRecord = (setRecord) => {
    const recordRef = ref(database, "Connect4/Record");
    onValue(recordRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            setRecord(snapshot.val());
        } else {
            console.log("No data available");
        }
    }, (error) => {
        console.error("Error fetching record: ", error);
    });
};

export const generateGrid = (ROWS, COLUMNS) => {
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
