import React, { useRef, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Euler, Matrix4 } from 'three';
import { useSpring, animated } from '@react-spring/three';

const faceColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

const CubeObject = ({ onFaceChange }) => {
  const meshRef = useRef();
  const isDragging = useRef(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [activeFace, setActiveFace] = useState(0);

  const { camera, size } = useThree();

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
    config: { mass: 1, tension: 280, friction: 20 },
  }));

  const rotateAroundWorldAxis = useCallback((object, axis, radians) => {
    const rotWorldMatrix = new Matrix4().makeRotationAxis(
      axis.normalize(),
      radians
    );
    object.quaternion.premultiply(
      new Quaternion().setFromRotationMatrix(rotWorldMatrix)
    );
  }, []);

  const onPointerDown = useCallback((event) => {
    isDragging.current = true;
    mousePosition.current = { x: event.clientX, y: event.clientY };
    event.target.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      snapToNearestFace();
    }
  }, []);

  const snapToNearestFace = useCallback(() => {
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
      Math.round(meshRef.current.rotation.x / (Math.PI / 2)) * (Math.PI / 2),
      Math.round(meshRef.current.rotation.y / (Math.PI / 2)) * (Math.PI / 2),
      Math.round(meshRef.current.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
    );

    api.start({
      rotation: [snappedRotation.x, snappedRotation.y, snappedRotation.z],
      config: { tension: 300, friction: 40 },
      onRest: () => onFaceChange(newActiveFace),
    });
  }, [api, onFaceChange, faceNormals]);

  useFrame((state, delta) => {
    if (meshRef.current && isDragging.current) {
      // Calculate the center of the screen
      const centerX = size.width / 2;
      const centerY = size.height / 2;

      // Calculate the mouse position relative to the center
      const relativeX = (mousePosition.current.x - centerX) / centerX;
      const relativeY = (mousePosition.current.y - centerY) / centerY;

      // Calculate rotation speed based on distance from center
      const rotationSpeed = 0.05; // Adjust this value to control rotation speed
      const rotationX = -relativeY * rotationSpeed;
      const rotationY = relativeX * rotationSpeed;

      // Apply rotation
      rotateAroundWorldAxis(meshRef.current, new Vector3(1, 0, 0), rotationX);
      rotateAroundWorldAxis(meshRef.current, new Vector3(0, 1, 0), rotationY);
    } else if (!isDragging.current) {
      // Use spring animation when not dragging
      meshRef.current.rotation.set(...spring.rotation.get());
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerUp}
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
