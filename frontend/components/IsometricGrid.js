"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function IsometricGrid({ items = [] }) {
  const gridRef = useRef(null);

  useGSAP(() => {
    // Staggered entrances
    const elements = gsap.utils.toArray('.iso-item', gridRef.current);
    
    gsap.fromTo(elements, 
      {
        y: 100,
        opacity: 0,
        rotateX: 45,
        rotateZ: -20,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 30,
        rotateY: -20,
        duration: 1,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      }
    );
  }, { scope: gridRef });

  return (
    <div 
      className="w-full flex justify-center items-center py-20"
      style={{ perspective: "2000px" }}
    >
      <div 
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, index) => (
          <div 
            key={index}
            className="iso-item w-64 h-64 sm:w-80 sm:h-80 origin-center"
            style={{
              transform: "rotateX(30deg) rotateY(-20deg)",
              transformStyle: "preserve-3d",
              willChange: "transform, opacity",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
