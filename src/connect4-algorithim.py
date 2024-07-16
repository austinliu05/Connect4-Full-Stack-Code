from flask import Flask,request, jsonify, Blueprint
import numpy as np
from enum import Enum
from flask_cors import CORS
import copy
import json

def play_game(data):
    twoDData = convert(json.dumps(data["board"]))
    board = np.fliplr(np.transpose(twoDData))
    updatedData = makeMove(board, data["y"], 5 - data["x"])
    
    return updatedData

def convert(jsonString: str):
    jBoard = json.loads(jsonString)
    return jBoard
    
def makeMove(board, row, col):
        ## player side checking
        (status, board) = checkPlayer(board, row, col, board[col])
        board_list = (np.fliplr(board).T).tolist()
        if(status == Status.DRAW):
            response_dict = {
                'status': 'DRAW',
                'board': board_list
            }
            return json.dumps(response_dict)
        elif(status == Status.WIN):
            response_dict = {
                'status': 'WIN',
                'board': board_list
            }
            return json.dumps(response_dict)
        
        ## gets all possible moves in board
        moves = legalMoves(board)
        ## finds the best move 
        m = bestMove(Status.aiONGOING, board, moves)
        ## makes the best move and returns a state which is a tuple of (status, board)
        (currentStatus, b) = nextState(Status.aiONGOING, board, m)
        transBoard = (np.fliplr(b).T).tolist()
        y = lastPlaced(board, m)
        if(currentStatus == Status.aiWIN):
            response_dict = {
                'status': 'LOSE',
                'board': transBoard,
                'x': m,
                'y': y
            }
            return json.dumps(response_dict)
        elif(currentStatus == Status.DRAW):
            response_dict = {
                'status': 'DRAW',
                'board': transBoard,
                'x': m,'y': y
            }
            return json.dumps(response_dict)
        
        return json.dumps({'board': transBoard, 'x': m,'y': y})
## Define Player
class WhichPlayer(Enum):
    P1 = 1
    CPU = 2
## Define Status of game
class Status(Enum):
    WIN = 1
    aiWIN = 2
    DRAW = 0
    ONGOING = 3    
    aiONGOING = 4
## Last placed disc
def lastPlaced(board, move):
    move = move - 1
    row = board[move]
    y = 0
    for j in range(len(row) - 1, -1, -1):
        val = row[j]
        if val != 0:
            return j

    return 0

## Find all legal moves of a board
def legalMoves(board):
    arr = []
    for i, row in enumerate(board):
        for j, val in enumerate(row):
            if (val == 0):
                arr.append(i + 1)
                break
    return arr
## Prioritize playing in the middle
def weight(n, disc):
    if(n == 3):
        return 8 * disc
    elif(n == 2 or n == 4):
        return 4 * disc
    elif(n == 1 or n == 5):
        return 2 * disc
    else:
        return disc
## Checks if value is positive
def isPos(n):
    if(n > 0): 
        return True
    else: 
        return False
    
## Check board for horizontal wins
def checkRow(row, disc):
    count = 0
    for i, val in enumerate(row):
        if(count == 4):
            return True
        elif(val == 0):
            count = 0
        elif(isPos(val) == isPos(disc)):
            count+=1
        elif(isPos(val) != isPos(disc)):
            count = 0
    return count == 4

## Check for 4 in a column by iterating vertically
def checkCol(board, i, disc):
    count = 0
    for j in range(0,7):
        val = board[j][i]    
        if(count == 4):
            return True
        elif(val == 0):
            count = 0    
        elif(isPos(val) == isPos(disc)):
            count+=1
        elif(isPos(val) != isPos(disc)):
            count = 0
    return count == 4
## Check board for diagonal wins
def checkDiagonal(board, row, col, disc):
    def checkDirection(delta_row, delta_col):
        arr1, arr2 = [],[]
        i, j = row + delta_row, col + delta_col
        while 0 <= i < len(board) and 0 <= j < len(board[0]):
            arr1.append(board[i][j])
            i += delta_row
            j += delta_col
        # Check in the opposite direction
        i, j = row - delta_row, col - delta_col
        while 0 <= i < len(board) and 0 <= j < len(board[0]):
            arr2.append(board[i][j])
            i -= delta_row
            j -= delta_col
        return arr1, arr2
    (arr1, arr2) = checkDirection(1, 1)
    (arr3, arr4) = checkDirection(-1, 1)
    
    ## stitching arrays in one big array
    arr2 = arr2[::-1] 
    arr2.append(board[row][col])
    arr2.extend(arr1)
    
    arr3 = arr3[::-1] 
    arr3.append(board[row][col])
    arr3.extend(arr4)

    if(checkRow(arr2,disc) or checkRow(arr3,disc)):
        return True
    else:
        return False    
def checkPlayer(board, x, y, row):
    disc = 1
    ## check on current board if human wins
    if(checkRow(row, disc)):
        return (Status.WIN,board)
    elif(checkCol(board, y, disc)):
        return  (Status.WIN, board)
    elif(checkDiagonal(board, x, y, disc)):
        return  (Status.WIN, board)
    elif(len(legalMoves(board)) == 0):
        return (Status.DRAW,board)
    else:
        return (Status.ONGOING,board)
