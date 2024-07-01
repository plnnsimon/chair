import * as THREE from 'three';
import { RGBELoader } from 'https://threejs.org/examples/jsm/loaders/RGBELoader.js';

const BACKGROUND_COLOR = '#FFFFFF';
export default class Renderer {
  constructor(application) {
    this.application = application;
    this.canvas = application.canvas;
    this.sizes = application.sizes;
    this.scene = application.scene;
    this.camera = application.camera;
    this.raycaster = application.raycaster;
    this.gui = application.gui;
    this.fps = 30;
    this.interval = 1000 / this.fps;
    this.then = Date.now();

    this.setRenderer();
  }

  setSnapRenderer() {
    this.scene.background = null;
    this.instance2 = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.instance2.shadowMap.needsUpdate = true;
    this.instance2.shadowMap.autoUpdate = true;
    this.instance2.shadowMapSoft = true;
    this.instance2.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance2.toneMappingExposure = 3.5;
    this.instance2.autoClear = false;
    this.instance2.setClearColor(0x000000, 0);
    this.instance2.physicallyCorrectLights = true;

    document.body.appendChild(this.instance2.domElement);
    this.resize2();
    this.update2();
  }

  reSetSnapRenderer() {
    const element = this.instance2.domElement;
    this.instance2.dispose();

    document.body.removeChild(element);
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
  }

  setRenderer() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      // premultipliedAlpha: false,
      // stencil: false,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false
    });
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.shadowMap.needsUpdate = true;
    this.instance.shadowMap.autoUpdate = true;
    this.instance.shadowMapSoft = true;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 3.5;
    this.instance.autoClear = false;
    this.instance.setClearColor(0x000000, 0);
    this.instance.physicallyCorrectLights = true;

    this.instance.outputColorSpace = THREE.SRGBColorSpace;

    // this.loadEnv('assets/textures/env-map.hdr');

    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    // this.scene.background.encoding = THREE.SRGBColorSpace;
    // this.scene.background.colorSpace = THREE.SRGBColorSpace;
    // this.scene.background.minFilter = THREE.LinearFilter;
    // this.scene.background.magFilter = THREE.LinearFilter;
  }

  loadEnv(file) {
    const generator = new THREE.PMREMGenerator(this.instance);
    new RGBELoader().load(file, (hdrmap) => {
      const envmap = generator.fromEquirectangular(hdrmap);
      envmap.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = envmap.texture;
      this.scene.environment.colorSpace = THREE.SRGBColorSpace;
    });
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }

  resize2() {
    this.instance2.setSize(this.sizes.width, this.sizes.height);
    this.instance2.setPixelRatio(this.sizes.pixelRatio);
  }

  update2() {
    this.instance2.render(this.scene, this.camera.instance);
  }
}
