import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnalogClockProps {
  uptimeSeconds: number;
}

export default function AnalogClock({ uptimeSeconds }: AnalogClockProps) {
  const [displaySeconds, setDisplaySeconds] = useState(uptimeSeconds);

  useEffect(() => {
    setDisplaySeconds(uptimeSeconds);
  }, [uptimeSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = displaySeconds % 60;
  const minutes = (displaySeconds / 60) % 60;
  const hours = (displaySeconds / 3600) % 12;

  const secondsDegrees = seconds * 6;
  const minutesDegrees = minutes * 6 + seconds * 0.1;
  const hoursDegrees = hours * 30 + minutes * 0.5;

  return (
    <div className="relative w-24 h-24 rounded-full border-[3px] border-teal-400/50 flex items-center justify-center bg-slate-900/60 shadow-[0_0_30px_rgba(20,184,166,0.4),inset_0_0_20px_rgba(20,184,166,0.2)] backdrop-blur-xl group-hover:scale-110 transition-transform duration-700 overflow-hidden">
      {/* Dynamic Water/Bubble Effect Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: `${Math.random() * 100}%`,
              bottom: "-10%",
            }}
            animate={{
              y: -120,
              opacity: [0, 0.5, 0],
              x: Math.random() * 20 - 10,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Clock numbers (12, 3, 6, 9) */}
      {[12, 3, 6, 9].map((num) => (
        <div
          key={num}
          className="absolute text-[12px] font-black text-teal-300 font-mono z-0"
          style={{
            transform: `rotate(${num * 30}deg) translateY(-34px) rotate(-${num * 30}deg)`,
          }}
        >
          {num}
        </div>
      ))}

      {/* Ticks */}
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${i % 5 === 0 ? 'w-[2px] h-2 bg-teal-400/80' : 'w-[1px] h-1 bg-teal-500/30'}`}
          style={{
            transform: `rotate(${i * 6}deg) translateY(-42px)`,
          }}
        />
      ))}

      {/* Hour Hand (Shark Tail style) */}
      <motion.div
        className="absolute w-1.5 h-7 bg-gradient-to-t from-teal-500 via-teal-400 to-teal-300 rounded-full z-10"
        style={{
          originY: "100%",
          bottom: "50%",
          boxShadow: "0 0 10px rgba(45, 212, 191, 0.5)"
        }}
        animate={{ rotate: hoursDegrees }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-300 rounded-full blur-[2px] opacity-50" />
      </motion.div>

      {/* Minute Hand (Trident style) */}
      <motion.div
        className="absolute w-1 h-11 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-200 rounded-full z-10"
        style={{
          originY: "100%",
          bottom: "50%",
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)"
        }}
        animate={{ rotate: minutesDegrees }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {/* Second Hand (Gura's Spear/Red highlight) */}
      <motion.div
        className="absolute w-0.5 h-13 bg-rose-500 rounded-full z-20"
        style={{
          originY: "calc(100% - 4px)",
          bottom: "50%",
          translateY: "4px"
        }}
        animate={{ rotate: secondsDegrees }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-rose-500 rounded-t-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full" />
      </motion.div>

      {/* Center Cap with Shark Fin Icon */}
      <div className="absolute w-5 h-5 bg-slate-900 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] z-30 flex items-center justify-center border border-teal-500/50">
        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_#2dd4bf]" />
      </div>

      {/* Outer Glass Ring */}
      <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none" />
      <div className="absolute inset-[2px] border border-black/20 rounded-full pointer-events-none" />
    </div>
  );
}
