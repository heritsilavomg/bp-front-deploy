"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface SlideInProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "top" | "bottom";
  delay?: number;
  duration?: number;
}

export default function SlideIn({ 
  children, 
  direction = "left", 
  delay = 0, 
  duration = 0.8 
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const from: any = { opacity: 0 };
      
      switch (direction) {
        case "left":
          from.x = -100;
          break;
        case "right":
          from.x = 100;
          break;
        case "top":
          from.y = -100;
          break;
        case "bottom":
          from.y = 100;
          break;
      }

      gsap.fromTo(
        ref.current,
        from,
        { opacity: 1, x: 0, y: 0, duration, delay, ease: "power3.out" }
      );
    }
  }, [direction, delay, duration]);

  return <div ref={ref}>{children}</div>;
}