
import React, { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { createPortal } from 'react-dom';

const FlyingCartIcon = ({ sourcePosition, targetPosition, onComplete }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    if (!sourcePosition || !targetPosition || !iconRef.current) return;

    const icon = iconRef.current;
    const startX = sourcePosition.x;
    const startY = sourcePosition.y;
    const endX = targetPosition.x;
    const endY = targetPosition.y;

    icon.style.left = `${startX}px`;
    icon.style.top = `${startY}px`;
    icon.style.opacity = '1';
    icon.style.transform = 'scale(1)';

    requestAnimationFrame(() => {
      icon.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      icon.style.left = `${endX}px`;
      icon.style.top = `${endY}px`;
      icon.style.opacity = '0.8';
      icon.style.transform = 'scale(0.6)';
    });

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [sourcePosition, targetPosition, onComplete]);

  return createPortal(
    <div
      ref={iconRef}
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <ShoppingBag
        size={32}
        style={{
          color: '#2563EB',
          filter: 'drop-shadow(0 4px 8px rgba(0, 123, 255, 0.4))',
        }}
      />
    </div>,
    document.body
  );
};

export default FlyingCartIcon;
