import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, SCENE_CONFIG, ANIMATION } from '../constants';

// --- Helper Functions ---

const randomVector = (r: number) => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// --- Sub-Components ---

// 1. Gifts with Ribbons
const Gifts: React.FC<{ isAssembled: boolean }> = ({ isAssembled }) => {
  const count = 200; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ribbon1Ref = useRef<THREE.InstancedMesh>(null); // Ribbon Band 1
  const ribbon2Ref = useRef<THREE.InstancedMesh>(null); // Ribbon Band 2
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate colors for boxes
  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [COLORS.RUBY_DEEP, COLORS.EMERALD_DEEP, COLORS.GOLD_METALLIC, COLORS.BLUE_ROYAL, COLORS.PURPLE_DEEP];
    for(let i=0; i<count; i++) {
        const col = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
        // Add some variation
        col.offsetHSL(0, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);
        col.toArray(c, i*3);
    }
    return c;
  }, [count]);

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Tree: Phyllotaxis-ish but biased towards bottom and inside
      const t = Math.pow(Math.random(), 0.5); 
      const height = SCENE_CONFIG.TREE_HEIGHT;
      const rMax = t * SCENE_CONFIG.BASE_RADIUS;
      const r = rMax * (0.5 + Math.random() * 0.5); 
      const theta = Math.random() * Math.PI * 2;
      
      const treePos = new THREE.Vector3(
        r * Math.cos(theta),
        (1 - t) * height - height/2 + 2, 
        r * Math.sin(theta)
      );

      // Gifts are heavy, scatter low
      const scatterPos = randomVector(SCENE_CONFIG.SCATTER_RADIUS * 0.7);
      scatterPos.y -= 8;

      return { 
        treePos, 
        scatterPos, 
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI),
        scale: 0.5 + Math.random() * 0.7, 
        speedOffset: Math.random() 
      };
    });
  }, []);

  const progress = useRef(isAssembled ? 1 : 0);

  useEffect(() => {
     if(meshRef.current) {
         for(let i=0; i<count; i++) {
             meshRef.current.setColorAt(i, new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2]));
         }
         meshRef.current.instanceColor!.needsUpdate = true;
     }
     // Ribbons are always gold/metallic, no per-instance color needed (uses material color)
  }, [colors]);

  useFrame((state) => {
    if(!meshRef.current || !ribbon1Ref.current || !ribbon2Ref.current) return;
    const target = isAssembled ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, ANIMATION.MORPH_SPEED * 0.6);
    const ease = progress.current * progress.current * (3 - 2 * progress.current);

    data.forEach((d, i) => {
      dummy.position.lerpVectors(d.scatterPos, d.treePos, ease);
      
      // Idle float
      dummy.position.y += Math.sin(state.clock.elapsedTime * 0.5 + d.speedOffset) * 0.03;
      
      // Rotation
      if (progress.current < 0.9) {
          dummy.rotation.x = d.rotation.x + state.clock.elapsedTime * 0.2;
          dummy.rotation.z = d.rotation.z + state.clock.elapsedTime * 0.2;
      }
      dummy.rotation.y = d.rotation.y + state.clock.elapsedTime * 0.1;

      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      
      // Apply to all three meshes
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      ribbon1Ref.current!.setMatrixAt(i, dummy.matrix);
      ribbon2Ref.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    ribbon1Ref.current.instanceMatrix.needsUpdate = true;
    ribbon2Ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. The Box (Wrapping Paper) - Matte/Satin */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.6} // Less glossy, more like paper
          metalness={0.1}
        />
      </instancedMesh>
      
      {/* 2. Ribbon Band 1 (Vertical loop) - Shiny Gold */}
      <instancedMesh ref={ribbon1Ref} args={[undefined, undefined, count]}>
        <boxGeometry args={[1.02, 1.02, 0.2]} /> {/* Slightly larger than box to wrap it */}
        <meshStandardMaterial 
          color={COLORS.GOLD_METALLIC}
          roughness={0.2} 
          metalness={1.0}
        />
      </instancedMesh>

      {/* 3. Ribbon Band 2 (Horizontal loop) - Shiny Gold */}
      <instancedMesh ref={ribbon2Ref} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.2, 1.02, 1.02]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_METALLIC}
          roughness={0.2} 
          metalness={1.0}
        />
      </instancedMesh>
    </group>
  );
};

