import * as THREE from 'three'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'

export default class Camera {
  constructor(application) {
    this.sizes = application.sizes
    this.scene = application.scene
    this.canvas = application.canvas

    this.cameraZPos = 4

    this.setInstance()
    this.setOrbitControls()
    this.resize()
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(45, this.sizes.aspect, 0.1, 30)
    this.instance.lookAt(new THREE.Vector3(0, 0, 0))
    this.instance.position.set(0, 2, 0)
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.target.set(0, 0, 0)
    this.controls.enabled = false

    // Zoom in / zoom out
    // this.controls.minDistance = this.cameraZPos
    // this.controls.maxDistance = this.cameraZPos

    // Where to stop rotation :
    this.controls.minPolarAngle = 1.45
    this.controls.maxPolarAngle = 1.45
    this.controls.update()
  }

  resize() {
    this.instance.aspect = this.sizes.aspect
    this.instance.updateProjectionMatrix()
  }

  update() {
    if (this.controls && this.controls.update) this.controls.update()
  }
}
