'use client'

import { Canvas } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import * as THREE from 'three'

function SceneBackground() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.4} />
      <Grid
        renderOrder={-1}
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.3}
        sectionSize={3}
        sectionThickness={0.5}
        sectionColor={[0.3, 0.3, 0.3]}
        fadeDistance={50}
      />
    </>
  )
}

interface Interactive3DGridBgProps {
  className?: string
  blur?: number
  opacity?: number
}

export default function Interactive3DGridBg({
  className = "absolute inset-0 -z-10",
  blur = 8,
  opacity = 0.4
}: Interactive3DGridBgProps) {
  return (
    <div
      className={className}
      style={{
        filter: `blur(${blur}px)`,
        opacity: opacity,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        camera={{ position: [20, 20, 20], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: false, alpha: true }}
      >
        <SceneBackground />
      </Canvas>
    </div>
  )
}
