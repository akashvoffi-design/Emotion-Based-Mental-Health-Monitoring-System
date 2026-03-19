# MindPulse - Emotion-Based Mental Health Monitoring System
v1.0.0

A full-stack, AI-powered web application that detects facial emotions via webcam using a VGG19 deep learning model, tracks mood over time, and provides mental wellness suggestions. 

> [!WARNING]
> This application is for personal mood tracking only. It is NOT a medical diagnostic tool.

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a free account at [Supabase](https://supabase.com)
2. Run the SQL schema found in the app specifications to initialize your tables (`users`, `emotions`, `journal_entries`).
3. Set your project URL and Anon keys in both `.env` (backend) and `.env.local` (frontend).

### 2. AI Model Setup
1. Visit [Kaggle: Facial Emotion Recognition VGG19](https://www.kaggle.com/code/enesztrk/facial-emotion-recognition-vgg19-fer2013)
2. Download the model file (`emotion_vgg19.h5`).
3. Place this file inside `backend/ai_model/emotion_vgg19.h5`

### 3. Frontend Running
```bash
cd frontend
npm install
npm run dev
```

### 4. Backend Running
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python app.py
```

## Features Implemented
- **Frontend**: Full responsive dark-theme design matching specifications using Vite, React 18, and Tailwind. Custom CSS animations and responsive sidebar logic. Protected routes properly established.
- **Charts**: Comprehensive Recharts configurations for Mental Health Score gauges, trendlines, bars, and donut charts.
- **Backend**: Complete Python Flask server with Supabase interactions, Auth logic through Flask-JWT, Pycv2 and tensorflow keras model loading for webcam screenshot interpretation.

