import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { RGBShiftShader } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 3.5;


const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );

const composer = new EffectComposer( renderer );
const renderPass = new RenderPass(scene,camera);
composer.addPass( renderPass );

const rgbShiftPass = new ShaderPass( RGBShiftShader );
rgbShiftPass.uniforms['amount'].value = 0.001;
composer.addPass( rgbShiftPass );

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const modelLoader = new GLTFLoader();
const textureLoader = new RGBELoader();
let model;
textureLoader.load( 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/pond_bridge_night_4k.hdr', function ( texture ) {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  // scene.background = envMap;
  scene.environment = envMap;
  texture.dispose();
  pmremGenerator.dispose();
  modelLoader.load( './DamagedHelmet.gltf', function ( gltf ) {
    model = gltf.scene;
    scene.add( model );
  });
});
window.addEventListener( 'resize',()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );
});

window.addEventListener('mousemove',(e)=>{
  // console.log([e.clientX, e.clientY]);
  if(model){
    const rotateX = (e.clientX / window.innerWidth) - 0.5 *(Math.PI*0.3);
    const rotateY = (e.clientY / window.innerHeight) - 0.5 *(Math.PI*0.3);
    gsap.to(model.rotation,{
      x:rotateY,
      y:rotateX,
      duration: 1,
      ease: 'elastic'
    })
  }
})


function animate() {
  window.requestAnimationFrame( animate );
	composer.render();
}

animate();