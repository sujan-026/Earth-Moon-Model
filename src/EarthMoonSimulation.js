import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import styled from 'styled-components';

const SimulationContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #000000, #0f2027);
  overflow: hidden;
`;

const Title = styled.h1`
  color: #ffffff;
  font-family: 'Orbitron', sans-serif;
  text-align: center;
  padding: 20px 0;
  background-color: rgba(0, 0, 0, 0.5);
  margin: 0;
  font-size: 2.5em;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
`;

const CanvasContainer = styled.div`
  flex-grow: 1;
  position: relative;
`;

const InfoSection = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  display: flex;
  justify-content: space-around;
`;

const InfoColumn = styled.div`
  flex: 1;
`;

const HoverInfo = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  font-size: 0.9em;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const PersonalInfo = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  font-size: 0.9em;
`;

const SocialLink = styled.a`
  color: #00ffff;
  text-decoration: none;
  margin-left: 10px;
  &:hover {
    text-decoration: underline;
  }
`;

const EarthMoonSimulation = () => {
    const mountRef = useRef(null);
    const [earthInfo, setEarthInfo] = useState({});
    const [moonInfo, setMoonInfo] = useState({});
    const [hoverInfo, setHoverInfo] = useState({ show: false, text: '', x: 0, y: 0 });
  
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
  
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
  
      const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        raycaster.setFromCamera(mouse, camera);
  
        const intersects = raycaster.intersectObjects([earth, moon]);
  
        if (intersects.length > 0) {
          const object = intersects[0].object;
          const name = object === earth ? 'Earth' : 'Moon';
          setHoverInfo({
            show: true,
            text: name,
            x: event.clientX,
            y: event.clientY,
          });
        } else {
          setHoverInfo({ show: false, text: '', x: 0, y: 0 });
        }
      };
  
      window.addEventListener('mousemove', onMouseMove);
  
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
        window.removeEventListener('mousemove', onMouseMove);
        window.cancelAnimationFrame(frameId);
        currentMount.removeChild(renderer.domElement);
      };
    }, []);
  
    return (
      <SimulationContainer>
        <Title>Earth and Moon Simulation</Title>
        <CanvasContainer ref={mountRef}>
          {hoverInfo.show && (
            <HoverInfo style={{ left: hoverInfo.x, top: hoverInfo.y, opacity: 1 }}>
              {hoverInfo.text}
            </HoverInfo>
          )}
          <PersonalInfo>
            Created by Sujan
            <br />
            <SocialLink href="https://www.linkedin.com/in/sujan-p-443745244/" target="_blank">LinkedIn</SocialLink>
            <SocialLink href="https://github.com/sujan-026" target="_blank">GitHub</SocialLink>
          </PersonalInfo>
        </CanvasContainer>
        <InfoSection>
          <InfoColumn>
            <h2>Earth</h2>
            <p>Mass: 5.97 × 10^24 kg</p>
            <p>Radius: 6,371 km</p>
            <p>Orbital Period: 365.26 days</p>
            <p>Rotation: {earthInfo.rotation}</p>
            <p>Position: {earthInfo.position}</p>
          </InfoColumn>
          <InfoColumn>
            <h2>Moon</h2>
            <p>Mass: 7.34 × 10^22 kg</p>
            <p>Radius: 1,737.1 km</p>
            <p>Orbital Period: 27.32 days</p>
            <p>Rotation: {moonInfo.rotation}</p>
            <p>Position: {moonInfo.position}</p>
          </InfoColumn>
        </InfoSection>
      </SimulationContainer>
    );
  };
  
  export default EarthMoonSimulation;