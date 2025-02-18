"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { PlaneGeometry, ShaderMaterial, Mesh } from "three";
import { RandomLoader } from "@/app/components/ui/RandomLoader";

const ArcadeScreen = ({
  children,
  intensity = 1.0, // Add intensity prop to control effect strength
}: {
  children: React.ReactNode;
  intensity?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer;
    let composer: EffectComposer;
    let crtPass: ShaderPass;
    let mesh: Mesh;

    const setup = async () => {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current!.clientWidth / containerRef.current!.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 1; // Add camera positioning

      // Add transparent background material
      const material = new ShaderMaterial({
        transparent: true,
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float time;
          void main() {
            // Add alpha channel to make background transparent
            vec3 color = vec3(0.2 + sin(vUv.x * 10.0 + time) * 0.5, 0.3, 0.4 + cos(vUv.y * 10.0 + time) * 0.3);
            gl_FragColor = vec4(color, 0.7 * (1.0 - intensity)); // Adjust alpha based on intensity
          }
        `,
      });

      // Add plane geometry covering the full screen
      const geometry = new THREE.PlaneGeometry(2, 2); // Full screen coverage
      mesh = new Mesh(geometry, material);
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setClearColor(0x000000, 0); // Fully transparent background
      renderer.setSize(
        containerRef.current!.clientWidth,
        containerRef.current!.clientHeight
      );
      containerRef.current?.appendChild(renderer.domElement);

      // Custom shader for CRT effect
      const crtShader = {
        uniforms: {
          tDiffuse: { value: null },
          time: { value: 0 },
          distortion: { value: 0.15 * intensity },
          scanlineIntensity: { value: 0.3 * intensity },
          effectIntensity: { value: intensity },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float time;
          uniform float distortion;
          uniform float scanlineIntensity;
          uniform float effectIntensity;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            
            // Subtle screen curvature
            vec2 centeredUV = uv - 0.5;
            float d = length(centeredUV);
            float bulge = 1.0 + (d * distortion * 2.0);
            vec2 distortedUV = centeredUV / bulge;
            uv = distortedUV + 0.5;
            
            vec4 color = texture2D(tDiffuse, uv);
            
            // Soft color tinting
            vec3 tint = mix(
              vec3(1.0),
              vec3(0.95, 1.05, 1.02),
              effectIntensity * 0.6
            );
            color.rgb *= tint;
            
            // Subtle scanlines
            float scanline = sin(uv.y * 500.0 + time * 5.0) * 0.04 * scanlineIntensity;
            color.rgb += scanline;
            
            // Gentle edge glow
            float edgeGlow = smoothstep(0.7, 1.0, d) * 0.15 * effectIntensity;
            color.rgb += vec3(0.3, 0.4, 0.9) * edgeGlow;
            
            // Random noise for subtle analog feel
            float noise = fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453) * 0.02;
            color.rgb += noise * effectIntensity;
            
            // Soft magenta tint in corners
            color.rgb += vec3(1.0, 0.8, 0.9) * (1.0 - smoothstep(0.0, 0.5, d)) * 0.1 * effectIntensity;
            
            gl_FragColor = color;
          }
        `,
      };

      // Post-processing setup
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      crtPass = new ShaderPass(crtShader);

      composer.addPass(renderPass);
      composer.addPass(crtPass);

      // Handle window resize
      const onResize = () => {
        camera.aspect =
          containerRef.current!.clientWidth /
          containerRef.current!.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          containerRef.current!.clientWidth,
          containerRef.current!.clientHeight
        );
        composer.setSize(
          containerRef.current!.clientWidth,
          containerRef.current!.clientHeight
        );
      };
      containerRef.current?.addEventListener("resize", onResize);

      // Animation
      const animate = () => {
        requestAnimationFrame(animate);
        crtPass.uniforms.time.value += 0.01;
        material.uniforms.time.value = crtPass.uniforms.time.value; // Update material time
        composer.render();
      };

      animate();
      setIsLoading(false);
    };

    setup();
  }, [intensity]);

  return (
    <>
      <RandomLoader isLoading={isLoading} whiteBackground />
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <div className={isLoading ? "invisible" : "visible absolute inset-0"}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ArcadeScreen;
