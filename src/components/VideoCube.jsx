import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import CubeObject from './CubeObject';

const VideoCube = () => {
  const handleFaceChange = (faceIndex) => {
    console.log('Active face changed to:', faceIndex);
  };

  return (
    <Canvas>
      <ambientLight intensity={1.0} />
      <CubeObject onFaceChange={handleFaceChange} />
    </Canvas>
  );
};

export default VideoCube;
