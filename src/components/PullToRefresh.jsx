import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (refreshing || startY.current === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
        setPulling(true);
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !refreshing) {
        setRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setRefreshing(false);
        }
      }
      setPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity"
        style={{
          height: `${pullDistance}px`,
          opacity: pulling ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <div className={`bg-blue-500 text-white rounded-full p-3 shadow-lg ${refreshing ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${pulling ? pullDistance : 0}px)`, transition: pulling ? 'none' : 'transform 0.3s' }}>
        {children}
      </div>
    </div>
  );
}
