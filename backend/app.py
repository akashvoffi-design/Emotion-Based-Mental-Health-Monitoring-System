import os
import io
import cv2
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from supabase import create_client, Client
from tensorflow.keras.models import load_model

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_fallback_super_secret_jwt_key')
jwt = JWTManager(app)

# Supabase Client setup
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_ANON_KEY')
supabase: Client = None
if not supabase_url or not supabase_key:
    print("WARNING: Supabase credentials not found in environment variables.")
else:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase client initialized.")
    except Exception as e:
        print(f"WARNING: Could not initialize Supabase client: {e}")

# Emotion Model Setup
# Labels match the notebook mapper: {0:'anger',1:'disgust',2:'fear',3:'happiness',4:'sadness',5:'surprise',6:'neutral'}
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
EMOTION_SCORES = {
    'Angry': -1, 'Disgust': -1, 'Fear': -1,
    'Happy': 2, 'Sad': -2, 'Surprise': 1, 'Neutral': 0
}

# Try loading Face cascade and model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
model = None
try:
    model_path = os.path.join(os.path.dirname(__file__), 'ai_model', 'emotion_vgg19.h5')
    if os.path.exists(model_path):
        model = load_model(model_path)
        print("Emotion model loaded successfully.")
    else:
        print(f"WARNING: VGG19 Emotion model not found at {model_path}.")
except Exception as e:
    print(f"Error loading model: {e}")

# ==========================================
# AUTH ENDPOINTS
# ==========================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    # FIX #2: Guard against supabase not being configured
    if not supabase:
        return jsonify({"error": "Database not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY."}), 503

    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Sign up user with Supabase
        res = supabase.auth.sign_up({"email": email, "password": password})
        if res.user:
            user_id = str(res.user.id)  # FIX #3: Cast to str for JWT serialization
            
            # Additional users table insertion mapping
            try:
                supabase.table('users').insert({
                    "id": user_id,
                    "name": name,
                    "email": email
                }).execute()
            except Exception as insert_err:
                print("Note: Could not insert into users table:", insert_err)
            
            # Create token
            access_token = create_access_token(identity=user_id)
            return jsonify({
                "message": "User created successfully",
                "access_token": access_token,
                "user_id": user_id,
                "name": name,
                "email": email
            }), 201
        
        return jsonify({"error": "Failed to create user"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    # FIX #2: Guard against supabase not being configured
    if not supabase:
        return jsonify({"error": "Database not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY."}), 503

    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.user:
            user_id = str(res.user.id)  # FIX #3: Cast to str for JWT serialization
            
            # Fetch user info
            name = ""
            try:
                user_data = supabase.table('users').select('name').eq('id', user_id).execute()
                if user_data.data:
                    name = user_data.data[0].get('name', '')
            except:
                pass

            access_token = create_access_token(identity=user_id)
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "user_id": user_id,
                "name": name,
                "email": email
            }), 200
            
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        if "Invalid login credentials" in str(e):
             return jsonify({"error": "Invalid credentials"}), 401
        return jsonify({"error": str(e)}), 400

# ==========================================
# EMOTION ENDPOINTS
# ==========================================

