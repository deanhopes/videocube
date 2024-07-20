import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Euler, Quaternion, Vector3 } from 'three';
import { useSpring, animated } from '@react-spring/three';

const FACE_IDS = {
  FRONT: 0,
  BACK: 1,
  LEFT: 2,
  RIGHT: 3,
  TOP: 4,
  BOTTOM: 5,
};

const faceColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

const CubeObject = ({ onFaceChange }) => {
  const meshRef = useRef();
  const { size, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState(new Euler(0, 0, 0));
  const [finalRotation, setFinalRotation] = useState(new Euler(0, 0, 0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeFace, setActiveFace] = useState(FACE_IDS.FRONT);

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 1, tension: 500, friction: 30 },
  }));

  const determineActiveFace = useCallback((rotation) => {
    const faceNormals = [
      new Vector3(0, 0, 1), // front
      new Vector3(0, 0, -1), // back
      new Vector3(-1, 0, 0), // left
      new Vector3(1, 0, 0), // right
      new Vector3(0, 1, 0), // top
      new Vector3(0, -1, 0), // bottom
    ];

    let maxDot = -Infinity;
    let activeFace = FACE_IDS.FRONT;

    faceNormals.forEach((normal, index) => {
      const rotatedNormal = normal
        .clone()
        .applyQuaternion(new Quaternion().setFromEuler(rotation));
      const dot = rotatedNormal.dot(new Vector3(0, 0, -1));

      if (dot > maxDot) {
        maxDot = dot;
        activeFace = index;
      }
    });

    return activeFace;
  }, []);

  const snapToNearestFace = useCallback((rotation) => {
    return new Euler(
      Math.round(rotation.x / (Math.PI / 2)) * (Math.PI / 2),
      Math.round(rotation.y / (Math.PI / 2)) * (Math.PI / 2),
      Math.round(rotation.z / (Math.PI / 2)) * (Math.PI / 2)
    );
  }, []);

  const onPointerDown = useCallback(
    (event) => {
      if (isAnimating) return;

      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      setCurrentRotation(new Euler().copy(meshRef.current.rotation));
    },
    [isAnimating]
  );

  const onPointerMove = useCallback(
    (event) => {
      if (!isDragging || !meshRef.current || isAnimating) return;

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      const newRotation = new Euler(
        currentRotation.x - deltaY * 0.0005,
        currentRotation.y - deltaX * 0.0005,
        currentRotation.z
      );

      meshRef.current.rotation.copy(newRotation);
      setCurrentRotation(newRotation);

      const newActiveFace = determineActiveFace(newRotation);
      if (newActiveFace !== activeFace) {
        setActiveFace(newActiveFace);
        onFaceChange(newActiveFace);
      }
    },
    [
      isDragging,
      dragStart,
      currentRotation,
      onFaceChange,
      activeFace,
      determineActiveFace,
      isAnimating,
    ]
  );

  const onPointerUp = useCallback(() => {
    if (isAnimating) return;

    setIsDragging(false);
    if (meshRef.current) {
      const snappedRotation = snapToNearestFace(currentRotation);
      setIsAnimating(true);

      api.start({
        from: {
          rotation: [currentRotation.x, currentRotation.y, currentRotation.z],
        },
        to: {
          rotation: [snappedRotation.x, snappedRotation.y, snappedRotation.z],
        },
        onRest: () => {
          setFinalRotation(snappedRotation);
          setIsAnimating(false);
          const finalActiveFace = determineActiveFace(snappedRotation);
          if (finalActiveFace !== activeFace) {
            setActiveFace(finalActiveFace);
            onFaceChange(finalActiveFace);
          }
        },
      });
    }
  }, [
    api,
    currentRotation,
    onFaceChange,
    activeFace,
    determineActiveFace,
    snapToNearestFace,
    isAnimating,
  ]);

  useEffect(() => {
    const handleWindowMouseMove = (event) => {
      if (isDragging) {
        onPointerMove(event);
      }
    };

    const handleWindowMouseUp = () => {
      if (isDragging) {
        onPointerUp();
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, onPointerMove, onPointerUp]);

  useEffect(() => {
    if (!isAnimating && meshRef.current) {
      meshRef.current.rotation.copy(finalRotation);
    }
  }, [isAnimating, finalRotation]);

  return (
    <animated.mesh
      ref={meshRef}
      rotation={spring.rotation}
      onPointerDown={onPointerDown}
    >
      <boxGeometry args={[2, 2, 2]} />
      {faceColors.map((color, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          color={color}
        />
      ))}
    </animated.mesh>
  );
};

const App = () => {
  const handleFaceChange = (faceIndex) => {
    console.log('Active face changed to:', faceIndex);
  };

  return (
    <Canvas>
      <ambientLight intensity={1.0} />
      {/* <pointLight position={[0, 0, 110]} /> */}
      <CubeObject onFaceChange={handleFaceChange} />
    </Canvas>
  );
};

export default App;
