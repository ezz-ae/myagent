'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface AnimatedBoxProps {
  initialPosition: [number, number, number]
}

function AnimatedBox({ initialPosition }: AnimatedBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(...initialPosition))
  const currentPosition = useRef(new THREE.Vector3(...initialPosition))

  const getAdjacentIntersection = (current: THREE.Vector3) => {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    const randomDirection = directions[Math.floor(Math.random() * directions.length)]
    return new THREE.Vector3(
      current.x + randomDirection[0] * 3,
      0.5,
      current.z + randomDirection[1] * 3
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const newPosition = getAdjacentIntersection(currentPosition.current)
      newPosition.x = Math.max(-15, Math.min(15, newPosition.x))
      newPosition.z = Math.max(-15, Math.min(15, newPosition.z))
      setTargetPosition(newPosition)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      currentPosition.current.lerp(targetPosition, 0.1)
      meshRef.current.position.copy(currentPosition.current)
    }
  })

  return (
    <mesh ref={meshRef} position={initialPosition}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial attach="material" color="#000000" linewidth={2} />
      </lineSegments>
    </mesh>
  )
}

function Scene() {
  const initialPositions: [number, number, number][] = [
    [-9, 0.5, -9],
    [-3, 0.5, -3],
    [0, 0.5, 0],
    [3, 0.5, 3],
    [9, 0.5, 9],
    [-6, 0.5, 6],
    [6, 0.5, -6],
    [-12, 0.5, 0],
    [12, 0.5, 0],
    [0, 0.5, 12],
  ]

  return (
    <>
      <OrbitControls
        autoRotate
        autoRotateSpeed={2}
        enableZoom={true}
        enablePan={true}
      />
      <ambientLight intensity={0.8} />
      <pointLight position={[15, 15, 15]} intensity={1.2} />
      <pointLight position={[-15, -15, 15]} intensity={0.6} color="#6b7fff" />
      <Grid
        renderOrder={-1}
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.8}
        cellColor={[0.4, 0.4, 0.5]}
        sectionSize={3}
        sectionThickness={1.5}
        sectionColor={[0.6, 0.6, 0.8]}
        fadeDistance={50}
        fadeStrength={1.2}
      />
      {initialPositions.map((position, index) => (
        <AnimatedBox key={index} initialPosition={position} />
      ))}
    </>
  )
}

interface Interactive3DGridProps {
  showOverlay?: boolean
  overlayContent?: React.ReactNode
  className?: string
}

export default function Interactive3DGrid({
  showOverlay = false,
  overlayContent,
  className = "w-full h-full"
}: Interactive3DGridProps) {
  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      <Canvas
        shadows
        camera={{ position: [30, 30, 30], fov: 50 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>

      {showOverlay && overlayContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          {overlayContent}
        </div>
      )}
    </div>
  )
}
