# Connect4 Game

Welcome to the Connect4 Game! This project started as a class assignment written in ReasonML, where players could compete against an AI model in the terminal. It has since been converted to Python and deployed as a full-stack application with a modern UI. The frontend is written in React (TypeScript), and the backend is powered by Flask, with Firebase managing the records.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Play Connect4 against an AI model
- Modern and responsive user interface
- User authentication and record management with Firebase
- Real-time updates and smooth gameplay experience

## Installation

### Prerequisites

Ensure you have the following installed on your machine:

- Python 3.x
- Node.js and npm (or yarn)
- Firebase account

### Backend Setup

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/connect4-game.git
    cd connect4-game
    ```

2. Set up a virtual environment and activate it:

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the backend dependencies:

    ```sh
    pip install -r requirements.txt
    ```

4. Configure Firebase:

    - Create a Firebase project in the Firebase console.
    - Generate Firebase credentials and save the JSON file in the backend directory.
    - Update the Firebase configuration in the backend code.

5. Start the Flask server:

    ```sh
    flask run
    ```

### Frontend Setup

1. Navigate to the frontend directory:

    ```sh
    cd frontend
    ```

2. Install the frontend dependencies:

    ```sh
    npm install
    ```

3. Configure Firebase in the frontend:

    - Update the Firebase configuration in the `src/firebaseConfig.ts` file with your project's details.

4. Start the React development server:

    ```sh
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Register or log in to your account.
3. Start a new game and enjoy playing Connect4 against the AI!

## Project Structure

