import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { pourState } from '../state/canState';

/**
 * Individual Ice Cube with floating, buoyancy, and bobbing physics
 */
function IceCube({ config, material }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Glass parameters
    const height = 2.4;
    const baseThickness = 0.28;
    const liquidMaxHeight = 2.05;
    const liquidBottomY = -height / 2 + baseThickness;

    // Current liquid surface inside the glass
    const level = pourState.liquidLevel || 0;
    const currentSurfaceY = liquidBottomY + level * liquidMaxHeight;

    // Natural buoyant floating:
    // If liquid surface reaches the cube, the cube bobs on the surface
    const submerged = currentSurfaceY > config.restY + config.size / 2;
    const bob = submerged ? Math.sin(time * config.bobSpeed + config.phase) * 0.035 : 0;
    
    // When floating, target Y is slightly submerged below the liquid surface
    const targetY = submerged
      ? THREE.MathUtils.clamp(currentSurfaceY - config.buoyancy, config.restY, currentSurfaceY - 0.04) + bob
      : config.restY;

    // Smooth vertical position lerp
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 4, 0.016);
    meshRef.current.position.x = config.x + (submerged ? Math.sin(time * 1.2 + config.phase) * 0.015 : 0);
    meshRef.current.position.z = config.z + (submerged ? Math.cos(time * 1.2 + config.phase) * 0.015 : 0);

    // Subtle rotational bobbing when floating
    const rotBob = submerged ? Math.sin(time * 1.5 + config.phase) * 0.08 : 0;
    meshRef.current.rotation.x = config.rotX + rotBob;
    meshRef.current.rotation.y = config.rotY + rotBob * 0.5;
    meshRef.current.rotation.z = config.rotZ + rotBob * 0.8;
  });

  return (
    <mesh ref={meshRef} position={[config.x, config.restY, config.z]} castShadow receiveShadow>
      <RoundedBox args={[config.size, config.size, config.size]} radius={0.06} smoothness={4}>
        <primitive object={material} attach="material" />
      </RoundedBox>
    </mesh>
  );
}

/**
 * Ice Component
 * 6 rounded cubes (3 on mobile) with frosted glass material, random rotations and bobbing.
 */
export default function Ice({ isMobile }) {
  const groupRef = useRef();
  const cubeCount = isMobile ? 3 : 6;

  // Frosted ice glass material
  const iceMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transmission: 0.96,
      roughness: 0.28,
      ior: 1.31, // Natural refractive index of water ice
      thickness: 0.75,
      transparent: true,
      color: '#f0f8ff',
      envMapIntensity: 1.8,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
      depthWrite: false,
    });
  }, []);

  // Cleanup material on unmount
  useEffect(() => {
    return () => {
      iceMaterial.dispose();
    };
  }, [iceMaterial]);

  // Configurations for each ice cube (random rotations, resting positions, buoyancy)
  const cubeConfigs = useMemo(() => {
    const list = [
      { x: -0.18, z: 0.12, restY: -0.80, size: 0.42, rotX: 0.3, rotY: 0.7, rotZ: 0.2, phase: 0.1, bobSpeed: 2.1, buoyancy: 0.18 },
      { x: 0.22, z: -0.15, restY: -0.76, size: 0.44, rotX: -0.4, rotY: 1.2, rotZ: 0.5, phase: 1.2, bobSpeed: 1.8, buoyancy: 0.20 },
      { x: 0.05, z: 0.22, restY: -0.45, size: 0.40, rotX: 0.6, rotY: -0.5, rotZ: -0.3, phase: 2.3, bobSpeed: 2.4, buoyancy: 0.16 },
      { x: -0.22, z: -0.18, restY: -0.38, size: 0.42, rotX: -0.2, rotY: 2.0, rotZ: 0.4, phase: 3.5, bobSpeed: 1.9, buoyancy: 0.19 },
      { x: 0.18, z: 0.14, restY: -0.10, size: 0.38, rotX: 0.5, rotY: 0.3, rotZ: -0.6, phase: 4.8, bobSpeed: 2.2, buoyancy: 0.15 },
      { x: -0.04, z: -0.06, restY: 0.18, size: 0.36, rotX: 0.8, rotY: -1.1, rotZ: 0.3, phase: 5.6, bobSpeed: 2.0, buoyancy: 0.14 },
    ];
    return list.slice(0, cubeCount);
  }, [cubeCount]);

  useFrame(() => {
    if (!groupRef.current) return;
    const isVisible = pourState.progress > 0;
    groupRef.current.visible = isVisible;
    if (isVisible) {
      groupRef.current.position.set(...pourState.glassPos);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {cubeConfigs.map((cfg, idx) => (
        <IceCube key={idx} config={cfg} material={iceMaterial} />
      ))}
    </group>
  );
}
