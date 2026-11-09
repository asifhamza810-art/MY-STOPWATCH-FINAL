import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.55;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0);
    vec2 m = (uMouse - 0.5) * 0.35;

    float t = uTime * 0.045;
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(1.7, 9.2) + t * 0.8));
    vec2 r = vec2(
      fbm(p + 1.8 * q + vec2(1.7, 9.2) + t * 0.15 + m),
      fbm(p + 1.5 * q + vec2(8.3, 2.8) - t * 0.12 - m * 0.6)
    );
    float f = fbm(p + 2.4 * r);

    vec3 deep = vec3(0.039, 0.067, 0.157);
    vec3 mid = vec3(0.110, 0.145, 0.255);
    vec3 cyan = vec3(0.008, 0.518, 0.780);
    vec3 ocean = vec3(0.0, 0.467, 0.714);
    vec3 violet = vec3(0.22, 0.18, 0.42);
    vec3 amber = vec3(0.773, 0.608, 0.153);

    vec3 col = mix(deep, mid, smoothstep(0.2, 0.75, f));
    col = mix(col, cyan * 0.55 + ocean * 0.25, smoothstep(0.35, 0.85, r.x) * 0.65);
    col = mix(col, violet * 0.45, smoothstep(0.55, 0.95, r.y) * 0.35);
    col += amber * 0.08 * smoothstep(0.7, 1.0, q.x * f);
    col += cyan * 0.12 * pow(smoothstep(0.4, 1.0, f), 2.0);

    float vignette = smoothstep(1.25, 0.25, length(uv - 0.5));
    col *= 0.55 + 0.45 * vignette;
    col = mix(deep, col, 0.92);

    gl_FragColor = vec4(col, 1.0);
  }
`

function FluidPlane({ mouse }) {
  const mat = useRef()
  const { size } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    []
  )

  useFrame((state) => {
    if (!mat.current) return
    if (typeof document !== 'undefined' && document.hidden) return
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
    mat.current.uniforms.uMouse.value.lerp(mouse.current, 0.045)
    mat.current.uniforms.uRes.value.set(size.width, size.height)
  })

  return (
    <mesh scale={[2.4, 2.4, 1]}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

function CssFallback() {
  return <div className="fluid-fallback" aria-hidden="true" />
}

export default function FluidBackground({ className = '' }) {
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))
  const [reduceMotion, setReduceMotion] = useState(false)
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  if (reduceMotion || !webglOk) {
    return <div className={`fluid-root ${className}`}><CssFallback /></div>
  }

  return (
    <div className={`fluid-root ${className}`} aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0A1128')
        }}
        onError={() => setWebglOk(false)}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <FluidPlane mouse={mouse} />
        </Suspense>
      </Canvas>
      <div className="fluid-veil" />
    </div>
  )
}
