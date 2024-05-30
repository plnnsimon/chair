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
    const SHADOW_SIZE = 4098
    // const SHADOW_SIZE = 512
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
    const SHADOW_SIZE = 4098
    // const SHADOW_SIZE = 512
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
    const directionLight = this.getDirectionalLights({
      position: { x: 0, y: 5, z: -0.5 },
      intensity: 10,
    });
    // const helper1 = new THREE.DirectionalLightHelper(directionLight, 1);

    this.scene.add(directionLight);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#ffffff', 1)

    const directionLight2 = this.getPointLights({
      position: { x: -1.8, y: 1, z: 1 },
      intensity: 15,
    });
    directionLight2.castShadow = false
    this.scene.add(directionLight2);

    const directionLight3 = this.getPointLights({
      position: { x: 1.8, y: 1, z: -1 },
      intensity: 15,
    });
    directionLight2.castShadow = false
    this.scene.add(directionLight3);
    // const helper1 = new THREE.DirectionalLightHelper(directionLight, 1);

    // this.scene.add(hemiLight);
    // this.scene.add(helper1);
    // const lightFolder = this.application.gui.addFolder("Light");
    // lightFolder.add(directionLight, "intensity", 0, 100, 0.01);
    // lightFolder.add(directionLight.position, "x", -10, 10, 0.001);
    // lightFolder.add(directionLight.position, "y", -10, 10, 0.001);
    // lightFolder.add(directionLight.position, "z", -10, 10, 0.001);
    // // this.scene.add(helper1);
    // const lightFolder2 = this.application.gui.addFolder("Light 2");
    // lightFolder2.add(directionLight2, "intensity", 0, 100, 0.01);
    // lightFolder2.add(directionLight2.position, "x", -10, 10, 0.001);
    // lightFolder2.add(directionLight2.position, "y", -10, 10, 0.001);
    // lightFolder2.add(directionLight2.position, "z", -10, 10, 0.001);
    // const colorObj = { color: '#FFFFFF' }
    // lightFolder.addColor(colorObj, 'color').onChange((value) => {
    //   directionLight.color = new THREE.Color(value)
    // })
  }
}
