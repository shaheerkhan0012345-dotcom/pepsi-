import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_CONFIG, canAnimState, pourState } from '../state/canState';
import Glass from './Glass';
import Ice from './Ice';
import Stream from './Stream';
import Bubbles from './Bubbles';

// Preload the GLTF model so it's ready immediately
useGLTF.preload('/pepsi_can.glb');

/**
 * Inner Model Component
 */
function Model({ isMobile }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/pepsi_can.glb');

  // Mouse hover damping
  const mouseSmooth = useRef({ x: 0, y: 0 });

  // Interactive mouse drag rotation state
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const userRotation = useRef({ x: 0, y: 0 });
  const userVelocity = useRef({ x: 0, y: 0 });

  // Mouse pointer listeners for hover tilt + interactive click-and-drag rotation
  useEffect(() => {
    const handlePointerDown = (e) => {
      // Don't drag if clicking buttons, links, or navigation
      if (e.target.closest('button, a, input, select, textarea, [data-no-drag]')) return;
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
      userVelocity.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e) => {
      // 1. Mouse hover tilt coordinates
      if (!isMobile) {
        const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
        const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseSmooth.current.targetX = ndcX * MODEL_CONFIG.mouseTiltX;
        mouseSmooth.current.targetY = ndcY * MODEL_CONFIG.mouseTiltY;
      }

      // 2. Click and drag rotation
      if (isDragging.current) {
        const deltaX = e.clientX - prevPointer.current.x;
        const deltaY = e.clientY - prevPointer.current.y;
        prevPointer.current = { x: e.clientX, y: e.clientY };

        const rotSpeed = MODEL_CONFIG.dragSensitivity;
        userRotation.current.y += deltaX * rotSpeed;
        userRotation.current.x += deltaY * (rotSpeed * 0.5);

        // Clamp vertical tilt to avoid flipping upside down
        userRotation.current.x = THREE.MathUtils.clamp(userRotation.current.x, -0.45, 0.45);

        userVelocity.current = {
          y: deltaX * rotSpeed,
          x: deltaY * (rotSpeed * 0.5),
        };
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isMobile]);

  // =========================================================================
  // AUTO-FIT, CENTERING & NORMALIZATION (Box3 computation)
  // =========================================================================
  const processedScene = useMemo(() => {
    const cloned = scene.clone(true);

    // 1. Compute exact bounding box of the loaded mesh
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 2. Center geometry so pivot is at absolute (0, 0, 0)
    cloned.position.x = -center.x;
    cloned.position.y = -center.y;
    cloned.position.z = -center.z;

    // 3. Put inside a clean wrapper group
    const wrapper = new THREE.Group();
    wrapper.add(cloned);

    // 4. Normalize scale so height is exactly targetHeight (~3.2 units)
    const currentHeight = size.y || 1;
    const scaleFactor = MODEL_CONFIG.targetHeight / currentHeight;
    wrapper.scale.setScalar(scaleFactor);

    // 5. Apply manual rotation tweak if provided
    wrapper.rotation.x = MODEL_CONFIG.manualRotation[0];
    wrapper.rotation.y = MODEL_CONFIG.manualRotation[1];
    wrapper.rotation.z = MODEL_CONFIG.manualRotation[2];

    // 6. Optimize materials for glossy soda can aluminum look
    wrapper.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.metalness = Math.min(child.material.metalness ?? 0.85, 0.88);
          child.material.roughness = Math.max(child.material.roughness ?? 0.2, 0.18);
          child.material.envMapIntensity = 1.4;
          child.material.needsUpdate = true;
        }
      }
    });

    return wrapper;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.1);

    // 1. Smooth hover tilt damping
    if (!isMobile && mouseSmooth.current.targetX !== undefined) {
      mouseSmooth.current.x = THREE.MathUtils.damp(
        mouseSmooth.current.x,
        mouseSmooth.current.targetX,
        4,
        safeDelta
      );
      mouseSmooth.current.y = THREE.MathUtils.damp(
        mouseSmooth.current.y,
        mouseSmooth.current.targetY,
        4,
        safeDelta
      );
    } else {
      mouseSmooth.current.x = 0;
      mouseSmooth.current.y = 0;
    }

    // 2. Smooth inertia for user drag rotation
    if (!isDragging.current) {
      userVelocity.current.y *= 0.93;
      userVelocity.current.x *= 0.93;
      userRotation.current.y += userVelocity.current.y;
      userRotation.current.x += userVelocity.current.x;
      userRotation.current.x = THREE.MathUtils.clamp(userRotation.current.x, -0.45, 0.45);
    }

    // 3. Idle animations: gentle float & subtle sway keeping front logo visible
    const idleFloatY = Math.sin(time * MODEL_CONFIG.idleFloatSpeed) * MODEL_CONFIG.idleFloatAmplitude;
    const idleSwayY = Math.sin(time * MODEL_CONFIG.idleSwaySpeed) * MODEL_CONFIG.idleSwayAmplitude;

    // 4. DYNAMIC 3D DOCKING: Project 2nd Section Card's DOM bounding rect to 3D world space
    let cardWorldX = isMobile ? 0 : 2.15;
    let cardWorldY = isMobile ? -0.85 : 0;

    const cardElem = document.getElementById(canAnimState.cardElementId);
    if (cardElem) {
      const rect = cardElem.getBoundingClientRect();
      const elemCenterX = rect.left + rect.width / 2;
      const elemCenterY = rect.top + rect.height / 2;

      // Convert to Normalized Device Coordinates (-1 to 1)
      const ndcX = (elemCenterX / window.innerWidth) * 2 - 1;
      const ndcY = -(elemCenterY / window.innerHeight) * 2 + 1;

      // Project NDC to 3D world plane at Z = 0
      const vFov = (state.camera.fov * Math.PI) / 180;
      const planeHeight = 2 * Math.tan(vFov / 2) * state.camera.position.z;
      const planeWidth = planeHeight * (window.innerWidth / window.innerHeight);

      cardWorldX = (ndcX * planeWidth) / 2;
      cardWorldY = (ndcY * planeHeight) / 2;
    }

    // 5. Position & Rotation Resolution (Hero -> Section 2 Dock -> Section 3 Pour)
    const BASE_FRONT_Y = MODEL_CONFIG.frontRotationY;

    if (pourState.progress > 0) {
      // =====================================================================
      // SECTION 3: "POUR" SEQUENCE (Starts exactly where Section 2 leaves off!)
      // =====================================================================
      const pourLiftX = isMobile ? 0.95 : pourState.canPourPos[0];
      const pourLiftY = isMobile ? 1.25 : pourState.canPourPos[1];
      const returnX = isMobile ? 1.2 : pourState.canReturnPos[0];
      const returnY = isMobile ? 0.6 : pourState.canReturnPos[1];

      // 0–20%: Lift from Section 2's card position to pour position
      let targetX = THREE.MathUtils.lerp(cardWorldX, pourLiftX, pourState.canLift);
      let targetY = THREE.MathUtils.lerp(cardWorldY, pourLiftY, pourState.canLift);

      // 85–100%: Drift to side
      if (pourState.canReturn > 0) {
        targetX = THREE.MathUtils.lerp(targetX, returnX, pourState.canReturn);
        targetY = THREE.MathUtils.lerp(targetY, returnY, pourState.canReturn);
      }

      // Pour tilt angle (~110° on Z toward glass)
      const tiltZ = pourState.canTiltAngle * pourState.canTilt * (1 - pourState.canReturn);

      // Subtle cola flow micro-vibration during active pour (20%–85%)
      const isFlowing = pourState.streamProgress > 0.5 && pourState.streamWidth > 0.3;
      const vibeX = isFlowing ? (Math.random() - 0.5) * 0.006 : 0;
      const vibeY = isFlowing ? (Math.random() - 0.5) * 0.006 : 0;

      groupRef.current.position.x = THREE.MathUtils.damp(
        groupRef.current.position.x,
        targetX + vibeX,
        6,
        safeDelta
      );
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        targetY + vibeY + idleFloatY * 0.4,
        6,
        safeDelta
      );

      const finalRotX = userRotation.current.x - mouseSmooth.current.y;
      const finalRotY = BASE_FRONT_Y + canAnimState.scrollRotY + userRotation.current.y + idleSwayY * 0.4 + mouseSmooth.current.x;
      const finalRotZ = tiltZ + (mouseSmooth.current.x * 0.1);

      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, finalRotX, 6, safeDelta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, finalRotY, 6, safeDelta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, finalRotZ, 6, safeDelta);

      // Scale in Section 3
      const cardScale = isMobile ? 0.60 : 0.80;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, cardScale, 5, safeDelta)
      );

    } else {
      // =====================================================================
      // SECTIONS 1 & 2: HERO -> DOCKING INTO CARD
      // =====================================================================
      const targetX = THREE.MathUtils.lerp(canAnimState.heroX, cardWorldX, canAnimState.dockProgress);
      const targetY = THREE.MathUtils.lerp(canAnimState.heroY, cardWorldY, canAnimState.dockProgress) + canAnimState.dropY + idleFloatY;

      groupRef.current.position.x = THREE.MathUtils.damp(
        groupRef.current.position.x,
        targetX,
        6,
        safeDelta
      );
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        targetY,
        6,
        safeDelta
      );

      const finalRotX = userRotation.current.x - mouseSmooth.current.y;
      const finalRotY = BASE_FRONT_Y + canAnimState.scrollRotY + userRotation.current.y + idleSwayY + mouseSmooth.current.x;
      const finalRotZ = canAnimState.scrollRotZ + (mouseSmooth.current.x * 0.15);

      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, finalRotX, 5, safeDelta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, finalRotY, 5, safeDelta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, finalRotZ, 5, safeDelta);

      const baseHeroScale = isMobile ? 0.72 : 1.0;
      const baseCardScale = isMobile ? 0.60 : 0.80;
      const currentBaseScale = THREE.MathUtils.lerp(baseHeroScale, baseCardScale, canAnimState.dockProgress);
      const finalScale = currentBaseScale * (1 + canAnimState.scrollScaleBonus) * canAnimState.entranceScale;

      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, finalScale, 5, safeDelta)
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      <primitive object={processedScene} />
      {/* Dynamic contact shadow right beneath the can base */}
      <ContactShadows
        position={[0, -1.62, 0]}
        opacity={0.65}
        scale={4}
        blur={1.8}
        far={3.0}
        resolution={512}
        color="#080812"
      />
    </group>
  );
}

