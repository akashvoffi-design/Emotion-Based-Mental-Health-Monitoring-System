# 🧠 MindPulse — Emotion-Based Mental Health Monitoring System

> **v3.0.0** · Full-Stack AI Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15%2B-FF6F00?logo=tensorflow)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)

MindPulse is a real-time, AI-powered mental health companion that detects facial emotions via webcam using a VGG19 deep learning model, tracks your mood over time with rich analytics, and provides a compassionate AI voice companion powered by Google Gemini.

> [!WARNING]
> MindPulse is for **personal mood tracking only**. It is **NOT** a medical diagnostic tool and should not replace professional mental health care.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Facial Emotion Detection** | Real-time webcam emotion recognition using a fine-tuned VGG19 model trained on FER2013 |
| 📊 **Analytics Dashboard** | Mood trends, MHI score gauge, emotion bar charts, and donut distribution charts |
| 🎙️ **AI Voice Companion** | Hands-free voice conversation with Google Gemini — speak and it replies by voice |
| 🧘 **Breathing Room** | Interactive guided breathing exercises (4-7-8, Box, Deep) with animated circle + 5-4-3-2-1 grounding |
| 🎵 **Ambient Soundscape** | Built-in Web Audio synthesized ambient tones (Ocean, Focus, Forest, Warmth) |
| ✨ **Emotion-Responsive UI** | Subtle ambient background glow shifts to match your detected emotional state |
| 🧠 **AI Weekly Insights** | Gemini analyzes your week's emotional data and provides personalized mental health digest |
| 🏆 **Wellness Streaks** | Gamified streak tracking, growth visualization (Seed→Forest), activity grid, and badges |
| 📔 **Journal** | Write mood journal entries with emotion tagging |
| 📡 **Live Tracking** | Continuous real-time webcam face and emotion stream with clean statistical side panels |
| 🗂️ **Emotion History** | 7/14/30-day emotion history stored securely in Supabase |
| 🌙 **Dark / Light Mode** | Fully themed UI with smooth transitions |
| 🔐 **JWT Authentication** | Secure login, signup, and protected routes |
| 📤 **Export to CSV** | Download your emotion data for external analysis |
| 🖥️ **Enhanced Navigation** | Collapsible sidebar, seamless account switching, and intuitive confirmation modals |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) | UI framework & build tool |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Recharts](https://recharts.org/) | Analytics charts |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP API client |
| Web Speech API | Browser-native voice recognition & synthesis |

### Backend
| Technology | Purpose |
|---|---|
| [Python 3.10+](https://python.org) | Runtime |
| [Flask 3.0](https://flask.palletsprojects.com/) | REST API framework |
| [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/) | Authentication tokens |
| [Flask-CORS](https://flask-cors.readthedocs.io/) | Cross-origin resource sharing |
| [TensorFlow / Keras 2.15+](https://tensorflow.org) | VGG19 emotion model inference |
| [OpenCV (cv2)](https://opencv.org/) | Face detection & image processing |
| [Google Generative AI](https://ai.google.dev/) | Gemini AI for voice companion |
| [Supabase Python SDK](https://supabase.com/docs/reference/python) | Database & auth client |
| [Gunicorn](https://gunicorn.org/) | Production WSGI server |
| [python-dotenv](https://github.com/theskumar/python-dotenv) | Environment variable management |

### Database & Cloud
| Service | Purpose |
|---|---|
| [Supabase](https://supabase.com) | PostgreSQL database + user auth storage |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── ai_model/
│   │   ├── emotion_vgg19.h5        # VGG19 trained model (download separately)
│   │   └── model.yaml              # Model architecture config
│   ├── app.py                      # Main Flask API server
│   ├── requirements.txt            # Python dependencies
│   ├── Procfile                    # Gunicorn production entry
│   └── runtime.txt                 # Python version pin
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Collapsible left sidebar
│   │   │   ├── EmotionDetector.jsx # Webcam + emotion capture
│   │   │   ├── Chart.jsx           # Recharts wrappers
│   │   │   ├── JournalEntry.jsx    # Journal card component
│   │   │   ├── ThemeToggle.jsx     # Dark/light switcher
│   │   │   └── WellnessSuggestion.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global auth state
│   │   │   └── ThemeContext.jsx    # Global theme state
│   │   │   └── EmotionAmbientContext.jsx # Emotion-responsive UI glow
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── LiveTracking.jsx
│   │   │   ├── VoiceAgent.jsx      # AI voice companion
│   │   │   ├── BreathingRoom.jsx   # Guided breathing exercises
│   │   │   ├── WeeklyInsights.jsx  # AI-powered weekly report
│   │   │   ├── Streaks.jsx         # Gamification & streaks
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Global styles + design tokens
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── facial-emotion-recognition-vgg19-fer2013.ipynb  # Model training notebook
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A free [Supabase](https://supabase.com) account
- A free [Google AI Studio](https://aistudio.google.com/) API key

---

### Step 1 — Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following schema:

```sql
-- Users table
create table public.users (
  id uuid primary key references auth.users(id),
  name text,
  email text unique not null,
  created_at timestamptz default now()
);

-- Emotions table
create table public.emotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  emotion text not null,
  confidence float,
  timestamp timestamptz default now()
);

-- Journal entries table
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text,
  content text not null,
  emotion text,
  mood_score int,
  created_at timestamptz default now()
);
```

3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

---

### Step 2 — AI Model Setup

1. Visit the [Kaggle model page](https://www.kaggle.com/code/enesztrk/facial-emotion-recognition-vgg19-fer2013)
2. Download `emotion_vgg19.h5`
3. Place it at `backend/ai_model/emotion_vgg19.h5`

> [!NOTE]
> If the model file is missing, the backend automatically falls back to **simulated emotion data** so you can still test the UI.

---

### Step 3 — Environment Variables

**`backend/.env`**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET_KEY=your-random-secret-key-here
GEMINI_API_KEY=your-google-gemini-api-key
```

**`frontend/.env.local`**
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### Step 4 — Run the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```
Backend runs at → `http://localhost:5000`

---

### Step 5 — Run the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs at → `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT token |

### Emotion Detection
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/emotion/detect` | ✅ JWT | Detect emotion from an uploaded image |
| `POST` | `/api/emotion/detect_live` | ✅ JWT | Detect emotion from live webcam frame |
| `GET` | `/api/emotion/history` | ✅ JWT | Get emotion history (query: `?days=7`) |
| `GET` | `/api/emotion/analytics` | ✅ JWT | Get analytics summary (query: `?days=7`) |

### Voice Agent
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/voice_agent` | ✅ JWT | Send a message, receive a Gemini AI reply |

### Weekly Insights
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/weekly_insights` | ✅ JWT | Generate AI-powered weekly mental health digest |

---

## 🧬 Emotion Labels & Scoring

The model classifies faces into 7 emotions:

| Emotion | Score | Mental Health Impact |
|---|---|---|
| 😊 Happy | `+2` | Positive |
| 😮 Surprise | `+1` | Neutral/Positive |
| 😐 Neutral | `0` | Neutral |
| 😠 Angry | `-1` | Negative |
| 🤢 Disgust | `-1` | Negative |
| 😨 Fear | `-1` | Negative |
| 😢 Sad | `-2` | Most Negative |

**Mental Health Index (MHI):** `((avg_score + 2) / 4) × 100` → clamped to 0–100

---

## 🔒 Security & Privacy

- Passwords are handled entirely by **Supabase Auth** (bcrypt hashed, never stored raw)
- No facial images are stored — only the **emotion label** and **confidence score**
- All data is user-isolated via `user_id` foreign keys
- JWT tokens expire and are cleared on logout
- `.env` files are gitignored — **never commit your API keys**

---

## 📦 Deployment

### Backend (e.g. Render / Railway)
- Use `Procfile`: `web: gunicorn app:app`
- Set all environment variables in the platform dashboard
- Python version is pinned in `runtime.txt`

### Frontend (e.g. Vercel / Netlify)
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your deployed backend URL

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Akash** · [GitHub](https://github.com/akashvoffi-design)

> Built with ❤️ as part of the MLFED (Machine Learning Frontend & Emotion Detection) project.
=======
