import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pourState } from '../state/canState';

/**
 * Stream Component
 * Dynamically generated TubeGeometry along a Bezier curve from can mouth to liquid surface,
 * with glossy dark cola material and impact splash droplet particles.
 */
export default function Stream({ isMobile }) {
  const meshRef = useRef();
  const splashRef = useRef();
  const curvePointsRef = useRef([]);

  // Splash particles setup
  const particleCount = isMobile ? 14 : 28;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      x: 0,
      y: 0,
      z: 0,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.3 + Math.random() * 0.5,
      vz: (Math.random() - 0.5) * 0.4,
      life: Math.random(),
      size: 0.015 + Math.random() * 0.02,
    }));
  }, [particleCount]);

  const splashGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const splashMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: pourState.colaColor || '#1a0c08',
        roughness: 0.1,
        metalness: 0.2,
      }),
    []
  );

  const streamMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: pourState.colaColor || '#1a0c08',
        roughness: 0.08,
        metalness: 0.15,
        transmission: 0.25,
        transparent: true,
        opacity: 0.96,
        envMapIntensity: 1.5,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      splashGeo.dispose();
      splashMat.dispose();
      streamMat.dispose();
      if (meshRef.current?.geometry) {
        meshRef.current.geometry.dispose();
      }
    };
  }, [splashGeo, splashMat, streamMat]);

  // Temporary dummy object for instanced splash updates
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const isPouring = pourState.progress > 0.18 && pourState.progress < 0.98;
    const progress = pourState.streamProgress || 0;
    const widthFactor = pourState.streamWidth || 0;

    if (!meshRef.current || !isPouring || progress <= 0.01 || widthFactor <= 0.01) {
      if (meshRef.current) meshRef.current.visible = false;
      if (splashRef.current) splashRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;

    // 1. Calculate can mouth position in 3D world space
    const canX = pourState.canPourPos[0];
    const canY = pourState.canPourPos[1];
    const canZ = pourState.canPourPos[2];
    const tilt = pourState.canTiltAngle * (pourState.canTilt || 1);

    // Can mouth is at distance 1.6 along can's tilted axis
    const mouthX = canX - 1.58 * Math.sin(tilt);
    const mouthY = canY + 1.58 * Math.cos(tilt);
    const mouthZ = canZ;

    // 2. Calculate liquid surface target inside glass
    const glassPos = pourState.glassPos;
    const glassHeight = 2.4;
    const baseThickness = 0.28;
    const liquidMaxHeight = 2.05;
    const liquidBottomY = glassPos[1] - glassHeight / 2 + baseThickness;
    const currentSurfaceY = liquidBottomY + (pourState.liquidLevel || 0) * liquidMaxHeight;

    // Target point where stream hits
    const impactX = glassPos[0];
    const impactY = currentSurfaceY;
    const impactZ = glassPos[2];

    // 3. Define the full parabolic pouring curve
    const startPoint = new THREE.Vector3(mouthX, mouthY, mouthZ);
    const cp1 = new THREE.Vector3(
      mouthX - 0.12 * Math.sin(tilt),
      mouthY - 0.28,
      mouthZ
    );
    const cp2 = new THREE.Vector3(impactX + 0.04, impactY + 0.5, impactZ);
    const endPoint = new THREE.Vector3(impactX, impactY, impactZ);

    const fullCurve = new THREE.CubicBezierCurve3(startPoint, cp1, cp2, endPoint);

    // Truncate curve based on streamProgress (falls from mouth to impact point in 20%–30%)
    const currentEndPoint = fullCurve.getPoint(Math.min(1, Math.max(0.01, progress)));
    const currentCurve = new THREE.CubicBezierCurve3(
      startPoint,
      fullCurve.getPoint(progress * 0.33),
      fullCurve.getPoint(progress * 0.66),
      currentEndPoint
    );

    // 4. Generate Tube Geometry
    const radius = 0.048 * widthFactor;
    const radialSegments = isMobile ? 8 : 12;
    const tubularSegments = isMobile ? 20 : 32;

    const oldGeo = meshRef.current.geometry;
    meshRef.current.geometry = new THREE.TubeGeometry(
      currentCurve,
      tubularSegments,
      radius,
      radialSegments,
      false
    );
    if (oldGeo) oldGeo.dispose();

    // 5. Droplet splash particles at impact point
    const hasImpact = progress >= 0.95 && widthFactor > 0.1;
    if (splashRef.current) {
      splashRef.current.visible = hasImpact;

      if (hasImpact) {
        const time = state.clock.getElapsedTime();
        particles.forEach((p, idx) => {
          p.life += delta * 2.2;
          if (p.life > 1) {
            p.life = 0;
            p.x = (Math.random() - 0.5) * 0.06;
            p.y = 0;
            p.z = (Math.random() - 0.5) * 0.06;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.15 + Math.random() * 0.35;
            p.vx = Math.cos(angle) * speed;
            p.vy = 0.35 + Math.random() * 0.45;
            p.vz = Math.sin(angle) * speed;
          }

          // Physics update
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.vy -= 9.8 * delta * 0.25; // gravity
          p.z += p.vz * delta;

          // Scale fades out near end of life
          const s = p.size * (1 - p.life) * widthFactor;
          dummy.position.set(impactX + p.x, impactY + p.y, impactZ + p.z);
          dummy.scale.set(s, s * 1.3, s);
          dummy.updateMatrix();

          splashRef.current.setMatrixAt(idx, dummy.matrix);
        });
        splashRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <>
      {/* Dynamic Flowing Tube Mesh */}
      <mesh ref={meshRef} material={streamMat} castShadow={false} receiveShadow={false} />

      {/* Impact Splash Droplets */}
      <instancedMesh
        ref={splashRef}
        args={[splashGeo, splashMat, particleCount]}
        castShadow={false}
        receiveShadow={false}
      />
    </>
  );
}
