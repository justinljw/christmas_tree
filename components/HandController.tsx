import React, { useEffect, useRef, useState } from 'react';

// Declaration for global MediaPipe objects loaded via script tags
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

interface HandControllerProps {
  onGesture: (gesture: 'OPEN' | 'CLOSED') => void;
  enabled: boolean;
}

export const HandController: React.FC<HandControllerProps> = ({ onGesture, enabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const lastGestureRef = useRef<'OPEN' | 'CLOSED' | null>(null);
  const gestureFramesRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    let camera: any = null;
    let hands: any = null;

    const onResults = (results: any) => {
      // No drawing logic anymore, just pure data processing
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          
          // --- Improved Gesture Recognition Logic ---
          // Determine if hand is Open or Closed based on finger extension.
          // 0: Wrist
          // Tips: 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
          // PIPs (Middle Joint): 6, 10, 14, 18
          // MCPs (Base Joint): 5, 9, 13, 17
          
          let fingersOpen = 0;
          
          // Helper: Check if finger is extended
          // Logic: If Tip is further from wrist than the PIP (Middle Joint), it is OPEN.
          // This is much more sensitive than comparing to MCP.
          const isFingerExtended = (tipIdx: number, pipIdx: number) => {
            const tip = landmarks[tipIdx];
            const pip = landmarks[pipIdx];
            const wrist = landmarks[0];
            
            // Calculate distance to wrist
            const tipDist = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
            const pipDist = Math.sqrt(Math.pow(pip.x - wrist.x, 2) + Math.pow(pip.y - wrist.y, 2));
            
            // If tip is further out than the middle knuckle, consider it open
            return tipDist > pipDist;
          };

          if (isFingerExtended(8, 6)) fingersOpen++;   // Index
          if (isFingerExtended(12, 10)) fingersOpen++;  // Middle
          if (isFingerExtended(16, 14)) fingersOpen++; // Ring
          if (isFingerExtended(20, 18)) fingersOpen++; // Pinky
          
          // Ignore thumb for robustness in simple open/close detection

          // Threshold: 
          // If 3 or more fingers are extended -> OPEN (Unwrap)
          // Otherwise -> CLOSED (Wrap) - This allows for loose fists to trigger 'Wrap' easily
          const currentGesture = fingersOpen >= 3 ? 'OPEN' : 'CLOSED';

          // Debounce logic: Reduced frame count for higher sensitivity
          // Only requires 2 consecutive frames (approx 60-100ms) to trigger
          if (currentGesture === lastGestureRef.current) {
            gestureFramesRef.current++;
          } else {
            gestureFramesRef.current = 0;
            lastGestureRef.current = currentGesture;
          }

          if (gestureFramesRef.current > 2) {
             onGesture(currentGesture);
             setStatus(currentGesture === 'OPEN' ? 'OPEN (Unwrap)' : 'FIST (Wrap)');
          } else {
             // Show immediate feedback even before debounce triggers
             setStatus(currentGesture === 'OPEN' ? 'Detecting: Open...' : 'Detecting: Fist...');
          }
        }
      } else {
        setStatus('Show Hand');
      }
    };

    if (window.Hands && window.Camera) {
      hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.4, 
      });

      hands.onResults(onResults);

      if (videoRef.current) {
        camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if(videoRef.current) await hands.send({ image: videoRef.current });
          },
          width: 320,
          height: 240,
        });
        camera.start();
      }
    }

    return () => {
        // Cleanup
        if (camera) camera.stop();
        if (hands) hands.close();
    };
  }, [enabled, onGesture]);

  if (!enabled) return null;

  return (
    <div className="absolute bottom-20 right-4 z-50 flex flex-col items-end pointer-events-none">
       {/* Status Label */}
       <div className="mb-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-white font-['Montserrat'] text-[10px] tracking-widest border border-yellow-600/50 shadow-lg transition-all duration-300">
          STATUS: {status}
       </div>
       
       {/* Hidden video element required for MediaPipe processing */}
       {/* Opacity 0 and tiny size ensures it's in DOM but invisible, ensuring Camera utils can still attach stream */}
       <video 
         ref={videoRef} 
         className="absolute opacity-0 pointer-events-none" 
         style={{ width: '1px', height: '1px' }} 
         playsInline 
       />
       
       <p className="mt-1 text-gray-400 text-[9px] font-['Montserrat'] bg-white/80 px-1 shadow-sm">
          OPEN: UNWRAP | FIST: WRAP
       </p>
    </div>
  );
};