const wellnessSuggestions = {
  Sad: {
    tips: [
      'Try a 5-minute deep breathing exercise',
      'Write in your journal about how you feel',
      'Take a short walk outside in nature',
      'Listen to uplifting music that you enjoy',
      'Talk to a trusted friend or family member',
      'Practice gratitude — list 3 things you appreciate',
    ],
    resources: [
      { name: 'National Mental Health Helpline', note: 'Available 24/7' },
      { name: 'iCall Psychosocial Helpline', note: '9152987821' },
    ],
  },
  Angry: {
    tips: [
      'Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s',
      'Take a 10-minute break from screens',
      'Try progressive muscle relaxation',
      'Listen to calming music or nature sounds',
      'Write down what triggered this feeling',
      'Splash cold water on your face to reset',
    ],
    resources: [],
  },
  Fear: {
    tips: [
      'Ground yourself: name 5 things you can see, 4 you can touch',
      'Practice slow breathing to calm your nervous system',
      'Write down what is worrying you',
      'Reach out to someone you trust',
      'Try the 5-4-3-2-1 sensory grounding technique',
    ],
    resources: [],
  },
  Disgust: {
    tips: [
      'Step away from the triggering situation if possible',
      'Take a few deep cleansing breaths',
      'Drink some water and refocus your mind',
      'Try a brief mindfulness body scan exercise',
    ],
    resources: [],
  },
  Happy: {
    tips: [
      'Great mood! Consider journaling this positive energy ✨',
      'Share your positivity with someone today',
      'This is a great time for creative work',
      'Savor this moment — practice mindful appreciation',
      'Set a new goal while your energy is high',
    ],
    resources: [],
  },
  Neutral: {
    tips: [
      'Check in with yourself — how are you really feeling?',
      'A short mindfulness exercise could boost your energy',
      'Try something creative or learn something new',
      'Take a moment to stretch and move your body',
    ],
    resources: [],
  },
  Surprise: {
    tips: [
      'Take a moment to process what surprised you',
      'Write about this experience in your journal',
      'Share this surprising moment with someone',
      'Reflect on how this makes you feel overall',
    ],
    resources: [],
  },
};

export const getWellnessSuggestions = (emotion) => {
  return wellnessSuggestions[emotion] || wellnessSuggestions.Neutral;
};

export const getRandomTips = (emotion, count = 2) => {
  const data = getWellnessSuggestions(emotion);
  const shuffled = [...data.tips].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default wellnessSuggestions;
