import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { HalfFloatType, Clock } from 'three';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  SelectiveBloomEffect,
  BlendFunction
} from 'postprocessing';

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

    this.setPostprocessing();
  }

  setRenderer() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.shadowMap.needsUpdate = true;
    this.instance.shadowMap.autoUpdate = true;
    this.instance.shadowMapSoft = true;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1;
    this.instance.autoClear = false;
    this.instance.physicallyCorrectLights = true;

    this.instance.outputColorSpace = THREE.SRGBColorSpace;
  }

  setPostprocessing() {
    const renderPass = new RenderPass(this.scene, this.camera.instance);
    renderPass.clearColor = new THREE.Color(0, 0, 0);
    renderPass.clearAlpha = 0;

    this.composer = new EffectComposer(this.instance, {
      multisampling: Math.min(2, this.instance.capabilities.maxSamples),
      frameBufferType: HalfFloatType,
      alpha: true
    });
    this.composer.addPass(renderPass);

    const bloomEffect = new SelectiveBloomEffect(
      this.scene,
      this.camera.instance,
      {
        blendFunction: BlendFunction.ADD,
        mipmapBlur: true,
        filter: true,
        luminanceThreshold: 0.0,
        luminanceSmoothing: 0.0,
        intensity: 1.5,
        radius: 0.3
      }
    );

    bloomEffect.inverted = true;
    bloomEffect.ignoreBackground = true;
    this.instance.bloomEffect = bloomEffect;

    this.composer.addPass(new EffectPass(this.camera.instance, bloomEffect));
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
    this.composer.setSize(this.sizes.width, this.sizes.height);
  }

  update() {
    const now = Date.now();
    const elapsed = now - this.then;

    if (elapsed > this.interval) {
      const time = new Clock().getDelta();
      this.composer.render(time);
    }
  }
}
