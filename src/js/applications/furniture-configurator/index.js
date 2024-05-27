import * as THREE from "three";
import { ThreejsApplication } from "@/three";
import gsap from "gsap";
import Camera from "./utils/Camera.js";
import Renderer from "./utils/Renderer.js";
import SceneLights from "./helpers/SceneLights";
import AnnotationMaker from "@/three/utils/AnnotationMaker";
import useModelsUtils from "@/three/utils/use-models-utils";
import Sizes from "@/three/utils/Sizes";
import ModelLoader from "@/three/gltf-loader";
// import { GUI } from "dat.gui";
import TWEEN from "@tweenjs/tween.js";

// const stats = new Stats()
// stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild(stats.dom)

let instance = null;
const { disposeSceneData, setAnimation } = useModelsUtils();

export default class BicycleApplication extends ThreejsApplication {
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
    this.annotation = null;
    // this.gui = new GUI();
    this.sceneLights = new SceneLights(this);
  }

  async build(canvas, canvasDomElement) {
    this.canvas = canvas;
    this.canvasDomElement = canvasDomElement;
    this.sizes = new Sizes(canvasDomElement);

    this.annotation = new AnnotationMaker(canvasDomElement, this);

    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    // resize event
    this.resize();
    this.sizes.subscribe("resize", () => {
      this.resize();
    });
  }

  /**
   * INITIALIZATION
   */
  animateFrame() {
    setAnimation(this);
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  /**
   * LOAD MODEL
   */
  async initGLTFLoader() {
    const url = "/models/bicycle_1.glb";
    const loader = new ModelLoader("", this);

    this.loadedModel = await loader.initGLTFLoader(url);
    this.scene.add(this.loadedModel.scene);

    // this.setIntersects();
    // this.setRaycaster();

    const geometry = new THREE.PlaneGeometry(4, 4);
    const material = new THREE.ShadowMaterial({
      color: 0x90909,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0.56;
    this.scene.add(plane);

    this.scene.traverse((el) => {
      el.castShadow = true;
      el.receiveShadow = true;
    });

    this.objects = [
      {
        name: "seat",
        mesh: null,
        defaultMaterial: null,
      },
      {
        name: "handlebar",
        mesh: null,
        defaultMaterial: null,
      },
      {
        name: "pedal_left",
        mesh: null,
        defaultMaterial: null,
      },
      {
        name: "pedal_right",
        mesh: null,
        defaultMaterial: null,
      },
      {
        name: "frame_main",
        mesh: null,
        defaultMaterial: null,
      },
      {
        name: "frame_secondary",
        mesh: null,
        defaultMaterial: null,
      },
    ];

    this.objects.forEach((el, idx) => {
      const mesh = this.scene.getObjectByName(el.name);
      el.mesh = mesh;
      el.defaultMaterial = mesh.material;
      const pos = new THREE.Vector3(
        mesh.parent.position.x,
        mesh.parent.position.y + 0.05,
        mesh.parent.position.z
      );
      this.annotation.createAnnotation({
        pointId: idx + 1,
        position: pos,
        text: el.name,
        name: el.name,
      });
    });
    this.eventEmitter.notify("setInitFinished");

    // Because in _index.scss there is the .main__loading transition styles
    setTimeout(() => {
      gsap.to(this.camera.instance.position, {
        z: -1.5,
        x: -1.5,
        y: 0.5,
        duration: 2,
      });

      gsap.to(this.renderer.instance.cocMaterial.uniforms.focusDistance, {
        value: 0,
        duration: 2,
      });
      gsap.to(this.renderer.instance.cocMaterial.uniforms.focalLength, {
        value: 2,
        duration: 2,
      });
      gsap.to(this.renderer.instance.depthOfFieldEffect, {
        bokehScale: 0,
        duration: 2,
      });
    }, 300);
  }

  handleSelection(itemToOutline) {
    if (
      !this.renderer.instance ||
      !this.renderer.instance?.outlineEffect?.selection
    ) {
      return;
    }

    const selection = this.renderer.instance.outlineEffect.selection;
    selection.clear();
    if (itemToOutline) {
      selection.add(itemToOutline);
    }
  }

  resetCameraPosition() {
    const DURATION = 2;
    this.camera.controls.minDistance = this.camera.defaultValues.minDistance;
    this.camera.controls.maxDistance = this.camera.defaultValues.maxDistance;
    const dataForPosition = {
      x: this.camera.defaultValues.position.x,
      y: this.camera.defaultValues.position.y,
      z: this.camera.defaultValues.position.z,
      duration: DURATION,
    };
    gsap.to(this.camera.instance.position, dataForPosition);
    gsap.to(this.camera.controls.position0, dataForPosition);
    gsap.to(this.camera.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: DURATION,
      // ease: 'Power1'
    });
    const button = document.querySelector(".reset-camera");
    button.classList.remove("reset-camera_visible");
    this.renderer.instance.cocMaterial.uniforms.focalLength.value = 2;
    this.renderer.instance.depthOfFieldEffect.bokehScale = 0;
  }

  setModelDepthOfFieldEffect() {
    this.renderer.instance.cocMaterial.uniforms.focalLength.value = 0.04;
    this.renderer.instance.depthOfFieldEffect.bokehScale = 6.0;
  }

  /**
   * SETTERS
   */
  setIntersectsOnClick(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera.instance);
    const objectsToIntersect = this.objects.map((el) => el.mesh);

    const intersects = this.raycaster.intersectObjects([
      ...objectsToIntersect,
      ...this.annotation.points,
    ]);
    if (intersects.length) {
      return intersects[0].object;
    } else {
      return null;
    }
  }

  setRenderBg(imagePath) {
    const bgTexture = new THREE.TextureLoader().load(imagePath);
    // bgTexture.bac
    bgTexture.premultiplyAlpha = true;
    bgTexture.encoding = THREE.sRGBEncoding;
    bgTexture.colorSpace = THREE.sRGBEncoding;
    this.scene.background = bgTexture;
  }

  setColor(object, texturePath) {
    const mapTexture = new THREE.TextureLoader().load(texturePath);
    mapTexture.generateMipmaps = false;
    mapTexture.wrapS = mapTexture.wrapT = THREE.RepeatWrapping;
    // mapTexture.repeat.set(0.25, 0.25);
    mapTexture.encoding = THREE.sRGBEncoding;
    mapTexture.flipY = false;
    // mapTexture.offset.set(0.5, 0.5);
    mapTexture.minFilter = THREE.LinearFilter;
    mapTexture.magFilter = THREE.LinearFilter;

    if (!mapTexture) {
      return;
    }
    object.material.map = mapTexture;
    object.material.needsUpdate = true;
  }

  goToAnnotation(annotation) {
    this.camera.controls.minDistance = 0;
    const x = annotation.position.x < 0 ? -0.5 : 0.5;
    new TWEEN.Tween(this.camera.instance.position)
      .to(
        {
          x: annotation.position.x + x,
          y: annotation.position.y + 0.2,
          z: annotation.position.z - 0.2,
        },
        500
      )
      .easing(TWEEN.Easing.Cubic.Out)
      .start()
      .onComplete(() => {
        this.camera.controls.minDistance = Math.abs(
          this.camera.instance.position.x
        );
        this.camera.controls.maxDistance = Math.abs(
          this.camera.instance.position.x
        );
        const button = document.querySelector(".reset-camera");
        button.classList.add("reset-camera_visible");
      });

    new TWEEN.Tween(this.camera.controls.target)
      .to(
        {
          x: annotation.position.x,
          y: annotation.position.y,
          z: annotation.position.z,
        },
        500
      )
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }

  hoverObjects() {
    this.raycaster.setFromCamera(this.pointer, this.camera.instance);
    const intersects = this.raycaster.intersectObjects(this.intersects, true);
    const clearIntersects = () => {
      if (!this.intersects.length) return;
      this.intersects.forEach((el) => {
        el.material.opacity = 0;
      });
    };
    if (intersects.length > 0 && this.canIntersect) {
      if (intersects[0].object.name.includes("car-body")) {
        clearIntersects();
      } else {
        clearIntersects();
        intersects[0].object.material.opacity = 0.5;
      }
      this.intersected = intersects[0].object.name;
    } else {
      clearIntersects();
      this.intersected = null;
    }
  }
  // end helpers
}
