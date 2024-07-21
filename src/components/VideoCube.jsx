import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import CubeObject from './CubeObject';

const VideoCube = () => {
  const handleFaceChange = (faceIndex) => {
    console.log('Active face changed to:', faceIndex);
  };

  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 8] }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.5} />
      <spotLight
        intensity={0.5}
        angle={0.1}
        penumbra={1}
        position={[10, 10, 10]}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <CubeObject position={[0, 0.5, 0]} onFaceChange={handleFaceChange} />

      <color attach="background" args={['#2d2d2d']} />

      <Environment preset="city" />

      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.2}
        scale={5}
        blur={2.5}
        far={4}
        resolution={512}
        color="#000000"
      />
    </Canvas>
  );
};

export default VideoCube;