/**
 * Main CanScene Component
 * Persistent Transparent Three.js canvas setup with studio lighting, shadow ground,
 * and Section 3 3D pouring elements (Glass, Ice, Stream, Bubbles).
 */
export default function CanScene({ isMobile }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 7.2], fov: 38 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 2]} // 60fps retina optimization
      style={{ width: '100%', height: '100%' }}
    >
      {/* Soft Studio Lighting Setup */}
      <ambientLight intensity={0.85} />

      {/* Key Directional Light (Warm/Clean Studio) */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0001}
      />

      {/* Secondary Fill Light */}
      <directionalLight position={[-5, 3, 2]} intensity={0.7} color="#FFFFFF" />

      {/* Electric Pepsi Blue Rim Light */}
      <directionalLight position={[0, -2, -6]} intensity={3.2} color="#0A4DA3" />
      <pointLight position={[3, -1, -2]} intensity={1.5} color="#0A4DA3" distance={8} />

      {/* Subtle Warm Red Accent Light */}
      <pointLight position={[-4, 2, -2]} intensity={1.0} color="#E32934" distance={8} />

      {/* Studio Environment Map for realistic reflections */}
      <Environment preset="city" environmentIntensity={0.85} />

      {/* 3D Can Model */}
      <Model isMobile={isMobile} />

      {/* NEW SECTION 3: "POUR" 3D Elements */}
      <Glass isMobile={isMobile} />
      <Ice isMobile={isMobile} />
      <Stream isMobile={isMobile} />
      <Bubbles isMobile={isMobile} />
    </Canvas>
  );
}
