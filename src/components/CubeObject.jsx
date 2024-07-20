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

  const { camera } = useThree();

  const faceNormals = [
    new Vector3(0, 0, 1), // front
    new Vector3(1, 0, 0), // right
    new Vector3(0, 0, -1), // back
    new Vector3(-1, 0, 0), // left
    new Vector3(0, 1, 0), // top
    new Vector3(0, -1, 0), // bottom
  ];

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  const rotateAroundWorldAxis = (object, axis, radians) => {
    const rotWorldMatrix = new Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    object.quaternion.premultiply(
      new Quaternion().setFromRotationMatrix(rotWorldMatrix)
    );
  };

  const onPointerDown = useCallback((event) => {
    isDragging.current = true;
    event.target.setPointerCapture(event.pointerId);
    setDragStart({ x: event.clientX, y: event.clientY });
    currentRotation.current.copy(meshRef.current.rotation);
    console.log('Pointer Down', { x: event.clientX, y: event.clientY });
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

      if (axis === 'y') {
        rotationAxis.current.set(0, 1, 0); // Rotate around Y-axis
      } else {
        rotationAxis.current.set(1, 0, 0); // Rotate around X-axis
      }

      rotateAroundWorldAxis(
        meshRef.current,
        rotationAxis.current,
        rotationAmount
      );

      setDragStart({ x: event.clientX, y: event.clientY });
      currentRotation.current.copy(meshRef.current.rotation);
      console.log('Pointer Move', { x: event.clientX, y: event.clientY });
    },
    [dragStart]
  );

  const onPointerUp = useCallback(
    (event) => {
      if (isDragging.current) {
        isDragging.current = false;
        event.target.releasePointerCapture(event.pointerId);
        console.log('Pointer Up', { x: event.clientX, y: event.clientY });

        // Determine the new active face using the cube's rotation
        let maxDot = -Infinity;
        let newActiveFace = 0;

        faceNormals.forEach((normal, index) => {
          const rotatedNormal = normal
            .clone()
            .applyQuaternion(meshRef.current.quaternion);
          const dot = rotatedNormal.dot(new Vector3(0, 0, -1)); // Use cube's local forward direction
          if (dot > maxDot) {
            maxDot = dot;
            newActiveFace = index;
          }
        });

        setActiveFace(newActiveFace);

        // Snaps the cube's rotation to the nearest 90-degree angle
        const snappedRotation = new Euler(
          Math.round(meshRef.current.rotation.x / (Math.PI / 2)) *
            (Math.PI / 2),
          Math.round(meshRef.current.rotation.y / (Math.PI / 2)) *
            (Math.PI / 2),
          Math.round(meshRef.current.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
        );

        // Animate the cube to the snapped rotation
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

        console.log(`Active face changed to: ${newActiveFace}`);
      }
    },
    [onFaceChange, api, faceNormals]
  );

  // Update the mesh's rotation every frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = spring.rotation.get()[0];
      meshRef.current.rotation.y = spring.rotation.get()[1];
      meshRef.current.rotation.z = spring.rotation.get()[2];
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
          emissiveIntensity={0.3}
          toneMapped={false}
        />
      ))}
    </animated.mesh>
  );
};

export default CubeObject;
