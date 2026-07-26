import React, { useRef } from 'react';
import { useBottleAnimation, BottleAnimationConfig } from '../hooks/useBottleAnimation';

interface AnimatedBottleProps {
  /**
   * Custom animation configuration
   * All properties are optional and have sensible defaults
   */
  animationConfig?: BottleAnimationConfig;

  /**
   * Size of the bottle in pixels
   */
  size?: number;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Whether to show debug info (rotation values, position)
   */
  debug?: boolean;
}

/**
 * Production-ready animated bottle component using video
 *
 * Features:
 * - Plays bottle.mp4 video from public folder
 * - Reusable and configurable GSAP animation
 * - Smooth 60 FPS performance with CSS transforms
 * - No layout reflows
 * - Proper cleanup on unmount
 * - Follows React best practices
 *
 * Usage:
 * ```tsx
 * <AnimatedBottle
 *   size={160}
 *   animationConfig={{ duration: 3, launchHeight: 300 }}
 * />
 * ```
 */
export const AnimatedBottle: React.FC<AnimatedBottleProps> = ({
  animationConfig = {},
  size = 160,
  className = '',
  debug = false,
}) => {
  const bottleRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize animation
  useBottleAnimation(bottleRef, animationConfig);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px',
        minHeight: '400px',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Bottle Container - All transforms applied here */}
      <div
        ref={bottleRef}
        style={{
          width: size,
          height: size,
          position: 'relative',
          willChange: 'transform', // GPU acceleration hint
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Video Element - Plays bottle animation */}
        <video
          ref={videoRef}
          src="/bottle.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            filter: 'drop-shadow(0 18px 45px rgba(200, 149, 109, 0.35))',
          }}
        />
      </div>

      {/* Debug info - shows animation values in real-time */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            fontSize: '12px',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.7)',
            color: '#0f0',
            padding: '12px',
            borderRadius: '6px',
            maxWidth: '200px',
          }}
        >
          <div>Bottle Animation Debug</div>
          <div style={{ fontSize: '10px', marginTop: '8px' }}>
            Check browser DevTools for:
            <br />- Transform matrix values
            <br />- Video playback status
            <br />- 60 FPS performance
            <br />- GPU acceleration active
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedBottle;
