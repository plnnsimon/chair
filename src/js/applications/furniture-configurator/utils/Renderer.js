import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Clock, HalfFloatType } from "three";
import {
  EffectComposer,
  BlendFunction,
  RenderPass,
  EffectPass,
  DepthOfFieldEffect,
  TextureEffect,
  DepthEffect,
  VignetteEffect,
  OutlineEffect,
} from "postprocessing";
import { VelocityDepthNormalPass } from "realism-effects";
import {CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer';

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
      alpha: true,
      canvas: this.canvas,
      powerPreference: "high-performance",
      antialias: false,
      premultipliedAlpha: false,
    });
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.shadowMap.needsUpdate = true;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 0.6;
    this.instance.autoClear = false;
    this.instance.setClearColor(0x000000, 0);
    this.instance.useLegacyLights = true;
    this.instance.physicallyCorrectLights = true;

    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // const BACKGROUND_COLOR = 0xd1016;
    const BACKGROUND_COLOR = '#404753';

    this.loadEnv("/textures/env-map.hdr");

    // const bgTexture = new THREE.TextureLoader().load('/textures/transparent-logo.png');
    // // bgTexture.bac
    // bgTexture.premultiplyAlpha = true
    // bgTexture.encoding = THREE.sRGBEncoding;
    // bgTexture.colorSpace = THREE.sRGBEncoding;
    // this.scene.background = bgTexture;
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.scene.background.encoding = THREE.sRGBEncoding;
    this.scene.background.colorSpace = THREE.sRGBEncoding;
    this.scene.background.minFilter = THREE.LinearFilter;
    this.scene.background.magFilter = THREE.LinearFilter;

    // const colorObj = {
    //   color: '#404753'
    // }
    // const sceneSettings = this.gui.addFolder("Scene");
    // sceneSettings.addColor(colorObj, 'color').onChange((value) => {
    //     this.scene.background = new THREE.Color(value)
    //     })
    // sceneSettings.add(this.instance, "toneMappingExposure", 0, 5, 0.01);
    // sceneSettings
    //   .add(this.instance, "toneMapping", {
    //     No: THREE.NoToneMapping,
    //     Linear: THREE.LinearToneMapping,
    //     Reinhard: THREE.ReinhardToneMapping,
    //     Cineon: THREE.CineonToneMapping,
    //     ACESFilmic: THREE.ACESFilmicToneMapping,
    //   })
    //   .onFinishChange(() => {
    //     this.instance.toneMapping = Number(this.instance.toneMapping);
    //   });
  }

  setPostprocessing() {
    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera.instance);

    this.composer = new EffectComposer(this.instance, {
      multisampling: Math.min(2, this.instance.capabilities.maxSamples),
      frameBufferType: HalfFloatType,
    });
    this.composer.addPass(renderPass);

    // const velocityDepthNormalPass = new VelocityDepthNormalPass(
    //   this.scene,
    //   this.camera.instance
    // );
    // this.composer.addPass(velocityDepthNormalPass);

    this.instance.outlineEffect = new OutlineEffect(this.scene, this.camera.instance, {
      blendFunction: BlendFunction.SCREEN,
      multisampling: Math.min(4, this.instance.capabilities.maxSamples),
      edgeStrength: 2.5,
      pulseSpeed: 0.0,
      visibleEdgeColor: 0xffffff,
      hiddenEdgeColor: 0x22090a,
      height: 480,
      blur: false,
      xRay: true,
    });

    const depthOfFieldEffect = new DepthOfFieldEffect(this.camera.instance, {
      focusDistance: 0.5,
      focalLength: 0.1,
      bokehScale: 8.0,
      height: 480,
    });
    // const depthOfFieldEffectFolder = this.application.gui.addFolder("depthOfFieldEffectFolder");
    //
    // depthOfFieldEffectFolder.add(depthOfFieldEffect, "bokehScale").min(0).max(10).step(0.001);

    const cocTextureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthOfFieldEffect.renderTargetCoC.texture,
    });
    const obj = {
      focusDistance: 0,
      focalLength: 0,
    };
    const cocMaterial = depthOfFieldEffect.circleOfConfusionMaterial;
    // depthOfFieldEffectFolder.add(obj, "focusDistance").min(0).max(2).step(0.001).onChange((val) => {
    //   cocMaterial.uniforms.focusDistance.value = val
    // })
    // depthOfFieldEffectFolder.add(obj, "focalLength").min(0).max(2).step(0.001).onChange((val) => {
    //   cocMaterial.uniforms.focalLength.value = val
    // })
    this.instance.cocMaterial = cocMaterial;
    this.instance.depthOfFieldEffect = depthOfFieldEffect;

    const depthEffect = new DepthEffect({
      blendFunction: BlendFunction.SKIP,
    });

    const vignetteEffect = new VignetteEffect({
      eskil: false,
      offset: 0.7,
      darkness: 0.265,
    });
    // const vignetteEffectFolder = this.application.gui.addFolder("vignetteEffect");
    // vignetteEffectFolder
    //   .add(vignetteEffect, "darkness")
    //   .min(0)
    //   .max(10)
    //   .step(0.001);
    // vignetteEffectFolder
    //   .add(vignetteEffect, "offset")
    //   .min(0)
    //   .max(10)
    //   .step(0.001);

    this.composer.addPass(
      new EffectPass(
        this.camera.instance,
        depthOfFieldEffect,
        depthEffect,
        cocTextureEffect,
        this.instance.outlineEffect,
        vignetteEffect,
      )
    );

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0px'
    this.labelRenderer.domElement.style.pointerEvents = 'none'
    this.application.canvasDomElement.appendChild(this.labelRenderer.domElement)
  }

  loadEnv(file) {
    const generator = new THREE.PMREMGenerator(this.instance);
    new RGBELoader().load(file, (hdrmap) => {
      const envmap = generator.fromEquirectangular(hdrmap);
      envmap.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = envmap.texture;
      this.scene.environment.colorSpace = THREE.sRGBEncoding;
    });
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.composer.setSize(this.sizes.width, this.sizes.height);
    this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
    // this.composer.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    const now = Date.now();
    const elapsed = now - this.then;

    if (elapsed > this.interval) {
      const time = new Clock().getDelta();
      this.composer.render(time);
      this.labelRenderer.render(this.scene, this.camera.instance)
      // this.instance.render(this.scene, this.camera.instance);
    }
  }
}
