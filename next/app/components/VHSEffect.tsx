"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function VHSEffect() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) {
      console.error("Mount ref not available");
      return;
    }

    console.log("Initializing VHS effect...");

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    // Fixed positioning for scroll effect
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "1";
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // VHS distortion material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
        }
        
        void main() {
          // Reduced distortion parameters
          vec2 uv = vUv;
          uv.x += sin(uv.y * 15.0 + time * 1.5) * 0.01; // Slower horizontal warping
          uv.y += sin(time * 1.0) * 0.001; // Slower and smaller jitter
          
          // Scanline variations
          float scanlineNoise = rand(vec2(uv.y * 100.0, time * 0.1)) * 0.1;
          float scanlineWobble = sin(uv.y * 50.0 + time * 2.0) * 0.005;
          
          float scanPos = fract(uv.y * 1.2 + time * 0.1 + scanlineWobble);
          float baseScanline = smoothstep(0.4, 0.6, sin(scanPos * 3.1415 * 2.0));
          
          // Dynamic intensity
          float scanlineFlicker = 0.8 + sin(time * 3.0) * 0.2;
          float scanline = baseScanline * 0.15 * scanlineFlicker + scanlineNoise;
          
          // Scanline curvature
          float curvature = 1.0 - pow(abs(uv.x - 0.5) * 2.0, 2.0);
          scanline *= curvature;
          
          // Scanline opacity falloff
          scanline *= 1.0 - smoothstep(0.3, 0.7, abs(uv.y - 0.5));
          
          // Stabilized color offsets
          float rOffset = 0.003 * sin(time * 0.3);
          float gOffset = 0.003 * sin(time * 0.4 + 1.0);
          float bOffset = 0.003 * sin(time * 0.5 + 2.0);
          
          // Noise
          float noise = rand(uv * vec2(time * 0.2)) * 0.5;
          noise += rand(uv * 15.0 + time) * 0.2;
          
          // Vignette
          float vignette = 1.0 - length(uv - 0.5) * 1.2;
          
          // Distortion
          float distortion = (noise + scanline) * vignette;
          
          // Tracking lines (every 0.5 seconds)
          float tracking = step(0.999, sin(uv.y * 100.0 + time * 0.5));
          
          // Magnetic tape glitch (random full-screen flash)
          float glitch = step(0.9995, rand(vec2(time)));
          
          // Head switching noise (vertical bursts)
          float verticalNoise = step(0.99, rand(vec2(uv.x * 50.0, floor(time * 2.0))));
          
          // Dropout dots
          float dropouts = step(0.999, rand(uv + time));
          
          // Combine new effects
          distortion += tracking * 0.3;
          distortion = mix(distortion, 1.0, glitch * 0.5);
          distortion += verticalNoise * 0.2;
          distortion -= dropouts * 0.4;
          
          // Color tint
          vec3 tint = vec3(
            0.85 + distortion * 0.5,
            0.9 + distortion * 0.2,
            0.95 - distortion * 0.4
          );
          
          // Final color
          vec3 color = vec3(distortion) * tint;
          gl_FragColor = vec4(
            color.r * 1.1 - rOffset,
            color.g * 0.95 - gOffset,
            color.b * 0.9 - bOffset,
            0.25 // Increased opacity
          );
        }
      `,
    });

    // Fullscreen plane
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(plane);

    console.log(
      "WebGL context status:",
      renderer.getContext().isContextLost() ? "Lost" : "Active"
    );
    console.log(
      "Canvas dimensions:",
      renderer.domElement.width,
      "x",
      renderer.domElement.height
    );

    camera.position.z = 1;

    // Handle window resize
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.resolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener("resize", onResize);

    // Animation
    let frame = 0;
    const animate = () => {
      frame += 0.01;
      material.uniforms.time.value = frame;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      console.log("Cleaning up VHS effect...");
      window.removeEventListener("resize", onResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-none mix-blend-overlay"
      style={{ zIndex: 9999 }} // Force highest z-index
    />
  );
}
