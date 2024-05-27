import { FurnitureApplication } from '@/js/applications/furniture-configurator/index.js'
import EventEmitter from '@/pkg/utils/EventEmitter.js'

const emitter = new EventEmitter()
// const planetsApplication = new PlanetsApplication('/src/js/models/Planet_Final.glb')
const furnitureApplication = new FurnitureApplication(emitter)
const canvas = document.getElementById('scene-canvas')
const container = document.getElementById('scene-container')
furnitureApplication.build(canvas, container)
furnitureApplication.mount()
// this.eventEmitter.subscribe("loadedProgress", (data) => {
//   this.progress = `${(data * 100).toFixed(0)}%`;
// });
// this.eventEmitter.subscribe("setInitFinished", () => {
//   this.isLoaded = true;
// });
const woods = document.querySelectorAll('.wood')
woods.forEach((wood) => {
  wood.addEventListener('click', (ev) => {
    console.log(ev.target.src, ' IMAGE')
    furnitureApplication.setTexture(ev.target.src, 'wood')
  })
})
const fabrics = document.querySelectorAll('.fabric')
fabrics.forEach((fabric) => {
  fabric.addEventListener('click', (ev) => {
    console.log(ev.target.src, ' IMAGE')
    furnitureApplication.setTexture(ev.target.src, 'fabric')
  })
})

const color = document.getElementById('color')
color.addEventListener('input', (ev) => {
  furnitureApplication.setColor(ev.target.value, 'wood')
})

// furnitureApplication.initGLTFLoader("/src/js/models/model.glb")
furnitureApplication.initGLTFLoader("/src/js/models/sinteponchair.glb")