import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FlowerFall() {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 20,
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
      color: ['#FFB7C5', '#FFC0CB', '#FFD1DC', '#F8C8DC'][Math.floor(Math.random() * 4)]
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, rotate: p.rotation, opacity: 0 }}
          animate={{ 
            y: '110vh', 
            x: `${p.x + (Math.sin(p.id) * 20)}vw`,
            rotate: p.rotation + 360,
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear"
          }}
          style={{ 
            position: 'absolute',
            width: p.size,
            height: p.size,
          }}
        >
          <svg viewBox="0 0 32 32" fill={p.color} className="w-full h-full drop-shadow-sm opacity-60">
            <path d="M16 28.5L14.1 26.7C7.3 20.6 2.8 16.5 2.8 11.5C2.8 7.4 6 4.2 10.1 4.2C12.4 4.2 14.6 5.3 16 7.1C17.4 5.3 19.6 4.2 21.9 4.2C26 4.2 29.2 7.4 29.2 11.5C29.2 16.5 24.7 20.6 17.9 26.7L16 28.5Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
