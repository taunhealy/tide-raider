"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
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

    const setup = async () => {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      renderer = new THREE.WebGLRenderer({ alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      // Custom shader for CRT effect
      const crtShader = {
        uniforms: {
          tDiffuse: { value: null },
          time: { value: 0 },
          distortion: { value: 0.3 * intensity },
          scanlineIntensity: { value: 0.5 * intensity },
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
          #define MOD3 vec3(.1031,.11369,.13787)

          float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
          }

          uniform sampler2D tDiffuse;
          uniform float time;
          uniform float distortion;
          uniform float scanlineIntensity;
          uniform float effectIntensity;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            
            // Bulging/fish-eye effect (keep this)
            vec2 centeredUV = uv - 0.5;
            float d = length(centeredUV);
            float bulge = 1.0 + (d * d * 1.5);
            vec2 distortedUV = centeredUV / bulge;
            uv = distortedUV + 0.5;
            
            // Remove vignette-related calculations
            vec4 color = texture2D(tDiffuse, uv);
            
            // Keep color tinting but remove vignette influence
            vec3 tint = vec3(0.9, 1.1, 1.05);
            color.rgb *= mix(vec3(1.0), tint, effectIntensity);
            
            // Scanline and glow effects (keep these)
            float yellowLine = smoothstep(0.997, 0.999, sin(uv.y * 100.0 + time * 3.0)) * 0.2 * effectIntensity;
            float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.07 * effectIntensity;
            float edgeGlow = pow(1.0 - d, 3.0) * 0.3 * effectIntensity;
            
            // Apply effects without vignette
            color.rgb += vec3(1.0, 1.0, 0.5) * yellowLine;
            color.rgb += scanline;
            color.rgb += vec3(0.1, 0.3, 0.2) * edgeGlow;
            
            gl_FragColor = color;
          }
        `,
      };

      // Post-processing setup
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      const crtPass = new ShaderPass(crtShader);

      composer.addPass(renderPass);
      composer.addPass(crtPass);

      // Animation
      const animate = () => {
        requestAnimationFrame(animate);
        crtPass.uniforms.time.value += 0.01;
        composer.render();
      };

      animate();
      setIsLoading(false);
    };

    setup();

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [intensity]);

  return (
    <>
      <RandomLoader isLoading={isLoading} whiteBackground />
      <div ref={containerRef} className="absolute inset-0">
        <div className={isLoading ? "invisible" : "visible"}>{children}</div>
      </div>
    </>
  );
};

export default ArcadeScreen;
