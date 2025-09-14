"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Track mouse/touch
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      setCoords({
        x: clientX / window.innerWidth - 0.5,
        y: clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Orb 1 */}
      <motion.div
        animate={{
          x: coords.x * 60,
          y: coords.y * 60,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/20 blur-3xl"
      />

      {/* Orb 2 */}
      <motion.div
        animate={{
          x: coords.x * -80,
          y: coords.y * -40,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-500/20 blur-3xl"
      />

      {/* Orb 3 */}
      <motion.div
        animate={{
          x: coords.x * 40,
          y: coords.y * -60,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 25 }}
        className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-cyan-400/20 to-teal-500/30 blur-3xl"
      />
    </div>
  );
}
