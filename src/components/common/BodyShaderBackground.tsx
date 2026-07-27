'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ShaderPlane, EnergyRing } from '@/components/ui/background-paper-shaders';

export default function BodyShaderBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full bg-[#17191c]">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 75 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.5} />
        <ShaderPlane position={[0, 0, 0]} color1="#50524a" color2="#ffffff" />
        <EnergyRing radius={1.8} position={[0, 0, 0.2]} />
      </Canvas>
    </div>
  );
}
