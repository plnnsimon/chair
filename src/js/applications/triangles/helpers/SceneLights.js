import * as THREE from "three";
// import { GUI } from 'dat.gui';

export default class SceneLights {
  constructor(application) {
    this.application = application;
    this.scene = application.scene;
    this.lightsList = [];

    this.initializeLights();
  }

  getDirectionalLights(options = {}) {
    // const SHADOW_SIZE = 4098
    const SHADOW_SIZE = 64
    const pos = options.position || {
      x: 0,
      y: 0,
      z: 0,
    };
    const light = new THREE.DirectionalLight();
    light.intensity = options.intensity || 10;
    light.color = new THREE.Color(options.color || 0xffffff)
    light.castShadow = options.castShadow !== undefined ? options.castShadow : true;
    light.shadow.bias = -0.003;
    light.shadow.mapSize.set(SHADOW_SIZE, SHADOW_SIZE);
    light.shadow.camera.far = 10;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.top = 10;
    light.shadow.camera.right = 10;
    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    // light.distance = 15
    // light.decay = 0
    light.position.set(pos.x, pos.y, pos.z);
    light.lookAt(0, 0, 0);
    light.updateMatrixWorld()
    return light;
  }

  getPointLights(options = {}) {
    // const SHADOW_SIZE = 4098
    const SHADOW_SIZE = 64
    const pos = options.position || {
      x: 0,
      y: 0,
      z: 0,
    };
    const light = new THREE.PointLight();
    light.intensity = options.intensity || 10;
    light.color = new THREE.Color(options.color || 0xffffff)
    light.shadow.bias = -0.003;
    light.shadow.mapSize.set(SHADOW_SIZE, SHADOW_SIZE);
    light.shadow.camera.far = 10;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.top = 10;
    light.shadow.camera.right = 10;
    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    // light.distance = 15
    // light.decay = 0
    light.position.set(pos.x, pos.y, pos.z);
    light.lookAt(0, 0, 0);
    light.updateMatrixWorld()
    return light;
  }

  initializeLights() {
    // const ambient = new THREE.AmbientLight('#ffffff', 0.5)
    const directionLight = this.getPointLights({
      position: { x: -2, y: 3, z: 1 },
      intensity: 20,
      color: '#1aff00'
    });
    // const ambient = new THREE.AmbientLight('#ffffff', 0.5)
    const directionLight2 = this.getPointLights({
      position: { x: 2, y: 3, z: 2 },
      intensity: 15,
      color: '#f2ff00'
    });

    // const hemiLight = new THREE.HemisphereLight(0Xffffff, 0Xffffff, 100)

    this.scene.add(directionLight);
    this.scene.add(directionLight2);
    // this.scene.add(hemiLight);
    // this.application.gui.add(ambient, 'intensity', 0, 10, 0.001).name('light')
    // this.scene.add(ambient);
  }
}
