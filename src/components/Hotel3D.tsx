import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const HotelBuilding: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Building */}
      <Box args={[4, 6, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Roof */}
      <Box args={[4.2, 0.5, 3.2]} position={[0, 3.25, 0]}>
        <meshStandardMaterial color="#D2691E" />
      </Box>
      
      {/* Windows */}
      {Array.from({ length: 12 }).map((_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        return (
          <Box
            key={i}
            args={[0.3, 0.4, 0.1]}
            position={[
              -1.5 + col * 1,
              -2 + row * 1.5,
              1.55
            ]}
          >
            <meshStandardMaterial color="#87CEEB" emissive="#4169E1" emissiveIntensity={0.2} />
          </Box>
        );
      })}
      
      {/* Entrance */}
      <Box args={[1, 2, 0.2]} position={[0, -2, 1.6]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Entrance Roof */}
      <Box args={[1.5, 0.2, 0.5]} position={[0, -0.9, 1.7]}>
        <meshStandardMaterial color="#D2691E" />
      </Box>
      
      {/* Side Buildings */}
      <Box args={[2, 4, 2]} position={[-3, -1, 0]}>
        <meshStandardMaterial color="#A0522D" />
      </Box>
      
      <Box args={[2, 4, 2]} position={[3, -1, 0]}>
        <meshStandardMaterial color="#A0522D" />
      </Box>
      
      {/* Palm Trees */}
      <Cylinder args={[0.1, 0.1, 2]} position={[-5, -2, 2]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      <Sphere args={[0.8]} position={[-5, -0.5, 2]}>
        <meshStandardMaterial color="#228B22" />
      </Sphere>
      
      <Cylinder args={[0.1, 0.1, 2]} position={[5, -2, -2]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      <Sphere args={[0.8]} position={[5, -0.5, -2]}>
        <meshStandardMaterial color="#228B22" />
      </Sphere>
    </group>
  );
};

const Hotel3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 4, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <HotelBuilding />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Hotel3D;