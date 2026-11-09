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
  uniform vec2 uMouseVelocity;
  uniform vec2 uResolution;
  uniform float uReveal;

  // Hash & noise utilities
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

  // Multi-octave Fractional Brownian Motion
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p;
      a *= 0.52;
    }
    return v;
  }

  // Analytical Curl noise for organic liquid vorticity
  vec2 curl(vec2 p) {
    float eps = 0.08;
    float n1 = fbm(p + vec2(0.0, eps));
    float n2 = fbm(p - vec2(0.0, eps));
    float n3 = fbm(p + vec2(eps, 0.0));
    float n4 = fbm(p - vec2(eps, 0.0));
    return vec2((n1 - n2) / (2.0 * eps), -(n3 - n4) / (2.0 * eps));
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (uv - 0.5) * aspect * 2.2;

    // Time scaling for deliberate, luxurious liquid drift
    float t = uTime * 0.08;

    // Soft cursor impulse (only adds subtle local wake, never drives main flow)
    vec2 mousePos = (uMouse - 0.5) * aspect * 2.2;
    float distToMouse = length(p - mousePos);
    float mouseInfluence = smoothstep(1.1, 0.0, distToMouse) * length(uMouseVelocity) * 2.5;
    vec2 mouseWake = normalize(p - mousePos + 0.001) * mouseInfluence * 0.22;

    // 1. Multiple autonomously drifting fluid centers (Lissajous curves)
    vec2 flow1 = vec2(sin(t * 0.35) * 0.6, cos(t * 0.28) * 0.45);
    vec2 flow2 = vec2(cos(t * 0.42 + 1.7) * 0.55, sin(t * 0.38 + 0.8) * 0.5);
    vec2 flow3 = vec2(sin(t * 0.24 + 3.1) * 0.5, cos(t * 0.31 + 2.4) * 0.4);

    // 2. Liquid domain warping with curl vortices
    vec2 curlP = curl(p * 0.85 + flow1) * 0.65;
    vec2 q = vec2(
      fbm(p + curlP + flow2 + vec2(t * 0.3, t * 0.2)),
      fbm(p - curlP + flow3 + vec2(4.2, 2.1) - t * 0.25)
    );

    vec2 r = vec2(
      fbm(p + 2.4 * q + vec2(1.8, 8.4) + t * 0.18 + mouseWake),
      fbm(p + 1.9 * q + vec2(7.3, 3.2) - t * 0.22 - mouseWake * 0.7)
    );

    float f = fbm(p + 2.8 * r + t * 0.12);

    // 3. Floating organic fluid fields (3 distinct luminous regions)
    float region1 = smoothstep(1.4, 0.2, length(p - flow1 + q * 0.4));
    float region2 = smoothstep(1.5, 0.25, length(p - flow2 + r * 0.45));
    float region3 = smoothstep(1.3, 0.2, length(p - flow3));

    // 4. Acadiv Signature Stitch-Inspired Color Field
    vec3 deepMidnight = vec3(0.045, 0.125, 0.140); // #0B1F22
    vec3 midForest   = vec3(0.090, 0.294, 0.263); // #174B43
    vec3 livingTeal  = vec3(0.204, 0.725, 0.647); // #34B9A5
    vec3 softAqua    = vec3(0.368, 0.917, 0.831); // #5EEAD4
    vec3 electricLime= vec3(0.780, 0.929, 0.412); // #C7ED69
    vec3 cobalt      = vec3(0.008, 0.518, 0.780); // #0284C7
    vec3 softViolet  = vec3(0.459, 0.408, 0.847); // #7568D8

    // Layered translucent sheets interpolation
    vec3 color = mix(deepMidnight, midForest, smoothstep(0.12, 0.65, f));
    color = mix(color, livingTeal, smoothstep(0.22, 0.78, r.x) * (0.55 + 0.45 * region1));
    color = mix(color, cobalt, smoothstep(0.32, 0.85, r.y) * (0.45 + 0.4 * region2));
    color = mix(color, softViolet, smoothstep(0.50, 0.92, q.x) * 0.4);

    // Glowing Aqua and Electric Lime crest highlights
    float crest = pow(smoothstep(0.58, 0.90, f * r.x), 2.2);
    color += electricLime * crest * 0.75 * (0.7 + 0.3 * region3);
    color += softAqua * pow(smoothstep(0.42, 0.85, f), 2.0) * 0.4;

    // Natural fluid rim depth
    float vignette = smoothstep(1.45, 0.35, length(uv - 0.5));
    color *= (0.72 + 0.28 * vignette);

    // Fade-in reveal transition multiplier
    color *= uReveal;

    gl_FragColor = vec4(color, 1.0);
  }
`

function FluidMesh({ mouse, mouseVelocity, reveal }) {
  const meshRef = useRef()
  const matRef = useRef()
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseVelocity: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (!matRef.current) return
    if (typeof document !== 'undefined' && document.hidden) return
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    matRef.current.uniforms.uMouse.value.lerp(mouse.current, 0.05)
    matRef.current.uniforms.uMouseVelocity.value.lerp(mouseVelocity.current, 0.04)
    matRef.current.uniforms.uResolution.value.set(size.width, size.height)
    matRef.current.uniforms.uReveal.value = THREE.MathUtils.lerp(
      matRef.current.uniforms.uReveal.value,
      reveal ? 1 : 0,
      0.035
    )

    // Decaying mouse velocity disturbance so it naturally subsides
    mouseVelocity.current.multiplyScalar(0.92)
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
  const prevMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const mouseVelocity = useRef(new THREE.Vector2(0, 0))
  const [reduceMotion, setReduceMotion] = useState(false)
  const [webglOk, setWebglOk] = useState(true)
  const [revealed, setRevealed] = useState(false)

  // Subtle reveal delay after landing hero mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true)
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    const handleMove = (e) => {
      const currentX = e.clientX / window.innerWidth
      const currentY = 1 - e.clientY / window.innerHeight
      const vx = currentX - prevMouse.current.x
      const vy = currentY - prevMouse.current.y
      mouseVelocity.current.set(vx, vy)
      prevMouse.current.set(currentX, currentY)
      mouse.current.set(currentX, currentY)
    }

    const handleLeave = () => {
      mouseVelocity.current.set(0, 0)
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('pointerleave', handleLeave, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  if (reduceMotion || !webglOk) {
    return (
      <div
        className="fluid-hero-canvas"
        style={{
          background: 'radial-gradient(circle at 45% 35%, #34B9A5 0%, #174B43 45%, #0E2528 85%)',
          opacity: revealed ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      />
    )
  }

  return (
    <div
      className="fluid-hero-canvas"
      aria-hidden="true"
      style={{
        opacity: revealed ? 1 : 0,
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        onError={() => setWebglOk(false)}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <FluidMesh mouse={mouse} mouseVelocity={mouseVelocity} reveal={revealed} />
        </Suspense>
      </Canvas>
    </div>
  )
}
