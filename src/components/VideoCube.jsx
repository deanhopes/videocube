import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import CubeObject from './CubeObject';

const faceTexts = ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'];

const AnimatedText = animated(Text);

const VideoCube = () => {
  const [activeFace, setActiveFace] = useState(0);
  const [textSpring, textApi] = useSpring(() => ({
    position: [0, 2, 2],
    scale: [1, 1, 1],
    opacity: 1,
    config: { mass: 2, tension: 440, friction: 40 },
  }));

  const handleFaceChange = useCallback(
    (faceIndex) => {
      console.log('Active face changed to:', faceIndex);
      setActiveFace(faceIndex);
      textApi.start({
        from: { position: [0, 2, 2], scale: [0.5, 0.5, 0.5], opacity: 0 },
        to: { position: [0, 2, 2], scale: [1, 1, 1], opacity: 1 },
      });
    },
    [textApi]
  );

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 12] }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.2} />
      <spotLight
        intensity={1}
        angle={0.1}
        penumbra={1}
        position={[5, 5, 5]}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <CubeObject position={[0, 1, 0]} onFaceChange={handleFaceChange} />

      <AnimatedText
        position={textSpring.position}
        scale={textSpring.scale}
        opacity={textSpring.opacity}
        color="white"
        fontSize={0.5}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
      >
        {faceTexts[activeFace]}
      </AnimatedText>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      <color attach="background" args={['#2d2d2d']} />

      <Environment preset="city" />

      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={3}
        resolution={256}
        color="#000000"
      />
    </Canvas>
  );
};

export default VideoCube;
