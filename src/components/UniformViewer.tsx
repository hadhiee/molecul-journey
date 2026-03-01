"use client";

import { useRef, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#e11d48',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
                    Memuat Model 3D...
                </div>
                <div style={{
                    width: 160,
                    height: 4,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 99,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #e11d48, #f43f5e)',
                        borderRadius: 99,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600 }}>
                    {progress.toFixed(0)}%
                </div>
            </div>
        </Html>
    );
}

function Model({ url, autoRotate }: { url: string; autoRotate: boolean }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (scene) {
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;

            scene.position.set(-center.x * scale, -center.y * scale + (size.y * scale * 0.05), -center.z * scale);
            scene.scale.setScalar(scale);

            // Enhance materials
            scene.traverse((child: any) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.envMapIntensity = 0.8;
                    }
                }
            });
        }
    }, [scene]);

    useFrame((_, delta) => {
        if (modelRef.current && autoRotate) {
            modelRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <group ref={modelRef}>
            <primitive object={scene} />
        </group>
    );
}

function CameraController({ zoom }: { zoom: number }) {
    const { camera } = useThree();

    useEffect(() => {
        (camera as THREE.PerspectiveCamera).zoom = zoom;
        camera.updateProjectionMatrix();
    }, [camera, zoom]);

    return null;
}

interface UniformViewerProps {
    modelUrl: string;
}

export default function UniformViewer({ modelUrl }: UniformViewerProps) {
    const [autoRotate, setAutoRotate] = useState(true);
    const [zoom, setZoom] = useState(1);
    const controlsRef = useRef<any>(null);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.2, 2.5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
        setAutoRotate(true);
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                shadows
                camera={{ position: [0, 1.5, 5], fov: 45, near: 0.1, far: 100 }}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
                style={{ background: 'transparent' }}
            >
                <CameraController zoom={zoom} />

                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 8, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#c4b5fd" />
                <pointLight position={[0, 3, 5]} intensity={0.5} color="#fb7185" />
                <spotLight
                    position={[0, 10, 0]}
                    angle={0.4}
                    penumbra={1}
                    intensity={0.8}
                    castShadow
                />

                {/* Environment */}
                <Environment preset="studio" />

                {/* Model */}
                <Suspense fallback={<Loader />}>
                    <Model url={modelUrl} autoRotate={autoRotate} />
                </Suspense>

                {/* Ground shadow */}
                <ContactShadows
                    position={[0, -1.5, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                    far={4}
                />

                {/* Controls */}
                <OrbitControls
                    ref={controlsRef}
                    enablePan={false}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={10}
                    maxPolarAngle={Math.PI / 1.8}
                    minPolarAngle={0.2}
                    onStart={() => setAutoRotate(false)}
                    target={[0, 0.5, 0]}
                />
            </Canvas>

            {/* Zoom Controls */}
            <div style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 6,
                zIndex: 15,
            }}>
                <button
                    onClick={handleZoomIn}
                    style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', fontSize: 18, fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >+</button>
                <button
                    onClick={handleZoomOut}
                    style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', fontSize: 18, fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >−</button>
                <button
                    onClick={handleReset}
                    style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(225,29,72,0.2)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(225,29,72,0.3)',
                        color: '#fb7185', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                    }}
                >↺</button>
            </div>

            {/* Auto-rotate toggle */}
            <button
                onClick={() => setAutoRotate(!autoRotate)}
                style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: autoRotate ? 'rgba(225,29,72,0.2)' : 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${autoRotate ? 'rgba(225,29,72,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    color: autoRotate ? '#fb7185' : 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    zIndex: 15,
                    transition: 'all 0.3s ease',
                }}
            >
                <span style={{
                    display: 'inline-block',
                    animation: autoRotate ? 'spin 2s linear infinite' : 'none',
                }}>🔄</span>
                {autoRotate ? 'Auto Putar: ON' : 'Auto Putar: OFF'}
            </button>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
