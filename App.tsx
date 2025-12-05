import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sparkles, Loader } from '@react-three/drei';
import { LuxuryTree } from './components/Tree';
import { Lights } from './components/Lights';
import { PostProcessing } from './components/PostProcessing';
import { Overlay } from './components/Overlay';
import { HandController } from './components/HandController';
import { COLORS } from './constants';

interface SceneProps {
  isAssembled: boolean;
}

const SceneContent: React.FC<SceneProps> = ({ isAssembled }) => {
  return (
    <>
      <color attach="background" args={[COLORS.BG_DARK]} />
      
      {/* Cinematic Lighting Setup */}
      <Lights />
      
      {/* Studio Lighting Environment - Reduced Intensity */}
      <Environment preset="studio" environmentIntensity={0.5} />
      
      {/* The Hero Asset */}
      <LuxuryTree isAssembled={isAssembled} />

      {/* Floating Particles */}
      <Sparkles 
        count={80} 
        scale={15} 
        size={3} 
        speed={0.4} 
        opacity={0.4} 
        color={COLORS.GOLD_METALLIC} 
      />

      {/* Soft Contact Shadows */}
      <ContactShadows 
        opacity={0.4} 
        scale={30} 
        blur={2.5} 
        far={10} 
        resolution={512} 
        color="#000000" 
      />

      {/* Camera Interactions */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
        minDistance={8}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={isAssembled ? 0.5 : 0.1}
      />

      {/* VFX */}
      <PostProcessing />
    </>
  );
};

const App: React.FC = () => {
  const [isAssembled, setIsAssembled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Callback to handle gestures from HandController
  const handleGesture = useCallback((gesture: 'OPEN' | 'CLOSED') => {
    // Open hand = Unwrap (scatter) = isAssembled false
    // Closed hand (Fist) = Wrap (assemble) = isAssembled true
    if (gesture === 'OPEN') {
      setIsAssembled(false);
    } else if (gesture === 'CLOSED') {
      setIsAssembled(true);
    }
  }, []);

  return (
    <>
      <Overlay 
        isAssembled={isAssembled} 
        onToggle={() => setIsAssembled(prev => !prev)} 
        cameraEnabled={cameraEnabled}
        setCameraEnabled={setCameraEnabled}
      />
      
      <HandController enabled={cameraEnabled} onGesture={handleGesture} />

      <div className="w-full h-full absolute top-0 left-0 bg-white">
        <Canvas
          shadows
          dpr={[1, 2]} // Quality scaling for high DPI screens
          camera={{ position: [0, 4, 18], fov: 40 }}
          gl={{ 
            antialias: true,
            stencil: false,
            powerPreference: "high-performance",
            toneMappingExposure: 1.0 
          }}
        >
          <Suspense fallback={null}>
            <SceneContent isAssembled={isAssembled} />
          </Suspense>
        </Canvas>
        <Loader 
          containerStyles={{ background: '#ffffff' }}
          innerStyles={{ background: '#f0f0f0', height: '2px' }}
          barStyles={{ background: '#CDA434', height: '2px' }}
          dataInterpolation={(p) => `Wrapping Gifts... ${p.toFixed(0)}%`}
          dataStyles={{ color: '#CDA434', fontFamily: 'Montserrat', fontSize: '10px', letterSpacing: '0.2em' }}
        />
      </div>
    </>
  );
};

export default App;