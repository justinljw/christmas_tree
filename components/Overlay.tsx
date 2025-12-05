import React from 'react';

interface OverlayProps {
  isAssembled: boolean;
  onToggle: () => void;
  cameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ isAssembled, onToggle, cameraEnabled, setCameraEnabled }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-start space-y-2 pointer-events-auto">
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 drop-shadow-sm tracking-tighter italic">
          Arix Signature
        </h1>
        <p className="font-['Montserrat'] text-gray-500 text-xs md:text-sm tracking-[0.3em] uppercase ml-1">
          Justin's Christmas Collection 2025
        </p>
        
        {/* Camera Toggle */}
        <button 
          onClick={() => setCameraEnabled(!cameraEnabled)}
          className={`mt-4 flex items-center space-x-2 px-4 py-2 text-[10px] font-bold tracking-widest border transition-all duration-300 ${
            cameraEnabled 
              ? 'bg-red-500/10 border-red-500 text-red-600 hover:bg-red-500/20' 
              : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{cameraEnabled ? 'DISABLE GESTURES' : 'ENABLE GESTURES'}</span>
        </button>
      </header>

      {/* Footer / Controls */}
      <footer className="flex justify-between items-end w-full">
        <div className="flex flex-col space-y-4">
           
           {/* INTERACTIVE BUTTON */}
           <button 
             onClick={onToggle}
             className="pointer-events-auto group relative overflow-hidden rounded-none border border-gray-300 bg-white/60 px-8 py-3 backdrop-blur-md transition-all duration-500 hover:border-yellow-600 hover:bg-white/90 shadow-lg"
           >
             <span className={`font-['Montserrat'] text-xs font-bold tracking-[0.3em] text-gray-800 transition-opacity duration-500 ${isAssembled ? 'opacity-100' : 'opacity-50'}`}>
                {isAssembled ? 'UNWRAP' : 'WRAP'}
             </span>
             {/* Hover Glow */}
             <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
           </button>

           <div className="flex flex-col space-y-1">
             <div className="w-12 h-[1px] bg-gray-400 mb-2"></div>
             <p className="font-['Montserrat'] text-gray-400 text-[10px] md:text-xs tracking-widest">
               DRAG TO ORBIT • SCROLL TO ZOOM
             </p>
           </div>
        </div>
        
        <div className="text-right pointer-events-auto">
           <p className="font-['Playfair_Display'] text-2xl text-gray-800">The Gift Tree</p>
           <p className="font-['Montserrat'] text-gray-400 text-[10px] uppercase mt-1">Interactive 3D Experience</p>
        </div>
      </footer>
    </div>
  );
};