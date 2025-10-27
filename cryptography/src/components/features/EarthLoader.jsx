import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import { Typography, Box as MuiBox, Zoom } from '@mui/material';
import React, { Suspense } from 'react';

const EARTH_TEXTURE = '/earth_atmos_2048.jpg';
const EARTH_BUMP = '/earth_normal_2048.jpg';
const EARTH_SPEC = '/earth_specular_2048.jpg';

const RotatingEarth = () => {
  const [colorMap, bumpMap, specMap] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE,
    EARTH_BUMP,
    EARTH_SPEC
  ]);

  return (
    <Sphere args={[1, 64, 64]}>
      <meshPhongMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.05}
        specularMap={specMap}
        specular={new THREE.Color(0x333333)}
        shininess={10}
      />
    </Sphere>
  );
};

const EarthLoader = ({ loading, message }) => {
  if (!loading) return null;

  return (
    <Zoom in={loading}>
      <MuiBox
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #000000 0%, #1a237e 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white',
        }}
      >
        <MuiBox sx={{ width: 300, height: 300, mb: 3 }}>
          <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={3} />
              <pointLight position={[10, 10, 10]} intensity={10} />
              <directionalLight
                position={[-5, 5, 5]}
                intensity={0.8}
                castShadow
              />
              <pointLight
                position={[15, 15, 15]}
                intensity={5}
                color={0xffffff}
                distance={30}
                decay={1}
              />
              <RotatingEarth />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={10}
              />
            </Suspense>
          </Canvas>
        </MuiBox>

        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', textShadow: '0 0 8px rgba(0,150,255,0.7)' }}>
          Шифруем...
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.8 }}>
          {message}
        </Typography>
      </MuiBox>
    </Zoom>
  );
};

export default EarthLoader;
