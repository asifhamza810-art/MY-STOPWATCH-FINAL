import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  // Hash & smooth procedural noise
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = dot(hash2(i + vec2(0.0, 0.0)) - 0.5, f - vec2(0.0, 0.0));
    float b = dot(hash2(i + vec2(1.0, 0.0)) - 0.5, f - vec2(1.0, 0.0));
    float c = dot(hash2(i + vec2(0.0, 1.0)) - 0.5, f - vec2(0.0, 1.0));
    float d = dot(hash2(i + vec2(1.0, 1.0)) - 0.5, f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) + 0.5;
  }

  // Fractional Brownian Motion for multi-scale liquid textures
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (uv - 0.5) * aspect * 2.2;

    // Pointer velocity influence with smooth damping
    vec2 mouseOffset = (uMouse - 0.5) * aspect * 0.45;
    float t = uTime * 0.065;

    // Domain warping (turbulent fluid curls)
    vec2 q = vec2(
      fbm(p + vec2(t * 0.5, t * 0.3)),
      fbm(p + vec2(5.2, 1.3) - t * 0.4)
    );

    vec2 r = vec2(
      fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.2 + mouseOffset),
      fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 0.25 - mouseOffset * 0.7)
    );

    float f = fbm(p + 2.6 * r + t * 0.1);

    // Acadiv Signature Living Fluid Palette
    vec3 deepForest = vec3(0.055, 0.145, 0.157); // #0E2528
    vec3 midTeal    = vec3(0.090, 0.294, 0.263); // #174B43
    vec3 livingTeal = vec3(0.204, 0.725, 0.647); // #34B9A5
    vec3 electricLime = vec3(0.780, 0.929, 0.412); // #C7ED69
    vec3 cobaltBlue = vec3(0.008, 0.518, 0.780); // #0284C7
    vec3 violet     = vec3(0.459, 0.408, 0.847); // #7568D8

    // Organic color interpolation
    vec3 color = mix(deepForest, midTeal, smoothstep(0.1, 0.65, f));
    color = mix(color, livingTeal, smoothstep(0.25, 0.75, r.x) * 0.85);
    color = mix(color, cobaltBlue, smoothstep(0.35, 0.85, r.y) * 0.65);
    color = mix(color, violet, smoothstep(0.55, 0.95, q.x) * 0.45);

    // Radiant Electric Lime highlights on flowing crests
    float crest = pow(smoothstep(0.62, 0.92, f * r.x), 2.2);
    color += electricLime * crest * 0.75;

    // Glowing living teal illumination
    color += livingTeal * pow(smoothstep(0.45, 0.88, f), 2.0) * 0.35;

    // Subtle edge vignette
    float vignette = smoothstep(1.4, 0.35, length(uv - 0.5));
    color *= 0.75 + 0.25 * vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`

function FluidMesh({ mouse }) {
  const meshRef = useRef()
  const matRef = useRef()
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  )

  useFrame((state) => {
    if (!matRef.current) return
    if (typeof document !== 'undefined' && document.hidden) return
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    matRef.current.uniforms.uMouse.value.lerp(mouse.current, 0.05)
    matRef.current.uniforms.uResolution.value.set(size.width, size.height)
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export default function FluidLandingBackground() {
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
    const handleMove = (e) => {
      mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  if (reduceMotion || !webglOk) {
    return (
      <div
        className="fluid-hero-canvas"
        style={{
          background: 'radial-gradient(circle at 40% 30%, #34B9A5 0%, #174B43 45%, #0E2528 85%)',
        }}
      />
    )
  }

  return (
    <div className="fluid-hero-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        onError={() => setWebglOk(false)}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <FluidMesh mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  )
}

