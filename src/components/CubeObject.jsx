import React, { useRef, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Euler, Matrix4 } from 'three';
import { useSpring, animated } from '@react-spring/three';

const faceColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

const CubeObject = ({ onFaceChange }) => {
  const meshRef = useRef();
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const rotationAxis = useRef(new Vector3());
  const currentRotation = useRef(new Euler());
  const [activeFace, setActiveFace] = useState(0);

  const faceNormals = [
    new Vector3(0, 0, 1),
    new Vector3(1, 0, 0),
    new Vector3(0, 0, -1),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
  ];

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  const rotateAroundWorldAxis = (object, axis, radians) => {
    const rotWorldMatrix = new Matrix4().makeRotationAxis(
      axis.normalize(),
      radians
    );
    object.quaternion.premultiply(
      new Quaternion().setFromRotationMatrix(rotWorldMatrix)
    );
  };

  const onPointerDown = useCallback((event) => {
    isDragging.current = true;
    event.target.setPointerCapture(event.pointerId);
    setDragStart({ x: event.clientX, y: event.clientY });
    currentRotation.current.copy(meshRef.current.rotation);
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      if (!isDragging.current || !meshRef.current) return;

      const dragX = event.clientX - dragStart.x;
      const dragY = event.clientY - dragStart.y;
      const rotationSensitivity = 0.01;
      const axis = Math.abs(dragX) > Math.abs(dragY) ? 'y' : 'x';
      const sign = Math.abs(dragX) > Math.abs(dragY) ? dragX : dragY;
      const rotationAmount = sign * rotationSensitivity;

      rotationAxis.current.set(axis === 'y' ? 0 : 1, axis === 'y' ? 1 : 0, 0);
      rotateAroundWorldAxis(
        meshRef.current,
        rotationAxis.current,
        rotationAmount
      );

      setDragStart({ x: event.clientX, y: event.clientY });
      currentRotation.current.copy(meshRef.current.rotation);
    },
    [dragStart]
  );

  const onPointerUp = useCallback(
    (event) => {
      if (isDragging.current) {
        isDragging.current = false;
        event.target.releasePointerCapture(event.pointerId);

        let maxDot = -Infinity;
        let newActiveFace = 0;

        faceNormals.forEach((normal, index) => {
          const rotatedNormal = normal
            .clone()
            .applyQuaternion(meshRef.current.quaternion);
          const dot = rotatedNormal.dot(new Vector3(0, 0, -1));
          if (dot > maxDot) {
            maxDot = dot;
            newActiveFace = index;
          }
        });

        setActiveFace(newActiveFace);

        const snappedRotation = new Euler(
          Math.round(meshRef.current.rotation.x / (Math.PI / 2)) *
            (Math.PI / 2),
          Math.round(meshRef.current.rotation.y / (Math.PI / 2)) *
            (Math.PI / 2),
          Math.round(meshRef.current.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
        );

        api.start({
          rotation: [snappedRotation.x, snappedRotation.y, snappedRotation.z],
          from: {
            rotation: [
              meshRef.current.rotation.x,
              meshRef.current.rotation.y,
              meshRef.current.rotation.z,
            ],
          },
          onRest: () => onFaceChange(newActiveFace),
        });
      }
    },
    [onFaceChange, api, faceNormals]
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.set(...spring.rotation.get());
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <boxGeometry args={[1, 1, 1]} />
      {faceColors.map((color, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      ))}
    </animated.mesh>
  );
};

export default CubeObject;
