"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface StaggerChildrenProps {
  children: React.ReactNode;
  stagger?: number;
  duration?: number;
}

export default function StaggerChildren({ 
  children, 
  stagger = 0.1, 
  duration = 0.6 
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const elements = ref.current.children;
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration, 
          stagger, 
          ease: "power2.out" 
        }
      );
    }
  }, [stagger, duration]);

  return <div ref={ref}>{children}</div>;
}