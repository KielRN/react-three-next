'use client'

import { useGLTF, Billboard, Text, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export function Duck(props) {
  const { scene } = useGLTF('/duck.glb')

  useFrame((state, delta) => (scene.rotation.y += delta))

  return <primitive object={scene} {...props} />
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
}

export function Rocket({ route = '/', onToggleContactForm, onToggleProductsCard, ...props }) {
  const { scene } = useGLTF('/h-iia_-_launch_vehicle_-_rocket.glb')
  const router = useRouter()
  const [nextHovered, setNextHovered] = useState(false)
  const [contactHovered, setContactHovered] = useState(false)
  const [productsHovered, setProductsHovered] = useState(false)
  const groupRef = useRef()
  
  useCursor(nextHovered || contactHovered || productsHovered)
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Apply hovering animation to the group
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
      // Apply rotation to the group
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
      
      {/* HOME Label */}
      <Billboard
        position={[6, 10, 2]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh
          onClick={(e) => { e.stopPropagation(); router.push('/blog'); }}
          onPointerOver={(e) => { e.stopPropagation(); setNextHovered(true); }}
          onPointerOut={() => setNextHovered(false)}
        >
          {/* Star Trek-inspired angled box with glow effect */}
          <RoundedBox args={[3.5, 1.5, 0.1]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
            <meshBasicMaterial color={nextHovered ? "#0e2042" : "black"} transparent opacity={0.9} />
          </RoundedBox>
          {/* Border with glow effect */}
          <RoundedBox args={[3.6, 1.6, 0.05]} radius={0.15} smoothness={4} position={[0, 0, -0.01]}>
            <meshStandardMaterial
              color="#2c75ff"
              emissive="#2c75ff"
              emissiveIntensity={nextHovered ? 2 : 1}
              transparent
              opacity={0.7}
            />
          </RoundedBox>
          {/* Bottom accent bar */}
          <mesh position={[0, -0.6, 0.06]}>
            <boxGeometry args={[2.5, 0.1, 0.05]} />
            <meshStandardMaterial
              color="#ffcc00"
              emissive="#ffcc00"
              emissiveIntensity={2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.15]}
            fontSize={1.2}
            color={nextHovered ? "#2c75ff" : "#ffcc00"}
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            fontStyle="italic"
            letterSpacing={0.05}
            font="/Fonts/HesDeadJim-apj9.ttf"
          >
            NEXT
          </Text>
        </mesh>
      </Billboard>

      {/* CONTACT Label */}
      <Billboard
        position={[-8, 5, 2]} // Positioned lower and to the left of NEXT
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onToggleContactForm && onToggleContactForm(); // Use the passed prop
          }}
          onPointerOver={(e) => { e.stopPropagation(); setContactHovered(true); }}
          onPointerOut={() => setContactHovered(false)}
        >
          {/* Star Trek-inspired angled box with glow effect */}
          <RoundedBox args={[4.7, 1.5, 0.1]} radius={0.1} smoothness={4}>
            <meshBasicMaterial color={contactHovered ? "#0e2042" : "black"} transparent opacity={0.9} />
          </RoundedBox>
          {/* Border with glow effect */}
          <RoundedBox args={[4.8, 1.6, 0.05]} radius={0.15} smoothness={4} position={[0, 0, -0.01]}>
            <meshStandardMaterial
              color="#2c75ff"
              emissive="#2c75ff"
              emissiveIntensity={contactHovered ? 2 : 1}
              transparent
              opacity={0.7}
            />
          </RoundedBox>
          {/* Bottom accent bar */}
          <mesh position={[0, -0.6, 0.06]}>
            <boxGeometry args={[3.5, 0.1, 0.05]} />
            <meshStandardMaterial
              color="#ffcc00"
              emissive="#ffcc00"
              emissiveIntensity={2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.15]}
            fontSize={1.2}
            color={contactHovered ? "#2c75ff" : "#ffcc00"} // Star Trek colors
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            fontStyle="italic"
            letterSpacing={0.05}
            font="/Fonts/HesDeadJim-apj9.ttf"
          >
            CONTACT
          </Text>
        </mesh>
      </Billboard>

      {/* OUR PRODUCTS Label */}
      <Billboard
        position={[4, 16, 2]} // Positioned above the rocket
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onToggleProductsCard && onToggleProductsCard(); // Use the passed prop
          }}
          onPointerOver={(e) => { e.stopPropagation(); setProductsHovered(true); }}
          onPointerOut={() => setProductsHovered(false)}
        >
          {/* Star Trek-inspired angled box with glow effect */}
          <RoundedBox args={[8.5, 1.5, 0.1]} radius={0.1} smoothness={4}>
            <meshBasicMaterial color={productsHovered ? "#0e2042" : "black"} transparent opacity={0.9} />
          </RoundedBox>
          {/* Border with glow effect */}
          <RoundedBox args={[8.6, 1.6, 0.05]} radius={0.15} smoothness={4} position={[0, 0, -0.01]}>
            <meshStandardMaterial
              color="#2c75ff"
              emissive="#2c75ff"
              emissiveIntensity={productsHovered ? 2 : 1}
              transparent
              opacity={0.7}
            />
          </RoundedBox>
          {/* Bottom accent bar */}
          <mesh position={[0, -0.6, 0.06]}>
            <boxGeometry args={[6, 0.1, 0.05]} />
            <meshStandardMaterial
              color="#ffcc00"
              emissive="#ffcc00"
              emissiveIntensity={2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.15]}
            fontSize={1.2}
            color={productsHovered ? "#2c75ff" : "#ffcc00"} // Star Trek colors
            anchorX="center"
            anchorY="middle"
            fontWeight={800}
            fontStyle="italic"
            letterSpacing={0.05}
            font="/Fonts/HesDeadJim-apj9.ttf"
          >
            OUR PRODUCTS
          </Text>
        </mesh>
      </Billboard>
    </group>
  )
}