import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [bubbles, setBubbles] = useState<{ id: number; size: number; left: string; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: Math.random() * 30 + 10,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 opacity-90" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white opacity-10" />

      {/* Animated Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-[-100px] rounded-full bg-teal-500/10 border border-white/5 animate-bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: bubble.left,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* Ambient Glows */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]"
      />
    </div>
  );
}
