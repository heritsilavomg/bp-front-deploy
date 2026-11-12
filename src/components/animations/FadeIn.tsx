"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}

export default function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.8, 
  y = 30 
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, delay, ease: "power3.out" }
      );
    }
  }, [delay, duration, y]);

  return <div ref={ref}>{children}</div>;
}