import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight } from 'three';

export const Lights: React.FC = () => {
  const spotLightRef = useRef<SpotLight>(null);

  useFrame(({ clock }) => {
    if (spotLightRef.current) {
      spotLightRef.current.position.x = 10 + Math.sin(clock.getElapsedTime() * 0.2) * 5;
    }
  });

  return (
    <>
      {/* Lower ambient light for better contrast */}
      <ambientLight intensity={1.0} color="#ffffff" />
      
      {/* Main Key Light - Reduced intensity */}
      <spotLight
        ref={spotLightRef}
        position={[15, 20, 15]}
        angle={0.4}
        penumbra={0.5}
        intensity={100} 
        color="#fff5e6"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />

      {/* Fill Light */}
      <spotLight
        position={[-15, 10, -5]}
        angle={0.6}
        penumbra={1}
        intensity={60}
        color="#e6f0ff"
      />

      {/* Back/Rim Light */}
      <pointLight position={[0, 10, -10]} intensity={30} color="#ffffff" />
    </>
  );
};