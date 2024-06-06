import { ConfiguratorApplication } from './js/applications/configurator/index.js'
import EventEmitter from './pkg/utils/EventEmitter.js'

const emitter = new EventEmitter()
const configuratorApplication = new ConfiguratorApplication(emitter)
const canvas = document.getElementById('scene-canvas')
const container = document.getElementById('scene-container')
configuratorApplication.build(canvas, container)
configuratorApplication.mount()

const woods = document.querySelectorAll('.wood')
woods.forEach((wood) => {
  wood.addEventListener('click', (ev) => {
    console.log(ev.target.src, ' IMAGE')
    configuratorApplication.setTexture(ev.target.src, 'wood')
  })
})

const fabrics = document.querySelectorAll('.fabric')
fabrics.forEach((fabric) => {
  fabric.addEventListener('click', (ev) => {
    console.log(ev.target.src, ' IMAGE')
    configuratorApplication.setTexture(ev.target.src, 'fabric')
  })
})

const color = document.getElementById('color')
color.addEventListener('input', (ev) => {
  configuratorApplication.setColor(ev.target.value, 'fabric')
})

configuratorApplication.initGLTFLoader("assets/models/SinteponС2.glb")