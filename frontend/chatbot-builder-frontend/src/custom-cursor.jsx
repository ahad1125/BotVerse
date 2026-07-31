import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Skip on touch devices — cursor effects don't make sense there
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const moveCursor = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleOver = (e) => {
      const target = e.target.closest("button, a, [role='button']");
      setIsHovering(Boolean(target));
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return null;
  }

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHovering ? 1.15 : 1,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {/* macOS-style arrow cursor */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          style={{ transform: "translate(-2px, -1px)" }}
        >
          <path
            d="M1 1 L1 16.5 L5.2 12.6 L7.9 19.2 L10.4 18.1 L7.7 11.6 L13.5 11.4 Z"
            fill="white"
            stroke="black"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </>
  );
}
