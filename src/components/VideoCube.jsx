import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import CubeObject from './CubeObject';
import { CUBE_FACES } from './cubeFaceData';

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
        from: { position: [0, 2, 2], scale: [0.8, 0.8, 0.8], opacity: 0 },
        to: { position: [0, 2, 2], scale: [1, 1, 1], opacity: 1 },
      });
    },
    [textApi]
  );

  const faceTitles = Object.values(CUBE_FACES).map((face) => face.title);

  useEffect(() => {
    console.log(
      'Current active face:',
      activeFace,
      'Title:',
      faceTitles[activeFace]
    );
  }, [activeFace, faceTitles]);

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 12] }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.2} />
      <spotLight
        intensity={1}
        angle={0.8}
        penumbra={1}
        position={[0, 0, 5]}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <Suspense fallback={<Html center>Loading...</Html>}>
        <CubeObject position={[0, 0, 0]} onFaceChange={handleFaceChange} />
      </Suspense>

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
        font="src/assets/NHaasGroteskDSPro-55Rg.otf"
        anchorX="center"
        anchorY="middle"
      >
        {faceTitles[activeFace]}
      </AnimatedText>

      {/* <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.4} />
      </mesh> */}

      <color attach="background" args={['#131313']} />

      <Environment preset="city" />

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={1.0}
        scale={20}
        blur={2}
        far={3}
        resolution={256}
        color="#000000"
      />
    </Canvas>
  );
};

export default VideoCube;
