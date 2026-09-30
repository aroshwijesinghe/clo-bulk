"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function GlassCard({ children, className = "", tilt = false, float = false }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useGSAP(() => {
    if (!cardRef.current || !float) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.to(cardRef.current, {
      y: "-=8",
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: Math.random() * 0.5,
    });
  }, { scope: cardRef, dependencies: [float] });

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (!tilt || !cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-3xl bg-[var(--surface)] shadow-[var(--neu-shadow-raised)] transition-all duration-300 ${hovered ? 'shadow-[var(--neu-shadow-raised-lg)]' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Soft electric sheen on hover */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-cyan-400/5 to-transparent" 
        style={{ opacity: hovered ? 1 : 0 }} 
      />
      <div className="relative z-10" style={{ transform: "translateZ(25px)" }}>
        {children}
      </div>
    </div>
  );
}
