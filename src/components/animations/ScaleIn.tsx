"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
}

export default function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  scale = 0.8 
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale },
        { opacity: 1, scale: 1, duration, delay, ease: "back.out(1.7)" }
      );
    }
  }, [delay, duration, scale]);

  return <div ref={ref}>{children}</div>;
}