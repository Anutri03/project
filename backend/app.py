from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
import os
import logging
from enum import Enum
from flask import request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_session import Session  # Add this import

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///slido_clone.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True

# Initialize the Flask-Session
Session(app)

# Configure CORS with proper cookie handling
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:5173"],  # Add your frontend URL here
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# --- Models will go here ---

class PollType(Enum):
    MULTIPLE_CHOICE = 'multiple_choice'
    WORD_CLOUD = 'word_cloud'
    RATING = 'rating'
    OPEN_TEXT = 'open_text'
    QUIZ = 'quiz'
    RANKING = 'ranking'

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # hashed
    is_admin = db.Column(db.Boolean, default=False)

class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Use PollType.value
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    is_active = db.Column(db.Boolean, default=True)
    options = db.relationship('Option', backref='poll', lazy=True)
    votes = db.relationship('Vote', backref='poll', lazy=True)

class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)
    option_id = db.Column(db.Integer, db.ForeignKey('option.id'), nullable=True)  # For MC, ranking, etc.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Optional for anonymous
    value = db.Column(db.String(255), nullable=True)  # For open text, word cloud, rating, etc.

# --- Routes and SocketIO events will go here ---

# --- Authentication Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        logger.debug(f"Register request received: {data}")
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        hashed_pw = generate_password_hash(password)
        user = User(username=username, password=hashed_pw, is_admin=data.get('is_admin', True))
        db.session.add(user)
        db.session.commit()
        logger.info(f"User registered: {username}")
        return jsonify({'message': 'User registered successfully'})
    except Exception as e:
        logger.exception(f"Error in register: {str(e)}")
        return jsonify({'error': 'Server error during registration'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        logger.debug(f"Login request received: {data}")
        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            logger.warning(f"Login failed for username: {username}")
            return jsonify({'error': 'Invalid credentials'}), 401
        session['user_id'] = user.id
        session['is_admin'] = user.is_admin
        session['username'] = user.username
        logger.info(f"Login successful for: {username}")
        return jsonify({'message': 'Login successful', 'is_admin': user.is_admin, 'username': user.username})
    except Exception as e:
        logger.exception(f"Error in login: {str(e)}")
        return jsonify({'error': 'Server error during login'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        username = session.get('username')
        session.clear()
        logger.info(f"Logout successful for: {username}")
        return jsonify({'message': 'Logged out'})
    except Exception as e:
        logger.exception(f"Error in logout: {str(e)}")
        return jsonify({'error': 'Server error during logout'}), 500

# --- Added route to check authentication status ---
@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    try:
        if 'user_id' in session:
            return jsonify({
                'authenticated': True, 
                'is_admin': session.get('is_admin', False),
                'username': session.get('username')
            })
        return jsonify({'authenticated': False})
    except Exception as e:
        logger.exception(f"Error in auth_status: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

# --- Admin-only decorator ---
def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('user_id') or not session.get('is_admin'):
            return jsonify({'error': 'Admin login required'}), 403
        return f(*args, **kwargs)
    return decorated

# --- Poll Creation (Admin Only) ---
@app.route('/api/polls', methods=['POST'])
@admin_required
def create_poll():
    data = request.json
    question = data.get('question')
    poll_type = data.get('type')
    options = data.get('options', [])
    if not question or not poll_type:
        return jsonify({'error': 'Question and type required'}), 400
    poll = Poll(question=question, type=poll_type, created_by=session['user_id'])
    db.session.add(poll)
    db.session.commit()
    # Add options if applicable
    if poll_type in [PollType.MULTIPLE_CHOICE.value, PollType.QUIZ.value, PollType.RANKING.value, PollType.WORD_CLOUD.value]:
        for opt in options:
            option = Option(text=opt, poll_id=poll.id)
            db.session.add(option)
    db.session.commit()
    return jsonify({'message': 'Poll created', 'poll_id': poll.id})

# --- Get Poll Details (with options) ---
@app.route('/api/polls/<int:poll_id>', methods=['GET'])
def get_poll(poll_id):
    poll = Poll.query.get_or_404(poll_id)
    options = [
        {'id': opt.id, 'text': opt.text}
        for opt in poll.options
    ]
    return jsonify({
        'id': poll.id,
        'question': poll.question,
        'type': poll.type,
        'options': options,
        'is_active': poll.is_active
    })

# --- Vote on a Poll ---
@app.route('/api/polls/<int:poll_id>/vote', methods=['POST'])
def vote_poll(poll_id):
    poll = Poll.query.get_or_404(poll_id)
    data = request.json
    option_id = data.get('option_id')
    value = data.get('value')  # For open text, word cloud, rating, etc.
    user_id = session.get('user_id')  # Optional
    # Validate vote based on poll type
    if poll.type in [PollType.MULTIPLE_CHOICE.value, PollType.QUIZ.value, PollType.RANKING.value]:
        if not option_id:
            return jsonify({'error': 'Option ID required'}), 400
        option = Option.query.filter_by(id=option_id, poll_id=poll.id).first()
        if not option:
            return jsonify({'error': 'Invalid option'}), 400
        vote = Vote(poll_id=poll.id, option_id=option_id, user_id=user_id)
    elif poll.type == PollType.WORD_CLOUD.value:
        if not value:
            return jsonify({'error': 'Value required'}), 400
        vote = Vote(poll_id=poll.id, value=value, user_id=user_id)
    elif poll.type == PollType.RATING.value:
        if not value:
            return jsonify({'error': 'Rating value required'}), 400
        vote = Vote(poll_id=poll.id, value=value, user_id=user_id)
    elif poll.type == PollType.OPEN_TEXT.value:
        if not value:
            return jsonify({'error': 'Text value required'}), 400
        vote = Vote(poll_id=poll.id, value=value, user_id=user_id)
    else:
        return jsonify({'error': 'Unsupported poll type'}), 400
    db.session.add(vote)
    db.session.commit()
    # Emit real-time update
    socketio.emit('poll_update', get_poll_results_dict(poll.id), broadcast=True)
    return jsonify({'message': 'Vote recorded'})

# --- Get Poll Results ---
@app.route('/api/polls/<int:poll_id>/results', methods=['GET'])
def get_poll_results(poll_id):
    return jsonify(get_poll_results_dict(poll_id))

def get_poll_results_dict(poll_id):
    poll = Poll.query.get(poll_id)
    if not poll:
        return {'error': 'Poll not found'}
    results = {}
    if poll.type in [PollType.MULTIPLE_CHOICE.value, PollType.QUIZ.value, PollType.RANKING.value]:
        results = {opt.text: Vote.query.filter_by(poll_id=poll.id, option_id=opt.id).count() for opt in poll.options}
    elif poll.type == PollType.WORD_CLOUD.value:
        words = [v.value for v in poll.votes if v.value]
        results = {}
        for word in words:
            results[word] = results.get(word, 0) + 1
    elif poll.type == PollType.RATING.value:
        ratings = [int(v.value) for v in poll.votes if v.value and v.value.isdigit()]
        results = {
            'average': sum(ratings) / len(ratings) if ratings else 0,
            'count': len(ratings)
        }
    elif poll.type == PollType.OPEN_TEXT.value:
        results = [v.value for v in poll.votes if v.value]
    return {
        'poll_id': poll.id,
        'question': poll.question,
        'type': poll.type,
        'results': results
    }

# --- SocketIO event for joining poll room (optional, for scaling) ---
@socketio.on('join_poll')
def on_join_poll(data):
    poll_id = data.get('poll_id')
    if poll_id:
        from flask_socketio import join_room
        join_room(f'poll_{poll_id}')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True) 