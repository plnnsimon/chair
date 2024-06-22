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
    setAnimation(this);

    if (this.scene) {
      this.scene.rotation.y += 0.005
    }

    if (this.mashes?.length) {
      const quaternion = new THREE.Quaternion();
      const axis = new THREE.Vector3(0, 0, 1);
      const angle = THREE.MathUtils.degToRad(0.4);
      quaternion.setFromAxisAngle(axis, angle);
      this.mashes.forEach((el) => {
        // el.rotation.y -= 0.01;
        // el.rotation.x += 0.01;
        // el.rotation.z += 0.01;
        el.quaternion.multiplyQuaternions(quaternion, el.quaternion);
      });
    }
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  /**
   * LOAD MODEL
   */
  async initGLTFLoader(url) {
    const loader = new ModelLoader('', this);

    this.loadedModel = await loader.initGLTFLoader(url);
    this.loadedModel.scene.scale.set(0.15, 0.15, 0.15);
    this.loadedModel.scene.position.set(0, 0.3, 0);
    this.scene.add(this.loadedModel.scene);
    console.log(this.loadedModel, ' this.loadedModel');
    let elem;
    this.mashes = [];
    const hdrEquirect = new RGBELoader().load(
      'assets/textures/empty_warehouse_01_2k.hdr',
      () => {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      }
    );

    const reflectMaterial = new THREE.MeshPhysicalMaterial({
      // ior: 2.35,
      color: '#0095ff',
      emissiveIntensity: 5,
      clearcoat: 1.5,
      reflectivity: 1.5,
      // opacity: 0.9,
      transparent: true,
      envMap: hdrEquirect,
      transmission: 1,
      thickness: 1.5,
      roughness: 0.15,
      // metallness: 0,
      envMapIntensity: 0.05,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });

    // const icoSphere = new THREE.IcosahedronGeometry(0.2, 10);
    // const mesh = new THREE.Mesh(icoSphere, reflectMaterial);
    // mesh.position.y = 0.4;
    // this.scene.add(mesh);

    this.loadedModel.scene.traverse((el) => {
      if (el.isMesh) {
        el.scale.set(0.8, 0.8, 0.8);
        el.material = reflectMaterial;
        el.castShadow = false;
        el.receiveShadow = false;
        el.needsUpdate = true;
        elem = el;
        this.mashes.push(el);
      }
    });

    // this.gui.add(elem.material, 'metalness', 0, 5, 0.001);
    // this.gui.add(elem.material, 'roughness', 0, 5, 0.001);
    // // this.gui.add(elem.material, 'transparency', 0, 5, 0.001)
    // this.gui.add(elem.material, 'opacity', 0, 5, 0.001);
    // this.gui.add(elem.material, 'transmission', 0, 5, 0.001);
    // this.gui.add(elem.material, 'reflectivity', 0, 5, 0.001);
    // this.gui.add(elem.material, 'thickness', 0, 5, 0.001);
    // this.gui.add(elem.material, 'ior', -5, 5, 0.001);
    // this.gui.add(elem.material, 'clearcoat', -5, 5, 0.001);
    // this.gui.add(elem.material, 'clearcoatRoughness', -5, 5, 0.001);
    // this.gui.add(elem.material, 'envMapIntensity', -5, 5, 0.001);

    // console.log(this.scene);

    // this.setIntersects();

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
  }
}
