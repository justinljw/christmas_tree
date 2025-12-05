import { Vector3 } from 'three';

// Brand Palette - Updated for White Background
export const COLORS = {
  EMERALD_DEEP: "#104030",
  EMERALD_LIGHT: "#206040",
  GOLD_METALLIC: "#CDA434", // Darker gold to pop on white
  GOLD_ROSE: "#D4AF37",
  BG_DARK: "#ffffff", // Pure White
  GLOW_WARM: "#FFB300",
  RUBY_DEEP: "#A00000",
  SILVER_PALE: "#A9A9A9",
  BLUE_ROYAL: "#002060",
  PURPLE_DEEP: "#400060"
};

// Animation Settings
export const ANIMATION = {
  ROTATION_SPEED: 0.1,
  FLOAT_SPEED: 0.5,
  MORPH_SPEED: 0.08, // Increased from 0.025 for faster wrap/unwrap
};

// Scene Configuration
export const SCENE_CONFIG = {
  TREE_HEIGHT: 11,
  BASE_RADIUS: 5.0,
  FOLIAGE_COUNT: 0, // Disabled
  SCATTER_RADIUS: 30,
};