// 2. Light Ornaments: Baubles (Spheres)
const Baubles: React.FC<{ isAssembled: boolean }> = ({ isAssembled }) => {
  const count = 700;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [COLORS.GOLD_METALLIC, COLORS.RUBY_DEEP, COLORS.EMERALD_LIGHT, COLORS.SILVER_PALE, COLORS.BLUE_ROYAL];
    for(let i=0; i<count; i++) {
        const col = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
        col.toArray(c, i*3);
    }
    return c;
  }, [count]);

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const t = i / count; 
      const height = SCENE_CONFIG.TREE_HEIGHT;
      const y = (1 - t) * height - height/2 + 2;
      const rBase = t * SCENE_CONFIG.BASE_RADIUS;
      const r = rBase + (Math.random() - 0.5) * 0.5;
      const phi = i * 2.39996;
      const theta = phi; 
      
      const treePos = new THREE.Vector3(
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
      );
      
      const scatterPos = randomVector(SCENE_CONFIG.SCATTER_RADIUS);
      
      return { 
        treePos, 
        scatterPos, 
        scale: 0.2 + Math.random() * 0.4, 
        phase: Math.random() * Math.PI 
      };
    });
  }, []);

  const progress = useRef(isAssembled ? 1 : 0);

  useEffect(() => {
     if(meshRef.current) {
         for(let i=0; i<count; i++) {
             meshRef.current.setColorAt(i, new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2]));
         }
         meshRef.current.instanceColor!.needsUpdate = true;
     }
  }, [colors]);

  useFrame((state) => {
    if(!meshRef.current) return;
    const target = isAssembled ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, ANIMATION.MORPH_SPEED);
    const ease = progress.current * progress.current * (3 - 2 * progress.current);

    data.forEach((d, i) => {
      dummy.position.lerpVectors(d.scatterPos, d.treePos, ease);
      if (progress.current < 0.99) {
        dummy.position.y += Math.sin(state.clock.elapsedTime + d.phase) * 0.05;
      }
      dummy.rotation.set(state.clock.elapsedTime * 0.5, d.phase, 0);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      {/* Reduce roughness for baubles, but keep metalness high */}
      <meshPhysicalMaterial 
        roughness={0.2}
        metalness={0.8}
        clearcoat={0.8}
        envMapIntensity={1.0}
      />
    </instancedMesh>
  );
};

// 3. Topper
const Topper: React.FC<{ isAssembled: boolean }> = ({ isAssembled }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const targetY = isAssembled ? (SCENE_CONFIG.TREE_HEIGHT / 2) + 2.8 : 15;
      const targetScale = isAssembled ? 1.5 : 0;
      
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.04);
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.04);
      groupRef.current.scale.setScalar(s);
      groupRef.current.rotation.y -= 0.01;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 10, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial 
          color={COLORS.GOLD_METALLIC}
          emissive={COLORS.GLOW_WARM}
          emissiveIntensity={1} // Reduced emissive
          roughness={0.2}
          metalness={1} 
        />
      </mesh>
       <mesh scale={0.6} rotation={[0, Math.PI/4, 0]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial 
          color={COLORS.GOLD_METALLIC}
          metalness={1}
          roughness={0.2} 
        />
      </mesh>
    </group>
  );
};

// 4. Floor Shadow
const Floor: React.FC<{ isAssembled: boolean }> = ({ isAssembled }) => {
     return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -SCENE_CONFIG.TREE_HEIGHT/2 + 1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.1} color="#000000" />
        </mesh>
    )
}

export const LuxuryTree: React.FC<{ isAssembled: boolean }> = ({ isAssembled }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      <Gifts isAssembled={isAssembled} />
      <Baubles isAssembled={isAssembled} />
      <Topper isAssembled={isAssembled} />
      <Floor isAssembled={isAssembled} />
    </group>
  );
};