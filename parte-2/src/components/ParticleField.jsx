import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CODE_SNIPPETS = [
  'def train()', 'import torch', 'model.fit()', 'print("AI")',
  'neural_net', 'gradient', 'loss.backward()', 'optimizer.step()',
  'import ai', 'for epoch', 'tensor([1])', 'accuracy',
  'def predict', 'dataset', 'embeddings', 'transform',
]

export default function ParticleField({ mousePos }) {
  const pointsRef = useRef()
  const { size } = useThree()
  const count = 180

  const { positions, velocities, sizes, colors, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const col = new Float32Array(count * 3)
    const ph = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5

      vel[i * 3] = (Math.random() - 0.5) * 0.006
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.006 + 0.003
      vel[i * 3 + 2] = 0

      sz[i] = Math.random() * 3 + 1
      ph[i] = Math.random() * Math.PI * 2

      // Roxo colors: variação entre roxo escuro e claro
      const purpleVariation = 0.4 + Math.random() * 0.6
      col[i * 3] = purpleVariation * 0.68      // R: roxo (0-1)
      col[i * 3 + 1] = purpleVariation * 0.33  // G: roxo (0-0.33)
      col[i * 3 + 2] = purpleVariation * 0.97  // B: roxo (0-1)
    }
    return { positions: pos, velocities: vel, sizes: sz, colors: col, phases: ph }
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    const pos = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3] + Math.sin(t * 0.4 + phases[i]) * 0.002
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += Math.cos(t * 0.3 + phases[i]) * 0.001

      if (pos[i * 3 + 1] > 12) pos[i * 3 + 1] = -12
      if (pos[i * 3] > 16) pos[i * 3] = -16
      if (pos[i * 3] < -16) pos[i * 3] = 16
    }

    // Mouse repulsion
    if (mousePos.current) {
      const mx = (mousePos.current.x / window.innerWidth - 0.5) * 20
      const my = -(mousePos.current.y / window.innerHeight - 0.5) * 14

      for (let i = 0; i < count; i++) {
        const dx = pos[i * 3] - mx
        const dy = pos[i * 3 + 1] - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 4) {
          const force = (4 - dist) / 4 * 0.04
          pos[i * 3] += dx * force
          pos[i * 3 + 1] += dy * force
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}