## Make the move on the board
def nextState(status, board, move):
    if(status == Status.aiONGOING):
        disc = -1
    elif(status == Status.ONGOING):
        disc = 1
    elif(status == Status.aiWIN):
        disc = -1
    elif(status == Status.WIN):
        disc = 1
    else:
        disc = 0
    row = board[move - 1]  

    for i, val in enumerate(row):
        if(val == 0):
            temp = weight(move - 1, disc)
            board[move - 1][i] = temp
            break
    if(checkRow(row, disc)):
        if(disc == 1):
            return (Status.WIN,board)
        else:
            return (Status.aiWIN,board)
    elif(checkCol(board, i, disc)):
        if(disc == 1):
            return (Status.WIN,board)
        else:
            return (Status.aiWIN,board)
    elif(checkDiagonal(board, move - 1, i, disc)):
        if(disc == 1):
            return (Status.WIN,board)
        else:
            return (Status.aiWIN,board)
    elif(disc == 1):
        return (Status.aiONGOING,board)
    elif(disc == -1):
        return (Status.ONGOING,board)
    if(len(legalMoves(board)) == 0):
        return (Status.DRAW,board)
    
    
## Check board for diagonal wins
def diagonalValue(board, row, col):
    def checkDirection(delta_row, delta_col):
        arr1, arr2 = [],[]
        i, j = row + delta_row, col + delta_col
        while 0 <= i < len(board) and 0 <= j < len(board[0]):
            arr1.append(board[i][j])
            i += delta_row
            j += delta_col
        # Check in the opposite direction
        i, j = row - delta_row, col - delta_col
        while 0 <= i < len(board) and 0 <= j < len(board[0]):
            arr2.append(board[i][j])
            i -= delta_row
            j -= delta_col
        return arr1, arr2
    (arr1, arr2) = checkDirection(1, 1)
    (arr3, arr4) = checkDirection(-1, 1)
    
    arr2 = arr2[::-1] 
    arr2.append(board[row][col])
    arr2.extend(arr1)
    
    arr3 = arr3[::-1] 
    arr3.append(board[row][col])
    arr3.extend(arr4)
    
    return (arr2, arr3)
def rowValue(lst, score, count, disc):
    for i, val in enumerate(lst):
        if(isPos(val) == isPos(disc)):
            count+=1
        else:
            count = 0
        if(count == 3):
            score += 9 * val
        elif(count == 2):
            score += 3 * val
        elif(count == 1):
            score += val
    return score

def iterate(board, disc):
    score = 0
    for i, row in enumerate(board):
        score+=rowValue(row, 0, 0, disc)
    return score
## AI Player
def estimateValue(status, board):
    if(status == Status.aiWIN):
        return -100
    elif(status == Status.WIN):
        return 100
    elif(status == Status.DRAW):
        return 0.
    else:
        i = 0
        j = 0
        diag1 = 0
        diag2 = 0
        while(i < 6 and j < 7):
            (l, r) = diagonalValue(board,i,j)
            diag1 = max(diag1, rowValue(l, 0,0,1))
            diag2 = max(diag2, rowValue(l, 0,0,-1))
            
            diag1 = max(diag1, rowValue(r, 0,0,1))
            diag2 = max(diag2, rowValue(r, 0,0,-1))
            j+=1
            i+=1
        row1 = iterate(board, 1)
        row2 = iterate(board, -1)    
        col1 = iterate(np.transpose(board), 1)
        col2 = iterate(np.transpose(board), -1)
        return max(diag1, max(row1 , col1)) + min(diag2, min(row2 , col2))
def minimax(status, board, depth):
    moves = legalMoves(board)
    stateLst = []
    for i, move in enumerate(moves):
        board_copy = copy.deepcopy(board)
        status_copy = copy.deepcopy(status)
        stateLst.append(nextState(status_copy, board_copy, move))
    if(depth == 0 or len(moves) == 0):
        return estimateValue(status, board)
    else:
        if(status == Status.aiWIN):
            return -100
        elif(status == Status.WIN):
            return 100
        elif(status == Status.DRAW):
            return 0.
        elif(status == Status.ONGOING):
            base = -1000
            for i, state in enumerate(stateLst):
                b = copy.deepcopy(state[1])
                s = copy.deepcopy(state[0])
                eval = minimax(s, b, depth - 1)
                if(eval > base):
                    base = eval
            return base
        elif(status == Status.aiONGOING):
            base = 1000
            for i, state in enumerate(stateLst):
                b = copy.deepcopy(state[1])
                s = copy.deepcopy(state[0])
                eval = minimax(s, b, depth - 1)
                if(eval < base):
                    base = eval
            return base
        
def bestMove(status, board, moveLst):
    maxValue = 100.
    ans = -1
    for i, move in enumerate(moveLst):
        board_copy = copy.deepcopy(board)
        status_copy = copy.deepcopy(status)
        (s, b) = nextState(status_copy, board_copy, move)
        eval = minimax(s,b,3)
        if(eval < maxValue):
            maxValue = eval
            ans = move
    return ans
    
if __name__ == "__main__":
    app.run(debug=True)