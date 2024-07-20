import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import CubeObject from './CubeObject';
import { motion, AnimatePresence } from 'framer-motion';

const faceTexts = ['Front', 'Right', 'Back', 'Left', 'Top', 'Bottom'];
const backgroundColors = [
  '#ffcccc',
  '#ccffcc',
  '#ccccff',
  '#ffffcc',
  '#ffccff',
  '#ccffff',
];

const VideoCube = () => {
  const [currentFace, setCurrentFace] = useState(0);

  const handleFaceChange = (newFace) => {
    console.log('Active face changed to:', newFace);
    setCurrentFace(newFace);
  };

  return (
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      animate={{ backgroundColor: backgroundColors[currentFace] }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <Canvas camera={{ position: [0, 0, 1.5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <CubeObject onFaceChange={handleFaceChange} />
      </Canvas>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFace}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {faceTexts[currentFace]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoCube;
