import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pourState } from '../state/canState';

/**
 * Bubbles Component
 * InstancedMesh of sparkling spheres rising inside the cola liquid with randomized speeds,
 * wobbles, and fade-out as they reach the surface foam.
 */
export default function Bubbles({ isMobile }) {
  const meshRef = useRef();
  const bubbleCount = isMobile ? 24 : 64;

  const bubbleData = useMemo(() => {
    return Array.from({ length: bubbleCount }).map(() => ({
      x: (Math.random() - 0.5) * 0.9,
      z: (Math.random() - 0.5) * 0.9,
      normY: Math.random(), // 0 = liquid floor, 1 = liquid surface
      speed: 0.25 + Math.random() * 0.55,
      wobbleSpeed: 2.0 + Math.random() * 3.0,
      wobblePhase: Math.random() * Math.PI * 2,
      baseSize: 0.012 + Math.random() * 0.022,
    }));
  }, [bubbleCount]);

  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.1,
        transmission: 0.9,
        ior: 1.1,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isVisible = pourState.progress > 0.25 && (pourState.liquidLevel || 0) > 0.03;
    meshRef.current.visible = isVisible;
    if (!isVisible) return;

    const time = state.clock.getElapsedTime();
    const glassPos = pourState.glassPos;
    const glassHeight = 2.4;
    const baseThickness = 0.28;
    const liquidMaxHeight = 2.05;
    const liquidBottomY = glassPos[1] - glassHeight / 2 + baseThickness;
    const currentLiquidHeight = (pourState.liquidLevel || 0) * liquidMaxHeight;
    const surfaceY = liquidBottomY + currentLiquidHeight;

    bubbleData.forEach((b, idx) => {
      // Advance normalized height inside the liquid column
      b.normY += (delta * b.speed) / Math.max(0.1, currentLiquidHeight);
      if (b.normY > 1.0) {
        b.normY = 0;
        // Randomize spawn coordinates inside bottom radius
        const r = Math.random() * 0.45;
        const a = Math.random() * Math.PI * 2;
        b.x = Math.cos(a) * r;
        b.z = Math.sin(a) * r;
      }

      // World Y position inside liquid
      const y = liquidBottomY + b.normY * currentLiquidHeight;
      // Slight horizontal carbonation wobble
      const wobbleX = Math.sin(time * b.wobbleSpeed + b.wobblePhase) * 0.012;
      const wobbleZ = Math.cos(time * b.wobbleSpeed + b.wobblePhase) * 0.012;

      // Scale: small at bottom, expands slightly, fades/shrinks near foam surface
      const fadeFactor = Math.sin(b.normY * Math.PI); // 0 at bottom, 1 at middle, 0 at top
      const scale = b.baseSize * Math.max(0.001, fadeFactor);

      dummy.position.set(glassPos[0] + b.x + wobbleX, y, glassPos[2] + b.z + wobbleZ);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(idx, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, bubbleCount]}
      visible={false}
      castShadow={false}
      receiveShadow={false}
    />
  );
}
