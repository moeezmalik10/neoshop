// Lightweight Three.js hero scene (rotating glassy torus + sparkles)

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createHeroScene(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Resize
  function resize(){
    const { clientWidth:w, clientHeight:h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  resize();

  // Lights
  const light1 = new THREE.DirectionalLight(0xffffff, 1.2); light1.position.set(2, 2, 3); scene.add(light1);
  const light2 = new THREE.PointLight(0x7aa2ff, 1.0, 10); light2.position.set(-2, -1, 2); scene.add(light2);

  // Torus
  const geo = new THREE.TorusKnotGeometry(1, 0.35, 200, 32);
  const mat = new THREE.MeshPhysicalMaterial({
    color:0x88aaff,
    metalness:0.1,
    roughness:0.2,
    transmission:0.6,
    thickness:0.5,
    clearcoat:0.8,
    clearcoatRoughness:0.1,
    envMapIntensity:1.0
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 400;
  const pos = new Float32Array(starCount * 3);
  for(let i=0;i<starCount;i++){
    pos[i*3+0] = (Math.random()-0.5)*10;
    pos[i*3+1] = (Math.random()-0.5)*6;
    pos[i*3+2] = (Math.random()-0.5)*4 - 2;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({ color:0xb388ff, size:0.02 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Mouse parallax
  const target = new THREE.Vector2();
  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = (e.clientY - rect.top) / rect.height * 2 - 1;
    target.set(x, y);
  });

  let raf;
  const clock = new THREE.Clock();
  function animate(){
    const t = clock.getElapsedTime();
    mesh.rotation.x = t * 0.4;
    mesh.rotation.y = t * 0.7;
    camera.position.x += (target.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-target.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0,0,0);
    stars.rotation.z = t * 0.04;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  animate();

  // Cleanup when canvas is removed
  const observer = new MutationObserver(() => {
    if(!document.body.contains(canvas)){
      cancelAnimationFrame(raf);
      renderer.dispose();
      geo.dispose();
      starGeo.dispose();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList:true, subtree:true });
}


