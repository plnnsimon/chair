import { ConfiguratorApplication } from './js/applications/configurator/index.js';
import EventEmitter from './pkg/utils/EventEmitter.js';

const emitter = new EventEmitter();
const configuratorApplication = new ConfiguratorApplication(emitter);
const canvas = document.getElementById('scene-canvas');
const color = document.getElementById('color');
const colorWood = document.getElementById('colorWood');
const container = document.getElementById('scene-container');
configuratorApplication.build(canvas, container);
configuratorApplication.mount();

// const woods = document.querySelectorAll('.wood')
// woods.forEach((wood) => {
//   wood.addEventListener('click', (ev) => {
//     console.log(ev.target.src, ' IMAGE')
//     configuratorApplication.setTexture(ev.target.src, 'wood')
//   })
// })

// const fabrics = document.querySelectorAll('.fabric')
// fabrics.forEach((fabric) => {
//   fabric.addEventListener('click', (ev) => {
//     console.log(ev.target.src, ' IMAGE')
//     configuratorApplication.setTexture(ev.target.src, 'fabric')
//   })
// })

// range.addEventListener('input', (ev) => {
//   configuratorApplication.setIntensity(ev.target.value, 'fabric')
// })
color.addEventListener('input', (ev) => {
  configuratorApplication.setColor(ev.target.value, 'fabric');
});

colorWood.addEventListener('input', (ev) => {
  configuratorApplication.setColor(ev.target.value, 'wood');
});

configuratorApplication.initGLTFLoader('assets/models/SinteponС2.glb');

const arr = [
  'rgb(61, 112, 179)',
  'rgb(127, 94, 72)',
  'rgb(77, 77, 77)',
  'rgb(52, 126, 42)',
  'rgb(184, 184, 184)',
  'rgb(172, 12, 12)',
  'rgb(255, 97, 160)'
];

const arrWoods = ['rgb(246, 147, 55)', 'rgb(114, 59, 8)'];

const colors = document.getElementById('colors');
const woods = document.getElementById('woods');

arr.forEach((c) => {
  const div = document.createElement('div');
  div.style.backgroundColor = c;
  div.className = 'color-item';
  div.addEventListener('click', (ev) => {
    configuratorApplication.setColor(ev.target.style.backgroundColor, 'fabric');
  });
  colors.appendChild(div);
});

arrWoods.forEach((c) => {
  const div = document.createElement('div');
  div.style.backgroundColor = c;
  div.className = 'color-item';
  div.addEventListener('click', (ev) => {
    configuratorApplication.setColor(ev.target.style.backgroundColor, 'wood');
  });
  woods.appendChild(div);
});


emitter.subscribe('setInitFinished', (ev) => {

  configuratorApplication.setColor(arr[0], 'fabric')
  configuratorApplication.setColor(arrWoods[0], 'wood')
})