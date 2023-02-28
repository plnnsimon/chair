import * as THREE from 'three';

import Sizes from '/src/pkg/utils/Sizes.js';
import ModelLoader from '/src/pkg/utils/GLTFLoader.js';
import ThreejsApplication from '/src/pkg/ThreejsApplication.js';

import SceneLights from './helpers/SceneLights.js';
import Camera from './helpers/Camera.js';
import Renderer from './helpers/Renderer.js';

export class TerroristApplication extends ThreejsApplication {
  constructor(objectPath) {
    super();

    this.objectPath = objectPath;

    this.canvas = null;
    this.canvasContainer = null;

    this.raycaster = new THREE.Raycaster();
    this.observer = null;

    this.camera = null;
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.loadedModel = null;
    this.sizes = null;
    this.sceneLights = null;
    this.gui = null;
    this.mixer = null;
    this.time = new THREE.Clock();

    this.rotateObj = false;
  }

  async build(canvasContainerId) {
    const container = document.getElementById(canvasContainerId);
    if (!container) {
      console.log('Canvas container is not defined');
      return 
    }

    const canvas = document.createElement('canvas');
    this.canvas = canvas;

    container.appendChild(canvas);
    this.canvasContainer = container;
    this.sizes = new Sizes(container);

    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.sceneLights = new SceneLights(this);

    // resize event
    this.resize();
    this.sizes.subscribe('resize', () => {
      this.resize();
    });

    this.scene.traverse((el) => {
      el.castShadow = true
      el.receiveShadow = true
      el.frustumCulled = false;
    })

    this.scene.scale.set(0.01, 0.01, 0.01);
    this.scene.position.set(0, -0.4, 0);
    this.scene.rotation.y = -0.4;
    this.camera.resize();
    
    if (!this.loadedModel) {
      console.log('Model is not defined');
      return 
    }
    this.scene.add(this.loadedModel.scene);
    this.loadedModel.scene.position.set(0, 0, 0);
    this.mixer = new THREE.AnimationMixer(this.loadedModel.scene);
    this.sceneLights.initializeLights()
  }

  animateFrame() {
    this.animate();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  animate() {
    const delta = this.time.getDelta()

    if (this.camera && this.renderer) {
      this.camera.update(delta);
      this.renderer.update(delta);
    }

    if (this.mixer) {
      this.mixer.update(delta);
    }

    // if (this.rotateObj) {
    //   this.scene.rotation.y += 0.002
    // }
  }

  async init(callback) {
    if (this.scene) {
      this.scene.clear();
    }

    if (!this.objectPath) {
      console.log('Object is not defined');
      return 
    }

    const loader = new ModelLoader(this.objectPath, this);

    try {
      await loader.initGLTFLoader(callback);
    } catch (err) {
      console.error(err);
    }
  }

  setObserver() {
    if (!this.canvas) {
      console.log('Canvas is not provided');
      return
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };

    const callback = (entries, observer) => {
      const isIntersecting = entries.find((entry) => {
        return entry.isIntersecting;
      });
      if (isIntersecting) {
        console.log('isIntersecting');
        this.startAnimation()
      }
      if (!isIntersecting) {
        console.log('no isIntersecting');
        this.stopAnimation()
      }
    };

    this.observer = new IntersectionObserver(callback, options);
    this.observer.observe(this.canvas);
  }

  startAnimation() {
    const clips = this.loadedModel.animations;

    const clip = THREE.AnimationClip.findByName(clips, "Idle");

    const action = this.mixer.clipAction(clip).setLoop(THREE.LoopRepeat);
    action.play();
    this.mount();
  }

  stopAnimation() {
    const clips = this.loadedModel.animations;
    this.mixer = new THREE.AnimationMixer(this.loadedModel.scene);

    const clip = THREE.AnimationClip.findByName(clips, "Idle");

    const action = this.mixer.clipAction(clip)
    action.reset();
    this.unmount()
  }

  dispose() {
    if (!this.renderer) return;

    while (this.scene && this.scene.children.length) {
      const child = this.scene.children[0];
      child.parent.remove(child);
    
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    }
    
    this.renderer.instance.dispose();
    this.renderer.instance.render(this.scene, this.camera.instance);
    THREE.Cache.remove();
    this.mixer = null

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.scene) {
      this.scene.clear();
    }

    this.sizes.unsubscribe('resize', () => {
      this.resize();
    });
  }
}
