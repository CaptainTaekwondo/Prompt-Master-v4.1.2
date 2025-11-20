

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

interface RocketAnimationProps {
  startRef: React.RefObject<HTMLElement>;
  endRef: React.RefObject<HTMLElement>;
  onAnimationComplete: () => void;
}

const PREPARE_DURATION = 1000;
const FLIGHT_DURATION = 1200;
const EXPLOSION_DURATION = 1000;

type CustomCSS = React.CSSProperties & {
    '--smoke-drift-x'?: string;
    '--smoke-drift-y'?: string;
    '--fire-particle-x'?: string;
    '--fire-particle-y'?: string;
    '--fire-color'?: string;
};

export const RocketAnimation: React.FC<RocketAnimationProps> = ({ startRef, endRef, onAnimationComplete }) => {
  const [rocketStyle, setRocketStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [smokePuffs, setSmokePuffs] = useState<CustomCSS[]>([]);
  const [fireParticles, setFireParticles] = useState<CustomCSS[]>([]);
  const rocketRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!startRef.current) return;
    const buttonRect = startRef.current.getBoundingClientRect();
    const initialStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${buttonRect.left + buttonRect.width / 2 - 16}px`,
      top: `${buttonRect.top + buttonRect.height / 2 - 16}px`,
      transform: 'rotate(-45deg)',
      transition: `transform ${PREPARE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      willChange: 'transform, opacity',
      zIndex: 9999,
      fontSize: '2rem',
      opacity: 1
    };
    setRocketStyle(initialStyle);
  }, [startRef]);

  useEffect(() => {
    if (rocketStyle.opacity === 0) return;

    // 1. Prepare for launch
    setTimeout(() => {
      setRocketStyle(prev => ({ ...prev, transform: 'rotate(-90deg) scale(1.2)' }));
    }, 50);

    // 2. Generate smoke
    const smokeInterval = setInterval(() => {
      if (!rocketRef.current) return;
      const currentRocketRect = rocketRef.current.getBoundingClientRect();
      const newSmoke: CustomCSS = {
        left: `${currentRocketRect.left + currentRocketRect.width / 2 - 20 + (Math.random() * 20 - 10)}px`,
        top: `${currentRocketRect.top + currentRocketRect.height - 10}px`,
        '--smoke-drift-x': `${(Math.random() - 0.5) * 80}px`,
        '--smoke-drift-y': `${Math.random() * 40 + 20}px`
      };
      setSmokePuffs(prev => [...prev.slice(-15), newSmoke]);
    }, 150);

    // 3. Launch
    setTimeout(() => {
      clearInterval(smokeInterval);
      if (!endRef.current || !rocketRef.current) return;

      const cardRect = endRef.current.getBoundingClientRect();
      const targetX = cardRect.left + cardRect.width / 2;
      const targetY = cardRect.top + cardRect.height / 2;
      
      const currentRocketRect = rocketRef.current.getBoundingClientRect();
      const startX = currentRocketRect.left + currentRocketRect.width / 2;
      const startY = currentRocketRect.top + currentRocketRect.height / 2;

      const deltaX = targetX - startX;
      const deltaY = targetY - startY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;

      setRocketStyle(prev => ({
        ...prev,
        transition: `transform ${FLIGHT_DURATION}ms cubic-bezier(0.5, 0, 1, 0.5), opacity 0.5s linear ${FLIGHT_DURATION - 500}ms`,
        transform: `translate(${deltaX}px, ${deltaY}px) rotate(${angle}deg) scale(0.5)`,
        opacity: 0,
      }));
    }, PREPARE_DURATION);

    // 4. Explode on impact
    setTimeout(() => {
      if (!endRef.current) return;
      const cardRect = endRef.current.getBoundingClientRect();
      const particleCount = 40;
      const colors = ['#FFC300', '#FF5733', '#C70039', '#FFFFFF', '#F9E79F'];
      const newParticles: CustomCSS[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 120 + 30;
        newParticles.push({
          left: `${cardRect.left + cardRect.width / 2 - 6}px`,
          top: `${cardRect.top + cardRect.height / 2 - 6}px`,
          '--fire-particle-x': `${Math.cos(angle) * radius}px`,
          '--fire-particle-y': `${Math.sin(angle) * radius}px`,
          '--fire-color': colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setFireParticles(newParticles);
      onAnimationComplete();
    }, PREPARE_DURATION + FLIGHT_DURATION - 200);

    // 5. Cleanup
    const totalDuration = PREPARE_DURATION + FLIGHT_DURATION + EXPLOSION_DURATION;
    const cleanupTimer = setTimeout(() => {
        setSmokePuffs([]);
        setFireParticles([]);
    }, totalDuration);

    return () => {
        clearInterval(smokeInterval);
        clearTimeout(cleanupTimer);
    };
  }, [startRef, endRef, onAnimationComplete, rocketStyle.opacity]);

  return (
    <>
      <span ref={rocketRef} style={rocketStyle}>🚀</span>
      {smokePuffs.map((style, i) => (
        <div key={i} className="smoke-puff" style={style} />
      ))}
      {fireParticles.map((style, i) => (
        <div key={i} className="fire-particle" style={style} />
      ))}
    </>
  );
};