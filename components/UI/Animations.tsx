"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

/**
 * FadeIn - Fade in animation wrapper
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 300,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * SlideIn - Slide in animation wrapper
 */
export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 300,
  distance = 20,
  className = "",
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const transforms = {
    up: `translateY(${isVisible ? 0 : distance}px)`,
    down: `translateY(${isVisible ? 0 : -distance}px)`,
    left: `translateX(${isVisible ? 0 : distance}px)`,
    right: `translateX(${isVisible ? 0 : -distance}px)`,
  };

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: transforms[direction],
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn - Scale in animation wrapper
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  initialScale = 0.95,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `scale(${isVisible ? 1 : initialScale})`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * StaggerChildren - Staggered animation for child elements
 */
export function StaggerChildren({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  className = "",
}: {
  children: ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <SlideIn key={index} delay={initialDelay + index * staggerDelay}>
          {child}
        </SlideIn>
      ))}
    </div>
  );
}

/**
 * AnimateOnScroll - Animate when element enters viewport
 */
export function AnimateOnScroll({
  children,
  animation = "fadeIn",
  threshold = 0.1,
  className = "",
}: {
  children: ReactNode;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "scaleIn";
  threshold?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const animationStyles: Record<string, React.CSSProperties> = {
    fadeIn: {
      opacity: isVisible ? 1 : 0,
      transition: "opacity 500ms ease-out",
    },
    slideUp: {
      opacity: isVisible ? 1 : 0,
      transform: `translateY(${isVisible ? 0 : 30}px)`,
      transition: "opacity 500ms ease-out, transform 500ms ease-out",
    },
    slideLeft: {
      opacity: isVisible ? 1 : 0,
      transform: `translateX(${isVisible ? 0 : 30}px)`,
      transition: "opacity 500ms ease-out, transform 500ms ease-out",
    },
    scaleIn: {
      opacity: isVisible ? 1 : 0,
      transform: `scale(${isVisible ? 1 : 0.9})`,
      transition: "opacity 500ms ease-out, transform 500ms ease-out",
    },
  };

  return (
    <div ref={ref} className={className} style={animationStyles[animation]}>
      {children}
    </div>
  );
}

/**
 * Pulse - Pulsing animation for attention
 */
export function Pulse({
  children,
  color = "primary",
  className = "",
}: {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "error";
  className?: string;
}) {
  const colors = {
    primary: "bg-primary-400",
    success: "bg-green-400",
    warning: "bg-amber-400",
    error: "bg-red-400",
  };

  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-75 animate-ping`}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/**
 * Shimmer - Shimmer effect for loading states
 */
export function Shimmer({
  width = "100%",
  height = 20,
  className = "",
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{
          animation: "shimmer 2s infinite",
        }}
      />
    </div>
  );
}

/**
 * CountUp - Animated number counter
 */
export function CountUp({
  end,
  start = 0,
  duration = 1000,
  prefix = "",
  suffix = "",
  className = "",
}: {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const startTime = Date.now();
    const range = end - start;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(start + range * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, start, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * TypeWriter - Typewriter text effect
 */
export function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  className = "",
  onComplete,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;

    const startTyping = () => {
      timeout = setTimeout(function type() {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
          timeout = setTimeout(type, speed);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);
    };

    const delayTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(timeout);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-current animate-pulse ml-0.5" />
      )}
    </span>
  );
}

/**
 * Confetti - Simple confetti animation
 */
export function Confetti({
  active = false,
  duration = 3000,
  particleCount = 50,
}: {
  active?: boolean;
  duration?: number;
  particleCount?: number;
}) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; color: string; delay: number; size: number }>
  >([]);

  useEffect(() => {
    if (active) {
      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
      ];
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timeout);
    }
  }, [active, duration, particleCount]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
