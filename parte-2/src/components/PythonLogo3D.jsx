import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Torus, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function GlowRing({ radius, tube, rotation, speed, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = rotation[0] + clock.getElapsedTime() * speed
      ref.current.rotation.y = rotation[1] + clock.getElapsedTime() * speed * 0.7
    }
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.6}
        wireframe={false}
      />
    </mesh>
  )
}

function FloatingOrb({ position, scale, speed, phase }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.3
      ref.current.position.x = position[0] + Math.cos(t * speed * 0.7 + phase) * 0.2
      ref.current.rotation.y = t * 0.5
    }
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <MeshDistortMaterial
        color="#a855f7"
        emissive="#9333ea"
        emissiveIntensity={0.8}
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

function CoreSphere({ mousePos }) {
  const ref = useRef()
  const targetRot = useRef({ x: 0, y: 0 })

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      if (mousePos.current) {
        targetRot.current.x = -(mousePos.current.y / window.innerHeight - 0.5) * 0.6
        targetRot.current.y = (mousePos.current.x / window.innerWidth - 0.5) * 0.6
      }
      ref.current.rotation.x += (targetRot.current.x - ref.current.rotation.x) * 0.05
      ref.current.rotation.y += (targetRot.current.y + t * 0.3 - ref.current.rotation.y) * 0.05
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1.4, 4]} />
        <MeshDistortMaterial
          color="#3d1a5f"
          emissive="#a855f7"
          emissiveIntensity={0.15}
          distort={0.25}
          speed={1.5}
          roughness={0.05}
          metalness={1}
          wireframe={false}
        />
      </mesh>
      {/* wireframe overlay */}
      <mesh>
        <icosahedronGeometry args={[1.42, 2]} />
        <meshBasicMaterial
          color="#a855f7"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

export default function PythonLogo3D({ mousePos }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      {/* Point lights */}
      <pointLight color="#a855f7" intensity={4} distance={10} position={[2, 2, 2]} />
      <pointLight color="#9333ea" intensity={2} distance={8} position={[-2, -1, 1]} />
      <pointLight color="#7e22ce" intensity={3} distance={12} position={[0, 0, -3]} />

      {/* Core */}
      <CoreSphere mousePos={mousePos} />

      {/* Rings */}
      <GlowRing radius={2.2} tube={0.018} rotation={[Math.PI / 2, 0, 0]} speed={0.25} color="#a855f7" />
      <GlowRing radius={2.5} tube={0.012} rotation={[Math.PI / 4, Math.PI / 6, 0]} speed={-0.18} color="#9333ea" />
      <GlowRing radius={2.8} tube={0.008} rotation={[Math.PI / 6, Math.PI / 3, 0]} speed={0.12} color="#a855f7" />

      {/* Floating orbs */}
      <FloatingOrb position={[2.8, 0.5, 0]} scale={0.15} speed={1.2} phase={0} />
      <FloatingOrb position={[-2.6, -0.4, 0.5]} scale={0.12} speed={0.9} phase={2} />
      <FloatingOrb position={[0.5, 2.8, -0.5]} scale={0.1} speed={1.5} phase={4} />
      <FloatingOrb position={[-1.8, 2.2, 0]} scale={0.08} speed={1.1} phase={1} />
      <FloatingOrb position={[2.2, -2, 0.3]} scale={0.09} speed={0.8} phase={3} />
    </group>
  )
}
