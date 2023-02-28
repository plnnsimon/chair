/* eslint-disable dot-notation */
import * as THREE from 'three'

export default class Renderer {
  constructor(application) {
    this.canvas = application.canvas
    this.canvasContainer = application.canvasContainer
    this.sizes = application.sizes
    this.scene = application.scene
    this.camera = application.camera

    this.generator = null

    this.setRenderer()
  }

  setRenderer() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })

    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.autoUpdate = false
    this.instance.shadowMap.needsUpdate = true
    // this.instance.toneMapping = THREE.ReinhardToneMapping
    // this.instance.toneMapping = THREE.ACESFilmicToneMapping
    // this.instance.toneMapping = THREE.CineonToneMapping
    // this.instance.toneMapping = THREE.LinearToneMapping

    this.instance.toneMapping = THREE.ReinhardToneMapping
    this.instance.toneMappingExposure = 1
    this.instance.autoClear = false
    this.instance.useLegacyLights = true

    this.instance.outputEncoding = THREE.sRGBEncoding
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
