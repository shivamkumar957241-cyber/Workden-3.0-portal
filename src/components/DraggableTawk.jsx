import React, { useEffect } from "react";

export default function DraggableTawk({ userId }) {
  useEffect(() => {
    if (!userId) return;

    let isDragging = false;
    let startX, startY, startLeft, startTop;
    let tawkWidget = null;

    const findTawkWidget = () => {
      // Try multiple selectors
      const widget = document.querySelector('#tawk-bubble-container') ||
                     document.querySelector('iframe[title*="chat"]')?.parentElement ||
                     document.querySelector('[id*="tawk"]');
      return widget;
    };

    const applyPosition = () => {
      if (!tawkWidget) return;
      
      const saved = localStorage.getItem(`tawk_position_${userId}`);
      if (saved) {
        try {
          const pos = JSON.parse(saved);
          tawkWidget.style.cssText += `
            position: fixed !important;
            left: ${pos.left}px !important;
            top: ${pos.top}px !important;
            right: auto !important;
            bottom: auto !important;
            transform: none !important;
          `;
        } catch (e) {}
      }
    };

    const onMouseDown = (e) => {
      if (!tawkWidget) return;
      
      // Check if chat is open
      const chatPanel = document.querySelector('[class*="tawk-chat-panel"], [class*="ChatPanel"]');
      if (chatPanel && chatPanel.offsetHeight > 100) return; // Chat is open
      
      isDragging = true;
      startX = e.clientX || e.touches?.[0]?.clientX;
      startY = e.clientY || e.touches?.[0]?.clientY;
      
      const rect = tawkWidget.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      tawkWidget.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging || !tawkWidget) return;
      
      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const clientY = e.clientY || e.touches?.[0]?.clientY;
      
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;
      
      // Boundaries
      const maxLeft = window.innerWidth - tawkWidget.offsetWidth;
      const maxTop = window.innerHeight - tawkWidget.offsetHeight;
      
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      
      tawkWidget.style.cssText += `
        left: ${newLeft}px !important;
        top: ${newTop}px !important;
        right: auto !important;
        bottom: auto !important;
        position: fixed !important;
        transform: none !important;
      `;
      
      e.preventDefault();
    };

    const onMouseUp = () => {
      if (!isDragging || !tawkWidget) return;
      
      isDragging = false;
      tawkWidget.style.cursor = 'grab';
      
      const rect = tawkWidget.getBoundingClientRect();
      const pos = { left: rect.left, top: rect.top };
      localStorage.setItem(`tawk_position_${userId}`, JSON.stringify(pos));
    };

    // Setup
    const setupDraggable = () => {
      tawkWidget = findTawkWidget();
      if (!tawkWidget) return false;
      
      tawkWidget.style.cursor = 'grab';
      tawkWidget.style.userSelect = 'none';
      tawkWidget.style.zIndex = '9999';
      
      applyPosition();
      
      // Mouse events
      tawkWidget.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      // Touch events
      tawkWidget.addEventListener('touchstart', onMouseDown, { passive: false });
      document.addEventListener('touchmove', onMouseMove, { passive: false });
      document.addEventListener('touchend', onMouseUp);
      
      return true;
    };

    // Keep trying until Tawk.to loads
    const interval = setInterval(() => {
      if (setupDraggable()) {
        clearInterval(interval);
      }
    }, 300);

    return () => {
      clearInterval(interval);
      if (tawkWidget) {
        tawkWidget.removeEventListener('mousedown', onMouseDown);
        tawkWidget.removeEventListener('touchstart', onMouseDown);
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
    };
  }, [userId]);

  return null;
}
