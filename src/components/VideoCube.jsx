import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import CubeObject from './CubeObject';
import { CUBE_FACES } from './cubeFaceData';

const AnimatedText = animated(Text);

const VideoCube = () => {
  const [activeFace, setActiveFace] = useState(5);
  const [textSpring, textApi] = useSpring(() => ({
    position: [0, 1.2, 4],
    scale: [1.2, 1.2, 1.2],
    opacity: 1,
    config: { mass: 2, tension: 800, friction: 40 },
  }));

  const handleFaceChange = useCallback(
    (faceIndex) => {
      console.log('Active face changed to:', faceIndex);
      setActiveFace(faceIndex);
      textApi.start({
        from: { position: [0, 1.2, 4], scale: [0.8, 0.8, 0.8], opacity: 0 },
        to: { position: [0, 1.2, 4], scale: [1.2, 1.2, 1.2], opacity: 1 },
      });
    },
    [textApi]
  );

  const faceTitles = Object.values(CUBE_FACES).map((face) => face.title);

  // useEffect(() => {
  //   console.log(
  //     'Current active face:',
  //     activeFace,
  //     'Title:',
  //     faceTitles[activeFace]
  //   );
  // }, [activeFace, faceTitles]);

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 10] }} dpr={[1, 1.5]}>
      {/* <ambientLight intensity={0} /> */}

      <Suspense fallback={<Html center>Loading...</Html>}>
        <CubeObject onFaceChange={handleFaceChange} />
      </Suspense>

      <AnimatedText
        position={textSpring.position}
        scale={textSpring.scale}
        opacity={textSpring.opacity}
        color="white"
        fontSize={0.5}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={-0.02}
        textAlign="center"
        font="src/assets/NHaasGroteskDSPro-55Rg.otf"
        anchorX="center"
        anchorY="middle"
      >
        {faceTitles[activeFace]}
      </AnimatedText>

      <color attach="background" args={['#131313']} />

      <Environment preset="studio" />

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