@app.route('/api/emotion/detect', methods=['POST'])
@jwt_required()
def detect_emotion():
    # FIX #2: Guard against supabase not being configured
    if not supabase:
        return jsonify({"error": "Database not configured."}), 503

    if not model:
        # Fallback simulation if model isn't loaded
        import random
        user_id = get_jwt_identity()
        simulated_emotion = random.choice(EMOTION_LABELS)
        simulated_conf = round(random.uniform(0.65, 0.98), 2)
        score = EMOTION_SCORES[simulated_emotion]
        
        # Save to DB
        try:
            supabase.table('emotions').insert({
                "user_id": user_id,
                "emotion": simulated_emotion,
                "confidence": simulated_conf
            }).execute()
        except Exception as e:
            print("DB insert error:", e)
            
        # Simulated "All emotions"
        sims = {lbl: random.uniform(0.01, 0.1) for lbl in EMOTION_LABELS if lbl != simulated_emotion}
        sims[simulated_emotion] = simulated_conf
        
        return jsonify({
            "emotion": simulated_emotion,
            "confidence": simulated_conf,
            "emotion_score": score,
            "all_emotions": sims,
            "warning": "Model not loaded. Using simulated data."
        }), 200

    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        user_id = get_jwt_identity()
        
        # Read image
        in_memory_file = io.BytesIO()
        file.save(in_memory_file)
        data = np.frombuffer(in_memory_file.getvalue(), dtype=np.uint8)
        img = cv2.imdecode(data, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Invalid image format"}), 400

        # Preprocessing
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return jsonify({"error": "No face detected"}), 400

        # For simplicity, take the first/largest face
        (x, y, w, h) = faces[0]
        face_roi = gray[y:y+h, x:x+w]  # Grayscale ROI

        # FIX #1 (CORRECTED): The notebook uses 48x48 converted GRAY→RGB
        # model.predict(sample_img.reshape(1, 48, 48, 3)) — confirmed from notebook line 1714
        resized_face = cv2.resize(face_roi, (48, 48))
        # Convert grayscale to 3-channel RGB (notebook does cv2.COLOR_GRAY2RGB)
        rgb_face = cv2.cvtColor(resized_face, cv2.COLOR_GRAY2RGB)
        normalized_face = rgb_face / 255.0
        reshaped_face = np.reshape(normalized_face, (1, 48, 48, 3))

        # Prediction
        prediction = model.predict(reshaped_face)[0]
        max_idx = np.argmax(prediction)
        detected_emotion = EMOTION_LABELS[max_idx]
        confidence = float(prediction[max_idx])
        score = EMOTION_SCORES[detected_emotion]

        all_emotions_dict = {EMOTION_LABELS[i]: float(prediction[i]) for i in range(len(EMOTION_LABELS))}

        # Save to database
        try:
            supabase.table('emotions').insert({
                "user_id": user_id,
                "emotion": detected_emotion,
                "confidence": confidence
            }).execute()
        except Exception as db_err:
            print("Warning: Failed to log emotion to database:", db_err)

        return jsonify({
            "emotion": detected_emotion,
            "confidence": confidence,
            "emotion_score": score,
            "all_emotions": all_emotions_dict
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/emotion/history', methods=['GET'])
@jwt_required()
def get_history():
    # FIX #2: Guard against supabase not being configured
    if not supabase:
        return jsonify({"error": "Database not configured."}), 503
    try:
        user_id = get_jwt_identity()
        days = int(request.args.get('days', 7))
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()

        response = supabase.table('emotions') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('timestamp', cutoff_date) \
            .order('timestamp') \
            .execute()

        return jsonify(response.data), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/emotion/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    # FIX #2: Guard against supabase not being configured
    if not supabase:
        return jsonify({"error": "Database not configured."}), 503
    try:
        user_id = get_jwt_identity()
        days = int(request.args.get('days', 7))
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()

        response = supabase.table('emotions') \
            .select('emotion') \
            .eq('user_id', user_id) \
            .gte('timestamp', cutoff_date) \
            .execute()

        data = response.data
        if not data:
            return jsonify({
                "emotion_count": {},
                "average_emotion_score": 0,
                "mental_health_index": 50,
                "total_entries": 0
            }), 200

        emotion_counts = {}
        total_score = 0
        total_entries = len(data)

        for item in data:
            em = item.get('emotion')
            score = EMOTION_SCORES.get(em, 0)
            
            emotion_counts[em] = emotion_counts.get(em, 0) + 1
            total_score += score

        avg_score = total_score / total_entries
        # Mental Health Index Formula: (average_emotion_score + 2) / 4 * 100
        mhi = ((avg_score + 2) / 4) * 100

        return jsonify({
            "emotion_count": emotion_counts,
            "average_emotion_score": round(avg_score, 2),
            "mental_health_index": min(max(round(mhi, 1), 0), 100), # Cap 0-100
            "total_entries": total_entries
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
