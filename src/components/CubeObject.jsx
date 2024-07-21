import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { Euler, Quaternion, Vector3, MeshBasicMaterial } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { Box, useVideoTexture, Html } from '@react-three/drei';
import { CUBE_FACES } from './cubeFaceData';

const CubeObject = ({ onFaceChange }) => {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState(new Euler(0, 0, 0));
  const [finalRotation, setFinalRotation] = useState(new Euler(0, 0, 0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeFace, setActiveFace] = useState(0);

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 1, tension: 500, friction: 30 },
  }));

  // Create video textures using useVideoTexture for each face
  const frontTexture = useVideoTexture(CUBE_FACES.FRONT.videoSource, {
    start: true,
    loop: true,
    muted: true,
  });
  const backTexture = useVideoTexture(CUBE_FACES.BACK.videoSource, {
    start: true,
    loop: true,
    muted: true,
  });
  const leftTexture = useVideoTexture(CUBE_FACES.LEFT.videoSource, {
    start: true,
    loop: true,
    muted: true,
  });
  const rightTexture = useVideoTexture(CUBE_FACES.RIGHT.videoSource, {
    start: true,
    loop: true,
    muted: true,
  });
  const topTexture = useVideoTexture(CUBE_FACES.TOP.videoSource, {
    start: true,
    loop: true,
    muted: true,
  });
  const bottomTexture = useVideoTexture(CUBE_FACES.BOTTOM.videoSource, {
    start: true,
    loop: true,
    muted: true,
  });

  // Create materials using the video textures
  const materials = useMemo(
    () => [
      new MeshBasicMaterial({ map: rightTexture }),
      new MeshBasicMaterial({ map: leftTexture }),
      new MeshBasicMaterial({ map: topTexture }),
      new MeshBasicMaterial({ map: bottomTexture }),
      new MeshBasicMaterial({ map: frontTexture }),
      new MeshBasicMaterial({ map: backTexture }),
    ],
    [
      rightTexture,
      leftTexture,
      topTexture,
      bottomTexture,
      frontTexture,
      backTexture,
    ]
  );

  const determineActiveFace = useCallback((rotation) => {
    const faceNormals = [
      new Vector3(1, 0, 0), // right
      new Vector3(-1, 0, 0), // left
      new Vector3(0, 1, 0), // top
      new Vector3(0, -1, 0), // bottom
      new Vector3(0, 0, 1), // front
      new Vector3(0, 0, -1), // back
    ];

    let maxDot = -Infinity;
    let activeFace = 0;

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

    console.log('Determined active face:', activeFace);
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
      console.log('Pointer down at:', event.clientX, event.clientY);
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
      console.log('Pointer move. New rotation:', newRotation);

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
    console.log('Pointer up');
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
          console.log(
            'Animation rest. Final rotation:',
            snappedRotation,
            'Final active face:',
            finalActiveFace
          );
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
      <Box args={[2, 2, 2]} material={materials} />
      {/* Add face indicators using Html component from drei */}
      <Html occlude position={[1.01, 0, 0]} center>
        <button
          style={{
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            opacity: '0.4',
            whiteSpace: 'nowrap', // Ensure no line wrap
            transition:
              'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            userSelect: 'none', // Prevent text selection
          }}
          onPointerEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.background = 'rgba(0, 0, 0, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onPointerLeave={(e) => {
            e.target.style.opacity = '0.4';
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          View Project
        </button>
      </Html>
      <Html occlude position={[-1.01, 0, 0]} center>
        <button
          style={{
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            opacity: '0.4',
            whiteSpace: 'nowrap', // Ensure no line wrap
            transition:
              'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            userSelect: 'none', // Prevent text selection
          }}
          onPointerEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.background = 'rgba(0, 0, 0, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onPointerLeave={(e) => {
            e.target.style.opacity = '0.4';
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          View Project
        </button>
      </Html>
      <Html occlude position={[0, 1.01, 0]} center>
        <button
          style={{
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            opacity: '0.4',
            whiteSpace: 'nowrap', // Ensure no line wrap
            transition:
              'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            userSelect: 'none', // Prevent text selection
          }}
          onPointerEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.background = 'rgba(0, 0, 0, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onPointerLeave={(e) => {
            e.target.style.opacity = '0.4';
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          View Project
        </button>
      </Html>
      <Html occlude position={[0, -1.01, 0]} center>
        <button
          style={{
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            opacity: '0.4',
            whiteSpace: 'nowrap', // Ensure no line wrap
            transition:
              'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            userSelect: 'none', // Prevent text selection
          }}
          onPointerEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.background = 'rgba(0, 0, 0, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onPointerLeave={(e) => {
            e.target.style.opacity = '0.4';
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          View Project
        </button>
      </Html>
      <Html occlude position={[0, 0, 1.01]} center>
        <button
          style={{
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            opacity: '0.4',
            whiteSpace: 'nowrap', // Ensure no line wrap
            transition:
              'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            userSelect: 'none', // Prevent text selection
          }}
          onPointerEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.background = 'rgba(0, 0, 0, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onPointerLeave={(e) => {
            e.target.style.opacity = '0.4';
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          View Project
        </button>
      </Html>
      <Html occlude position={[0, 0, -1.01]} center>
        <button
          style={{
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            opacity: '0.4',
            whiteSpace: 'nowrap', // Ensure no line wrap
            transition:
              'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            userSelect: 'none', // Prevent text selection
          }}
          onPointerEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.background = 'rgba(0, 0, 0, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onPointerLeave={(e) => {
            e.target.style.opacity = '0.4';
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          View Project
        </button>
      </Html>
    </animated.mesh>
  );
};

export default CubeObject;
