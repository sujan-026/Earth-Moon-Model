import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import styled from 'styled-components';

const SimulationContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  color: white;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px 0;
  background-color: rgba(0, 0, 0, 0.5);
  margin: 0;
`;

const CanvasContainer = styled.div`
  flex-grow: 1;
`;

const InfoSection = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const EarthMoonSimulation = () => {
  const mountRef = useRef(null);
  const [earthInfo, setEarthInfo] = useState({});
  const [moonInfo, setMoonInfo] = useState({});

  useEffect(() => {
    const currentMount = mountRef.current;
    let width = currentMount.clientWidth;
    let height = currentMount.clientHeight;
    let frameId;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({color: 0xFFFFFF});

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('/images/earthtexture.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('/images/moontexture.jpg');
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    const animate = () => {
      earth.rotation.y += 0.005;
      moon.rotation.y += 0.01;

      const time = Date.now() * 0.001;
      moon.position.x = Math.cos(time * 0.5) * 2;
      moon.position.z = Math.sin(time * 0.5) * 2;

      // Update info
      setEarthInfo({
        rotation: earth.rotation.y.toFixed(2),
        position: `(${earth.position.x.toFixed(2)}, ${earth.position.y.toFixed(2)}, ${earth.position.z.toFixed(2)})`
      });

      setMoonInfo({
        rotation: moon.rotation.y.toFixed(2),
        position: `(${moon.position.x.toFixed(2)}, ${moon.position.y.toFixed(2)}, ${moon.position.z.toFixed(2)})`
      });

      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = currentMount.clientWidth;
      height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(frameId);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <SimulationContainer>
      <Title>Earth and Moon Simulation</Title>
      <CanvasContainer ref={mountRef} />
      <InfoSection>
        <h2>Astronomical Information</h2>
        <h3>Earth</h3>
        <p>Mass: 5.97 × 10^24 kg</p>
        <p>Radius: 6,371 km</p>
        <p>Orbital Period: 365.26 days</p>
        <p>Rotation: {earthInfo.rotation}</p>
        <p>Position: {earthInfo.position}</p>
        <h3>Moon</h3>
        <p>Mass: 7.34 × 10^22 kg</p>
        <p>Radius: 1,737.1 km</p>
        <p>Orbital Period: 27.32 days</p>
        <p>Rotation: {moonInfo.rotation}</p>
        <p>Position: {moonInfo.position}</p>
      </InfoSection>
    </SimulationContainer>
  );
};

export default EarthMoonSimulation;