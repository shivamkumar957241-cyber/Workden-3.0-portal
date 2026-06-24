import React, { useEffect, useRef } from 'react';

export default function HardCaptchaGenerator({ onGenerate, captchaId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const captchaText = generateHardCaptcha();
      if (onGenerate) {
        onGenerate(captchaText);
      }
    }
  }, [captchaId]);

  const generateHardCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ===== BACKGROUND TEXTURE =====
    ctx.fillStyle = '#eaeaea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }
    
    // ===== CAPTCHA TEXT =====
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captchaText = '';
    
    for (let i = 0; i < 6; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // ===== CURVED + UNEVEN + OVERLAPPING TEXT =====
    let startX = 20;
    
    for (let i = 0; i < captchaText.length; i++) {
      const fontSize = Math.floor(Math.random() * 12 + 28);
      const x = startX + i * 35 + Math.random() * 8;
      const y = 50 + Math.sin(i) * 10 + Math.random() * 6;
      const angle = Math.random() * 0.6 - 0.3;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgb(
        ${Math.random() * 120},
        ${Math.random() * 120},
        ${Math.random() * 120}
      )`;
      ctx.fillText(captchaText[i], 0, 0);
      ctx.restore();
    }
    
    // ===== THICK CROSSING LINES =====
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = Math.random() * 3 + 2;
      ctx.beginPath();
      ctx.moveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.lineTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }
    
    // ===== RANDOM SHAPES =====
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 15 + 10,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    // ===== EXTRA NOISE DOTS =====
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }
    
    return captchaText;
  };

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={260}
        height={90}
        className="border-2 border-gray-400 rounded-lg bg-gray-100 shadow-md"
      />
    </div>
  );
}
