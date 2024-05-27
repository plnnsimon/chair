import * as THREE from "three";
// import { GUI } from 'dat.gui';

export default class SceneLights {
  constructor(application) {
    this.application = application;
    this.scene = application.scene;
    this.lightsList = [];

    this.initializeLights();
  }

  getPointLights(options = {}) {
    const SHADOW_SIZE = 4092
    const pos = options.position || {
      x: 0,
      y: 0,
      z: 0,
    };
    const light = new THREE.DirectionalLight();
    light.intensity = options.intensity || 10;
    light.color = new THREE.Color(options.color || 0xffffff)
    light.castShadow = true;
    light.shadow.bias = -0.003;
    light.shadow.mapSize.set(SHADOW_SIZE, SHADOW_SIZE);
    light.shadow.camera.far = 10;
    light.shadow.camera.near = 0.05;
    light.shadow.camera.top = 5;
    light.shadow.camera.right = 5;
    light.shadow.camera.left = -5;
    light.shadow.camera.bottom = -5;
    // light.distance = 15
    // light.decay = 0
    light.position.set(pos.x, pos.y, pos.z);
    light.lookAt(0, 0, 0);
    return light;
  }

  initializeLights() {
    const directionLight = this.getPointLights({
      position: { x: -1.5, y: 3.5, z: 0.5 },
      intensity: 4.86,
    });
    // const helper1 = new THREE.DirectionalLightHelper(directionLight, 1);

    this.scene.add(directionLight);
    // this.scene.add(helper1);
    // const lightFolder = this.application.gui.addFolder("Light");
    // lightFolder.add(directionLight, "intensity", 0, 100, 0.01);
    // lightFolder.add(directionLight.position, "x", -10, 10, 0.001);
    // lightFolder.add(directionLight.position, "y", -10, 10, 0.001);
    // lightFolder.add(directionLight.position, "z", -10, 10, 0.001);
    // const colorObj = { color: '#FFFFFF' }
    // lightFolder.addColor(colorObj, 'color').onChange((value) => {
    //   directionLight.color = new THREE.Color(value)
    // })
  }
}
