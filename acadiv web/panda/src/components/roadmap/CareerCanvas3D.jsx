import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

// Distinct spatial geometries based on milestone type / stage
function NodeGeometry({ isDecisionPoint, status }) {
  if (isDecisionPoint) {
    return <octahedronGeometry args={[0.7, 0]} />
  }
  if (status === 'done') {
    return <cylinderGeometry args={[0.65, 0.65, 0.35, 16]} />
  }
  return <boxGeometry args={[1.5, 0.85, 0.3]} />
}

function NodeMesh({ node, index, total, isSelected, onClick }) {
  const meshRef = useRef()

  // Warm Editorial Node Palette
  const statusColors = {
    done: '#34B9A5',        // Living Teal
    in_progress: '#C7ED69', // Electric Lime
    planned: '#174B43',     // Deep Forest
    skipped: '#8E9E9F',     // Muted Gray
  }

  const baseColor = statusColors[node.status] || '#174B43'

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.75
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.08)
      }
    }
  })

  // S-Curve 3D pathway layout
  const spacing = 2.8
  const x = (index - Math.floor(total / 2)) * spacing
  const y = Math.sin(index * 1.2) * 0.6
  const z = (index % 2 === 0 ? 0.3 : -0.3)

  const labelTitle = node.title ? node.title.split(':')[0].replace('Stage ', 'S') : `Node ${index + 1}`
  const subLabel = node.title && node.title.includes(':') ? node.title.split(':')[1].trim() : ''

  return (
    <group position={[x, y, z]}>
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.35}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation()
            onClick(node)
          }}
          style={{ cursor: 'pointer' }}
        >
          <NodeGeometry isDecisionPoint={node.isDecisionPoint} status={node.status} />
          <meshStandardMaterial
            color={isSelected ? '#174B43' : '#0E2528'}
            emissive={isSelected ? '#C7ED69' : baseColor}
            emissiveIntensity={isSelected ? 0.85 : 0.4}
            roughness={0.25}
            metalness={0.65}
          />
        </mesh>

        {/* Status Indicator Beacon */}
        <mesh position={[0, 0.68, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={node.status === 'in_progress' ? 1.0 : 0.6}
          />
        </mesh>

        {/* Milestone Typography in 3D Space */}
        <Text
          position={[0, -0.05, 0.22]}
          fontSize={0.16}
          maxWidth={1.35}
          color="#FBFAF6"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          fontWeight={700}
        >
          {`${labelTitle}\n${subLabel.length > 22 ? subLabel.slice(0, 20) + '…' : subLabel}`}
        </Text>
      </Float>
    </group>
  )
}

function PathwaySpline({ count }) {
  const points = useMemo(() => {
    const pts = []
    const spacing = 2.8
    for (let i = 0; i < count; i++) {
      const x = (i - Math.floor(count / 2)) * spacing
      const y = Math.sin(i * 1.2) * 0.6
      const z = (i % 2 === 0 ? 0.3 : -0.3)
      pts.push(new THREE.Vector3(x, y, z))
    }
    return pts
  }, [count])

  const curve = useMemo(() => {
    if (points.length < 2) return null
    return new THREE.CatmullRomCurve3(points)
  }, [points])

  const linePoints = useMemo(() => {
    if (!curve) return []
    return curve.getPoints(50)
  }, [curve])

  if (linePoints.length < 2) return null

  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)

  return (
    <line geometry={lineGeo}>
      <lineBasicMaterial color="#34B9A5" transparent opacity={0.6} linewidth={3} />
    </line>
  )
}

export default function CareerCanvas3D({ milestones = [], selectedNode, onSelectNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '420px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, #174B43 0%, #0E2528 85%)',
        position: 'relative',
        border: '1.5px solid var(--border-strong)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(14, 37, 40, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          color: '#FBFAF6',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C7ED69' }} />
        <span>3D Spatial Navigator • Drag to orbit • Click nodes to view requirements</span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-6, -4, 4]} color="#34B9A5" intensity={2.0} />
        <pointLight position={[6, 4, -4]} color="#C7ED69" intensity={1.5} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <PathwaySpline count={milestones.length} />
            {milestones.map((node, idx) => (
              <NodeMesh
                key={node._id || idx}
                node={node}
                index={idx}
                total={milestones.length}
                isSelected={selectedNode?._id === node._id}
                onClick={onSelectNode}
              />
            ))}
          </group>
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxDistance={14}
          minDistance={3.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.2}
        />
      </Canvas>
    </div>
  )
}
