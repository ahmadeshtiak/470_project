import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import * as THREE from "three";

function Model({ color, rimColor, textureUrl, modelPath, config }) {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        const matName = child.material.name.toLowerCase();
        const objName = child.name.toLowerCase();

        // Check exclusions (tires, windows, interior)
        const isExcluded = config.exclusions.some(key => matName.includes(key) || objName.includes(key));
        if (isExcluded) return;

        // Identify body and rims
        const isBody = config.bodyIdentifiers.some(key => matName.includes(key) || objName.includes(key));
        const isRim = config.rimIdentifiers.some(key => matName.includes(key) || objName.includes(key));

        // Apply body customization
        if (isBody) {
          // Clone material if needed to prevent sharing issues
          if (config.cloneMaterial && !child.userData.isCloned) {
            child.material = child.material.clone();
            child.userData.isCloned = true;
          }

          if (textureUrl) {
            // Apply custom texture/wrap
            const loader = new THREE.TextureLoader();
            const texture = loader.load(textureUrl);
            texture.flipY = false;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(config.textureRepeat, config.textureRepeat);
            child.material.map = texture;
            child.material.color.set(0xffffff);
          } else {
            // Apply solid color paint
            child.material.map = null;
            child.material.color.set(color);
            child.material.roughness = 0.2;
            child.material.metalness = 0.6;
          }
          child.material.needsUpdate = true;
        }

        // Apply rim color
        if (isRim) {
          child.material.color.set(rimColor);
          child.material.metalness = 0.9;
          child.material.roughness = 0.2;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [color, rimColor, textureUrl, scene, modelPath, config]);

  return <primitive object={scene} scale={config.scale} />;
}

const CarVisualizer = forwardRef(({ selectedColor, selectedRimColor, uploadedTexture, modelPath, config }, ref) => {
  
  useImperativeHandle(ref, () => ({
    downloadSnapshot: () => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        const cleanName = modelPath.split('/').pop().replace('.glb', '');
        link.download = `custom-${cleanName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    }
  }));

  const safeConfig = config || { 
      scale: 1, textureRepeat: 1, exclusions: [], bodyIdentifiers: [], rimIdentifiers: [] 
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-gray-100 rounded-xl relative overflow-hidden">
      <Canvas dpr={[1, 2]} camera={{ fov: 45 }} gl={{ preserveDrawingBuffer: true }} shadows={false}>
        <color attach="background" args={["#e5e7eb"]} />
        <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
          <Stage environment="city" intensity={0.6} contactShadow={false} adjustCamera={1.2}>
            <Model 
              color={selectedColor} 
              rimColor={selectedRimColor} 
              textureUrl={uploadedTexture} 
              modelPath={modelPath}
              config={safeConfig}
            />
          </Stage>
        </PresentationControls>
      </Canvas>
    </div>
  );
});

export default CarVisualizer;