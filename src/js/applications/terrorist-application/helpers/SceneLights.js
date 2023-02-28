import * as THREE from 'three'
// import * as dat from 'dat.gui'

export default class SceneLights {
  constructor(application) {
    this.scene = application.scene
    this.lightsList = []
  }

  getDirectionalLights(options = {}) {
    const pos = options.position || {
      x: 0,
      y: 0,
      z: 0,
    }
    const light = new THREE.DirectionalLight(options.color || 0xffffff)
    light.intensity = options.intensity
    light.castShadow = true
    light.position.set(pos.x, pos.y, pos.z)
    light.lookAt(0, 0, 0)
    return light
  }

  async initializeLights() {
    // const gui = new dat.GUI()
    const ambientLight = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambientLight)

    const mainLight = this.getDirectionalLights({
      intensity: 1,
      position: {
        x: 1500,
        y: 1500,
        z: 1500,
      }
    })
    this.scene.add(mainLight);
    // const helper1 = new THREE.DirectionalLightHelper(mainLight, 1000)
    // this.scene.add(helper1)
  }
}
