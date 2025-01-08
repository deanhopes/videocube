import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import CubeObject from './CubeObject';
import '../styles/HeroSection.css';

const AnimatedText = animated(Text);

const HeroSection = () => {
  const [activeFace, setActiveFace] = useState(0);
  const [textSpring, textApi] = useSpring(() => ({
    position: [0, 2, 4],
    scale: [1.2, 1.2, 1.2],
    opacity: 1,
    config: { mass: 2, tension: 800, friction: 40 },
  }));

  const handleFaceChange = useCallback(
    (faceIndex) => {
      setActiveFace(faceIndex);
      textApi.start({
        from: { position: [0, 2, 4], scale: [0.8, 0.8, 0.8], opacity: 0 },
        to: { position: [0, 2, 4], scale: [1.2, 1.2, 1.2], opacity: 1 },
      });
    },
    [textApi]
  );

  const mentalHealthAspects = [
    'Toothbrush',
    'Activity',
    'Waterproof',
    'NothingOS',
    'Tap Tap',
    'Pencil',
  ];

  return (
    <div className="hero-section">
      <div className="hero-3d-element">
        <Canvas shadows camera={{ fov: 35, position: [0, 0, 12] }} dpr={[1, 1.5]}>
          <Suspense fallback={<Html center>Loading...</Html>}>
            <CubeObject onFaceChange={handleFaceChange} scale={1.5} />
          </Suspense>

          <AnimatedText
            position={textSpring.position}
            scale={textSpring.scale}
            opacity={textSpring.opacity}
            color="white"
            fontSize={0.4}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={-0.02}
            textAlign="center"
            font="src/assets/NHaasGroteskDSPro-55Rg.otf"
            anchorX="center"
            anchorY="middle"
          >
            {mentalHealthAspects[activeFace]}
          </AnimatedText>

          <color attach="background" args={['#1a1a1a']} />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.8}
            scale={20}
            blur={2}
            far={3}
            resolution={256}
            color="#000000"
          />
        </Canvas>
      </div>
    </div>
  );
};

export default HeroSection;