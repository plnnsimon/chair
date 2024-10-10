import * as THREE from 'three';
import Camera from './utils/Camera.js';
import Renderer from './utils/Renderer.js';
import SceneLights from './helpers/SceneLights.js';
// import * as dat from 'dat.gui';
import Sizes from './utils/Sizes.js';
import ModelLoader from '../../../pkg/utils/GLTFLoader.js';
import ThreejsApplication from '../../../pkg/ThreejsApplication.js';
import { RGBELoader } from 'https://threejs.org/examples/jsm/loaders/RGBELoader.js';
import useModelsUtils from '../../../pkg/utils/use-models-utils.js';

let instance = null;
const { disposeSceneData, setAnimation } = useModelsUtils();

export class ConfiguratorApplication extends ThreejsApplication {
  constructor(eventEmitter) {
    super();

    if (instance) return instance;
    instance = this;

    this.camera = null;
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.debugObject = {};
    this.canvas = null;
    this.canvasDomElement = null;
    this.loadedModel = null;
    this.editMode = false;
    this.eventEmitter = eventEmitter;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.intersected = null;
    this.intersects = [];
    this.canIntersect = true;
    this.showRangeMaterialList = false;
    this.sizes = null;
    this.time = Date.now();
    // this.gui = new dat.GUI();
    // this.gui = null
    this.sceneLights = new SceneLights(this);
  }

  async build(canvas, canvasDomElement) {
    this.canvas = canvas;
    this.canvasDomElement = canvasDomElement;
    this.sizes = new Sizes(canvasDomElement);

    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    // resize event
    this.resize();
    this.sizes.subscribe('resize', () => {
      this.resize();
    });
  }

  /**
   * INITIALIZATION
   */
  animateFrame() {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.time;
    this.time = currentTime;

    setAnimation(this);

    // if (this.scene) {
    //   this.scene.rotation.y += 0.005;
    // }

    // if (this.mashes?.length) {
    //   const quaternion = new THREE.Quaternion();
    //   const axis = new THREE.Vector3(0, 0, 1);
    //   const angle = THREE.MathUtils.degToRad(0.4);
    //   quaternion.setFromAxisAngle(axis, angle);

    //   this.mashes.forEach((el) => {
    //     el.quaternion.multiplyQuaternions(quaternion, el.quaternion);
    //   });
    // }

    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  setPixelRatio(ratio) {
    if (!this.renderer.instance) {
      return;
    }

    this.renderer.instance.setPixelRatio(ratio);
  }

  /**
   * LOAD MODEL
   */
  async initGLTFLoader(url) {
    const loader = new ModelLoader('', this);

    this.loadedModel = await loader.initGLTFLoader(url);
    this.loadedModel.scene.scale.set(0.15, 0.15, 0.15);
    this.loadedModel.scene.position.set(0, 0.3, 0);

    // let elem;
    this.mashes = [];
    const rloader = new RGBELoader();

    const hdrEquirect = await rloader.loadAsync('assets/textures/env-map.hdr');
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

    const reflectMaterial = new THREE.MeshPhysicalMaterial({
      color: '#00497c',
      emissiveIntensity: 5,
      clearcoat: 1.5,
      reflectivity: 1.5,
      transparent: true,
      envMap: hdrEquirect,
      transmission: 1,
      thickness: 1.5,
      roughness: 0.15,
      envMapIntensity: 0.05,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });

    this.loadedModel.scene.traverse((el) => {
      if (el.isMesh) {
        el.scale.set(0.8, 0.8, 0.8);
        el.material = reflectMaterial;
        el.castShadow = false;
        el.receiveShadow = false;
        el.needsUpdate = true;
        this.mashes.push(el);
      }
    });

    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.ShadowMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      opacity: 0.8
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    this.eventEmitter.notify('setInitFinished');
    this.scene.add(this.loadedModel.scene);

    const clips = this.loadedModel.animations;
    this.mixer = new THREE.AnimationMixer(this.loadedModel.scene);

    clips.forEach((clip) => {
      this.mixer.clipAction(clip).setLoop(THREE.LoopRepeat);
      this.mixer.clipAction(clip).timeScale = 0.0005;
      this.mixer.clipAction(clip).play();
    });
  }
}
