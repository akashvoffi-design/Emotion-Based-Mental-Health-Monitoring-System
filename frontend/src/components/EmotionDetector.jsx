import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Video, Loader2, ShieldCheck } from 'lucide-react';
import { emotionAPI } from '../services/api';

const EmotionDetector = ({ onEmotionDetected }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: 'user',
  };

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      // Convert base64 to blob
      const res = await fetch(imageSrc);
      const blob = await res.blob();

      // Send to API
      const response = await emotionAPI.detect(blob);
      const data = response.data;

      if (onEmotionDetected) {
        onEmotionDetected(data);
      }
    } catch (error) {
      console.error('Emotion detection error:', error);
      if (onEmotionDetected) {
        onEmotionDetected({
          error: error.response?.data?.error || 'Failed to detect emotion. Please try again.',
        });
      }
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, onEmotionDetected]);

  return (
    <div className="card h-full flex flex-col">
      {/* Webcam Feed */}
      <div className="webcam-container relative flex-1 min-h-[280px] bg-dark-900 rounded-2xl overflow-hidden">
        {/* Live badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-dark-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="live-dot"></span>
          <span className="text-xs font-semibold text-white tracking-wider">LIVE</span>
        </div>

        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={() => setCameraReady(true)}
          onUserMediaError={() => setCameraReady(false)}
          className="w-full h-full object-cover"
          mirrored
        />

        {!cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900">
            <Video className="w-12 h-12 text-dark-600 mb-3" />
            <p className="text-dark-500 text-sm">Connecting to camera...</p>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <div className="mt-4 space-y-3">
        <button
          onClick={handleCapture}
          disabled={isCapturing || !cameraReady}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
          id="capture-emotion-btn"
        >
          {isCapturing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>Capture Emotion</span>
            </>
          )}
        </button>

        {/* Video toggle hint */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            No facial images are stored. Only emotion labels and scores are saved.
          </p>
          <button className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-800 transition-all">
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;
