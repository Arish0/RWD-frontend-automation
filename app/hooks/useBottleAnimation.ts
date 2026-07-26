import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface BottleAnimationConfig {
  // Timing
  duration?: number; // Total animation cycle duration (default: 3s)
  holdDuration?: number; // Hold at center duration (default: 0.5s)
  bounceAmount?: number; // Bounce height on landing (default: 20px)

  // Movement
  maxRotation?: number; // Maximum rotation angle (default: 720deg)
  launchHeight?: number; // How high bottle launches (default: 300px)
  diagonalTravelX?: number; // Horizontal travel on ascent (default: 100px)

  // Easing
  riseEase?: string; // Easing for upward motion (default: 'power2.out')
  holdEase?: string; // Easing while holding (default: 'sine.inOut')
  launchEase?: string; // Easing for launch (default: 'back.out')
  landingEase?: string; // Easing for landing (default: 'elastic.out')

  // Enabled
  enabled?: boolean; // Whether to run animation (default: true)
}

const DEFAULT_CONFIG: Required<BottleAnimationConfig> = {
  duration: 3,
  holdDuration: 0.5,
  bounceAmount: 20,
  maxRotation: 720,
  launchHeight: 300,
  diagonalTravelX: 100,
  riseEase: 'power2.out',
  holdEase: 'sine.inOut',
  launchEase: 'back.out',
  landingEase: 'elastic.out',
  enabled: true,
};

/**
 * Custom hook for bottle animation using GSAP
 * Handles all animation logic separately from UI
 *
 * @param elementRef - Reference to the bottle element
 * @param config - Animation configuration
 *
 * Timeline breakdown:
 * 0.0s - 0.6s: Rise & Rotate (horizontal → upright diagonal)
 * 0.6s - 1.1s: Hold (centered, upright)
 * 1.1s - 1.8s: Launch (upward with rotation)
 * 1.8s - 2.4s: Descent & Rotate (upright → horizontal)
 * 2.4s - 2.8s: Landing Bounce (horizontal with elastic bounce)
 * 2.8s - 3.0s: Reset to start
 */
export const useBottleAnimation = (
  elementRef: React.RefObject<HTMLDivElement>,
  config: BottleAnimationConfig = {}
) => {
  const configRef = useRef<Required<BottleAnimationConfig>>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !configRef.current.enabled) return;

    // Kill existing animation to prevent duplicates
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const cfg = configRef.current;
    const tl = gsap.timeline({ repeat: -1 });
    timelineRef.current = tl;

    // Calculate timing for each phase
    const totalDuration = cfg.duration;
    const riseTime = 0.6; // Time to go from horizontal to upright
    const holdTime = cfg.holdDuration;
    const launchTime = 0.7; // Time to launch upward
    const descentTime = 0.6; // Time to descend
    const landingTime = 0.4; // Time for landing bounce
    const resetTime = 0.2; // Time to reset position

    // ============================================
    // PHASE 1: RISE & ROTATE (0s - 0.6s)
    // ============================================
    // Bottle starts lying horizontally (-90deg rotation)
    // Moves diagonally upward while rotating to upright (0deg)
    // Easing: power2.out (smooth deceleration)
    tl.fromTo(
      element,
      {
        rotation: -90,
        x: 0,
        y: 0,
      },
      {
        rotation: 0,
        x: cfg.diagonalTravelX * 0.5,
        y: -150,
        duration: riseTime,
        ease: cfg.riseEase,
      },
      0 // Start at beginning
    );

    // ============================================
    // PHASE 2: HOLD AT CENTER (0.6s - 1.1s)
    // ============================================
    // Bottle stays upright and centered
    // Slight breathing/pulsing effect with scale
    // Easing: sine.inOut (smooth wave motion)
    tl.to(
      element,
      {
        x: 0,
        y: -200,
        rotation: 0,
        duration: holdTime,
        ease: cfg.holdEase,
      },
      riseTime // Start after rise phase
    );

    // Add subtle scale pulse during hold
    tl.to(
      element,
      {
        scale: 1.05,
        duration: holdTime * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      riseTime // Sync with hold start
    );

    // ============================================
    // PHASE 3: LAUNCH & ROTATE (1.1s - 1.8s)
    // ============================================
    // Bottle launches upward with explosive rotation
    // Starts upright (0deg) and rotates while going up
    // Easing: back.out (overshoot effect for energy)
    tl.to(
      element,
      {
        rotation: cfg.maxRotation,
        y: -cfg.launchHeight,
        duration: launchTime,
        ease: cfg.launchEase,
      },
      riseTime + holdTime // Start after hold
    );

    // ============================================
    // PHASE 4: DESCENT & ROTATE (1.8s - 2.4s)
    // ============================================
    // Bottle falls back down while continuing rotation
    // Gradually tilts back to horizontal for landing
    // Easing: power2.in (acceleration as it falls)
    tl.to(
      element,
      {
        rotation: 450,
        y: -10,
        x: 0,
        duration: descentTime,
        ease: 'power2.in',
      },
      riseTime + holdTime + launchTime // After launch
    );

    // ============================================
    // PHASE 5: LANDING & BOUNCE (2.4s - 2.8s)
    // ============================================
    // Bottle lands horizontally (90deg rotation)
    // Elastic bounce effect on impact
    // Easing: elastic.out (bouncy spring motion)
    tl.to(
      element,
      {
        rotation: 90,
        y: cfg.bounceAmount,
        duration: landingTime,
        ease: cfg.landingEase,
      },
      riseTime + holdTime + launchTime + descentTime // After descent
    );

    // ============================================
    // PHASE 6: SETTLE TO START (2.8s - 3.0s)
    // ============================================
    // Return to initial lying position smoothly
    // Easing: power2.inOut (smooth interpolation)
    tl.to(
      element,
      {
        rotation: -90,
        y: 0,
        x: 0,
        scale: 1,
        duration: resetTime,
        ease: 'power2.inOut',
      },
      riseTime + holdTime + launchTime + descentTime + landingTime // After landing
    );

    return () => {
      // Cleanup: kill animation on unmount
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [elementRef, config?.enabled]);

  // Return timeline for external control if needed
  return timelineRef.current;
};
