/**
 * 3D Model Configuration & State
 */
export const MODEL_CONFIG = {
  // Desired height of the can in Three.js world units
  targetHeight: 3.2,

  // Base rotation offset to ensure the front Pepsi logo directly faces the camera
  // In the model's UV mapping, 1.633 rad (~93.6 deg) brings the front logo to +Z
  frontRotationY: 1.633,

  // Manual rotation tweak [x, y, z] in radians (fine-tuning)
  manualRotation: [0, 0, 0],

  // Idle animation parameters (subtle floating & sway around the front logo)
  idleFloatSpeed: 1.4,
  idleFloatAmplitude: 0.04,
  idleSwaySpeed: 0.8,
  idleSwayAmplitude: 0.06,

  // Mouse tilt sensitivity (when hovering)
  mouseTiltX: 0.2,
  mouseTiltY: 0.2,

  // Drag rotation speed
  dragSensitivity: 0.007,
};

/**
 * Global reactive animation state controlled by GSAP ScrollTrigger
 * and tracked dynamically to DOM card coordinates.
 */
export const canAnimState = {
  // Entrance drop (defaults to 0)
  dropY: 0,
  entranceScale: 1.0,

  // Docking progress: 0 = Hero center, 1 = Magnetically docked in 2nd Section Card
  dockProgress: 0,

  // Hero center position
  heroX: 0,
  heroY: -0.1, // Centered right between "REFRESH" and "THE FUTURE"

  // ID of the target anchor inside the 2nd section card
  cardElementId: 'card-pedestal-anchor',

  // GSAP scroll rotation and scale bonus
  scrollRotY: 0,
  scrollRotZ: 0,
  scrollScaleBonus: 0,
};

/**
 * Section 3: "POUR" Animation & Element State
 * Easily tweakable values for tilt, liquid speed, colors, and coordinates.
 */
export const pourState = {
  // Section 3 master scroll progress (0.0 to 1.0)
  progress: 0,

  // 1. Can lift & tilt (Phase 0% - 20%)
  canLift: 0,        // 0 to 1
  canTilt: 0,        // 0 to 1

  // 2. Stream flow (Phase 20% - 30% start, 30% - 85% full, 85% - 100% stop)
  streamProgress: 0, // 0 to 1
  streamWidth: 0,    // 0 to 1

  // 3. Liquid level & foam disc (Phase 30% - 85%)
  liquidLevel: 0,    // 0 to 0.85
  foamOpacity: 0,    // 0 to 1

  // 4. Return upright & glass glow (Phase 85% - 100%)
  canReturn: 0,      // 0 to 1
  glassGlow: 0,      // 0 to 1

  // Configurable spatial coordinates & angles
  glassPos: [0, -0.85, 0],
  canPourPos: [1.75, 1.45, 0],
  canTiltAngle: 110 * (Math.PI / 180), // 110 degrees (~1.92 rad)
  canReturnPos: [2.35, 0.75, 0],
  colaColor: '#1a0c08',
  foamColor: '#d6b88d',
};
