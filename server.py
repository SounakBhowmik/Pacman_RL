from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

def random_move():
    return random.choice([1, 2, 3, 4])

@app.route('/get_moves', methods=['POST'])
def get_moves():
    # Log received data
    data = request.json
    print("Received data:", data)
    
    # Generate random moves
    pacman_move = random_move()
    ghost_moves = [random_move() for _ in range(4)]
    
    # Construct response
    response = {
        'pacmanMove': pacman_move,
        'ghostMoves': ghost_moves
    }
    print("Constructed command:", response)  # Print the constructed command
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=False)  # Set debug to False to avoid using watchdog
