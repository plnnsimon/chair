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
    light.intensity = options.intensity || 5
    light.castShadow = true
    light.shadow.bias = -0.009
    light.shadow.mapSize.set(1024, 1024)
    light.shadow.camera.far = 10
    light.shadow.camera.near = 0
    light.shadow.camera.top = 10
    light.shadow.camera.right = 10
    light.shadow.camera.left = -10
    light.shadow.camera.bottom = -10
    light.position.set(pos.x, pos.y, pos.z)
    light.lookAt(0, 0, 0)
    return light
  }

  initializeLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0)
    this.scene.add(ambientLight)
  }
}
