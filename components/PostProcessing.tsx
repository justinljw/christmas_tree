import React from 'react';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export const PostProcessing: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      {/* Bloom - Reduced intensity and increased threshold to reduce overall glare */}
      <Bloom 
        luminanceThreshold={1.1} // Only things brighter than pure white glow
        mipmapBlur 
        intensity={0.6} // Reduced from 1.5
        radius={0.6}
      />
      
      {/* Vignette - Slightly softer */}
      <Vignette eskil={false} offset={0.1} darkness={0.6} />
      
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
};