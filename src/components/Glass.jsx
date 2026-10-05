import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { pourState } from '../state/canState';

/**
 * Glass Component
 * Tapered transparent drinking glass with thick base, MeshPhysicalMaterial,
 * condensation droplets, rising cola liquid, foam disc, and soft blue glow.
 */
export default function Glass({ isMobile }) {
  const groupRef = useRef();
  const liquidMeshRef = useRef();
  const foamMeshRef = useRef();
  const glowLightRef = useRef();
  const dropletsRef = useRef();

  // Glass dimensions
  const height = 2.4;
  const radiusTop = 0.82;
  const radiusBottom = 0.68;
  const baseThickness = 0.28;
  const liquidMaxHeight = 2.05;
  const liquidBottomY = -height / 2 + baseThickness; // Bottom floor inside the glass

  // 1. Generate condensation droplets on the outer glass surface
  const dropletCount = isMobile ? 16 : 42;
  const dropletTransforms = useMemo(() => {
    const transforms = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < dropletCount; i++) {
      // Height between bottom base and upper rim
      const normY = 0.15 + Math.random() * 0.7; // 0.15 to 0.85
      const y = -height / 2 + baseThickness + normY * (height - baseThickness);

      // Radius at this height
      const t = (y + height / 2) / height;
      const r = THREE.MathUtils.lerp(radiusBottom, radiusTop, t) + 0.015;

      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      dummy.position.set(x, y, z);
      // Look away from center
      dummy.lookAt(x * 2, y, z * 2);
      const scale = 0.018 + Math.random() * 0.024;
      dummy.scale.set(scale, scale * 1.3, scale * 0.8);
      dummy.updateMatrix();

      transforms.push(dummy.matrix.clone());
    }
    return transforms;
  }, [dropletCount]);

  useEffect(() => {
    if (!dropletsRef.current) return;
    dropletTransforms.forEach((matrix, i) => {
      dropletsRef.current.setMatrixAt(i, matrix);
    });
    dropletsRef.current.instanceMatrix.needsUpdate = true;
  }, [dropletTransforms]);

  // Geometries and materials with proper cleanup
  const {
    glassGeo,
    baseGeo,
    liquidGeo,
    foamGeo,
    dropletGeo,
    glassMat,
    liquidMat,
    foamMat,
    dropletMat,
  } = useMemo(() => {
    const gGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 64, 1, true);
    const bGeo = new THREE.CylinderGeometry(radiusBottom, radiusBottom * 0.96, baseThickness, 64);
    
    // Liquid cylinder with pivot at base
    const lGeo = new THREE.CylinderGeometry(radiusTop * 0.96, radiusBottom * 0.95, liquidMaxHeight, 48);
    lGeo.translate(0, liquidMaxHeight / 2, 0); // Translate so bottom is at local y = 0

    const fGeo = new THREE.CylinderGeometry(radiusTop * 0.96, radiusTop * 0.94, 0.06, 48);
    const dGeo = new THREE.SphereGeometry(1, 12, 12);

    const gMat = new THREE.MeshPhysicalMaterial({
      transmission: 1.0,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.5,
      transparent: true,
      color: '#ffffff',
      specularIntensity: 1.0,
      envMapIntensity: 1.6,
      depthWrite: false,
    });

    const lMat = new THREE.MeshPhysicalMaterial({
      color: pourState.colaColor || '#1a0c08',
      roughness: 0.15,
      transmission: 0.3,
      transparent: true,
      opacity: 0.96,
      envMapIntensity: 1.2,
      depthWrite: true,
    });

    const fMat = new THREE.MeshStandardMaterial({
      color: pourState.foamColor || '#d6b88d',
      roughness: 0.75,
      metalness: 0.05,
      transparent: true,
      opacity: 0,
    });

    const dMat = new THREE.MeshPhysicalMaterial({
      transmission: 1.0,
      roughness: 0.1,
      ior: 1.33,
      transparent: true,
      color: '#ffffff',
    });

    return {
      glassGeo: gGeo,
      baseGeo: bGeo,
      liquidGeo: lGeo,
      foamGeo: fGeo,
      dropletGeo: dGeo,
      glassMat: gMat,
      liquidMat: lMat,
      foamMat: fMat,
      dropletMat: dMat,
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      glassGeo.dispose();
      baseGeo.dispose();
      liquidGeo.dispose();
      foamGeo.dispose();
      dropletGeo.dispose();
      glassMat.dispose();
      liquidMat.dispose();
      foamMat.dispose();
      dropletMat.dispose();
    };
  }, [glassGeo, baseGeo, liquidGeo, foamGeo, dropletGeo, glassMat, liquidMat, foamMat, dropletMat]);

  // Frame loop updates: liquid level, foam height, glow light
  useFrame(() => {
    if (!groupRef.current) return;

    // Only render/show when Section 3 has begun or is approaching
    const isVisible = pourState.progress > 0;
    groupRef.current.visible = isVisible;
    if (!isVisible) return;

    // 1. Position of Glass in scene
    groupRef.current.position.set(...pourState.glassPos);

    // 2. Rising liquid level (0 to 0.85)
    const level = Math.max(0.001, pourState.liquidLevel);
    if (liquidMeshRef.current) {
      liquidMeshRef.current.scale.set(1, level, 1);
    }

    // 3. Foam disc follows liquid top surface
    if (foamMeshRef.current) {
      const surfaceY = liquidBottomY + level * liquidMaxHeight;
      foamMeshRef.current.position.y = surfaceY + 0.02;
      
      // Radius taper at surface
      const t = (surfaceY + height / 2) / height;
      const foamScale = THREE.MathUtils.lerp(radiusBottom / radiusTop, 1.0, t);
      foamMeshRef.current.scale.set(foamScale, 1, foamScale);
      
      foamMat.opacity = THREE.MathUtils.lerp(foamMat.opacity, pourState.foamOpacity, 0.1);
    }

    // 4. Soft glow light in 85%–100%
    if (glowLightRef.current) {
      glowLightRef.current.intensity = pourState.glassGlow * 2.8;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Outer Tapered Glass Cylinder */}
      <mesh geometry={glassGeo} material={glassMat} castShadow receiveShadow />

      {/* Thicker Glass Base */}
      <mesh
        geometry={baseGeo}
        material={glassMat}
        position={[0, -height / 2 + baseThickness / 2, 0]}
        castShadow
        receiveShadow
      />

      {/* Condensation Droplets */}
      <instancedMesh
        ref={dropletsRef}
        args={[dropletGeo, dropletMat, dropletCount]}
        castShadow={false}
        receiveShadow={false}
      />

      {/* Rising Cola Liquid */}
      <mesh
        ref={liquidMeshRef}
        geometry={liquidGeo}
        material={liquidMat}
        position={[0, liquidBottomY, 0]}
        scale={[1, 0.001, 1]}
      />

      {/* Light Foam Disc on top */}
      <mesh
        ref={foamMeshRef}
        geometry={foamGeo}
        material={foamMat}
        position={[0, liquidBottomY, 0]}
      />

      {/* Soft Blue Glow (active in 85%–100%) */}
      <pointLight
        ref={glowLightRef}
        position={[0, 0, 0.5]}
        color="#0A4DA3"
        intensity={0}
        distance={4}
        decay={2}
      />
    </group>
  );
}
