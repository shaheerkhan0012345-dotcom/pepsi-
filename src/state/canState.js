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
