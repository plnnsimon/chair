import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { HalfFloatType, UnsignedByteType, Clock } from 'three';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  ToneMappingEffect,
  ToneMappingMode,
  FXAAEffect,
  BlendFunction
} from 'postprocessing';
import {
  VelocityDepthNormalPass,
  HBAOEffect,
  TRAAEffect,
  SSAOEffect
} from 'realism-effects';

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
      premultipliedAlpha: false,
      stencil: false,
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true
    });
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.shadowMap.needsUpdate = true;
    this.instance.shadowMap.autoUpdate = true;
    this.instance.shadowMapSoft = true;
    this.instance.toneMapping = THREE.LinearToneMapping
    this.instance.toneMappingExposure = 0.51;
    this.instance.autoClear = false;
    this.instance.setClearColor(0x000000, 0);
    this.instance.physicallyCorrectLights = true;

    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    const BACKGROUND_COLOR = '#FFFFFF';

    this.loadEnv('/src/js/applications/textures/env-map.hdr');

    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.scene.background.encoding = THREE.SRGBColorSpace;
    this.scene.background.colorSpace = THREE.SRGBColorSpace;
    this.scene.background.minFilter = THREE.LinearFilter;
    this.scene.background.magFilter = THREE.LinearFilter;

    // const sceneSettings = this.application.gui.addFolder('Scene');
    // sceneSettings.add(this.instance, 'toneMappingExposure', 0, 5, 0.01);
    // sceneSettings
    //   .add(this.instance, 'toneMapping', {
    //     No: THREE.NoToneMapping,
    //     Linear: THREE.LinearToneMapping,
    //     Reinhard: THREE.ReinhardToneMapping,
    //     Cineon: THREE.CineonToneMapping,
    //     ACESFilmic: THREE.ACESFilmicToneMapping
    //   })
    //   .onFinishChange(() => {
    //     this.instance.toneMapping = Number(this.instance.toneMapping);
    //   });
  }

  setPostprocessing() {
    const renderPass = new RenderPass(this.scene, this.camera.instance);

    this.composer = new EffectComposer(this.instance, {
      multisampling: Math.min(2, this.instance.capabilities.maxSamples),
      frameBufferType: HalfFloatType
    });
    this.composer.addPass(renderPass);

    const velocityDepthNormalPass = new VelocityDepthNormalPass(
      this.scene,
      this.camera.instance
    );
    this.composer.addPass(velocityDepthNormalPass);

    const toneMapping = new ToneMappingEffect({
      blendFunction: BlendFunction.NORMAL,
      // adaptive: true, // Adaptive tonemapping based on luminance
      resolution: 1024, // Luminance texture resolution
      middleGrey: 0.0, // Middle grey factor
      maxLuminance: 10.0, // Maximum luminance
      averageLuminance: 1.0, // Average luminance
      adaptationRate: 1.0,
      mode: ToneMappingMode.LINEAR 
    });

    const ssaoEffect = new SSAOEffect(
      this.composer,
      this.camera.instance,
      this.scene,
      {
        resolutionScale: 1,
        spp: 12,
        distance: 1,
        distancePower: 1.0,
        power: 1,
        bias: 0,
        thickness: 0,
        color: new THREE.Color('black')
      }
    );
    const hbaoEffect = new HBAOEffect(
      this.composer,
      this.camera.instance,
      this.scene,
      {
        resolutionScale: 1,
        spp: 1,
        distance: 0.08,
        distancePower: 1.0,
        power: 1.0,
        bias: 0.025,
        thickness: 0.05,
        color: new THREE.Color('black')
      }
    );

    // const lightFolder = this.application.gui.addFolder("Shadow");
    // lightFolder.add(ssaoEffect, "bias", 0, 100, 0.01);
    // lightFolder.add(ssaoEffect, "resolutionScale", -10, 10, 0.001);
    // lightFolder.add(ssaoEffect, "spp", -10, 10, 0.001);
    // lightFolder.add(ssaoEffect, "distance", -10, 10, 0.001);
    // lightFolder.add(ssaoEffect, "distancePower", -10, 10, 0.001);
    // lightFolder.add(ssaoEffect, "power", -10, 10, 0.001);
    // lightFolder.add(ssaoEffect, "thickness", -10, 10, 0.001);

    console.log(hbaoEffect, ' hbaoEffect');
    const smaaEffect = new FXAAEffect({
      blendFunction: BlendFunction.ADD
    });
    // const traaEffect = new TRAAEffect(
    //   this.scene,
    //   this.camera.instance,
    //   velocityDepthNormalPass,
    //   {
    //     blendFunction: BlendFunction.ADD,
    //     jitter: 0.05,
    //     sharpness: 0.05,
    //     resolutionScale: 2,
    //     blend: 0.87
    //   }
    // );
    this.composer.addPass(
      new EffectPass(
        this.camera.instance,
        hbaoEffect,
        ssaoEffect,
        toneMapping,
      )
    );
    this.composer.addPass(new EffectPass(this.camera.instance, smaaEffect));
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