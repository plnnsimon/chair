import { ConfiguratorApplication } from './js/applications/configurator/index.js';
import EventEmitter from './pkg/utils/EventEmitter.js';

const emitter = new EventEmitter();
const configuratorApplication = new ConfiguratorApplication(emitter);
const sceneControls = document.getElementById('scene-controls');
const canvas = document.getElementById('scene-canvas');
const color = document.getElementById('color');
const colorWood = document.getElementById('colorWood');
const container = document.getElementById('scene-container');
configuratorApplication.build(canvas, container);
configuratorApplication.mount();

color.addEventListener('input', (ev) => {
  configuratorApplication.setColor(ev.target.value, 'fabric');
});

colorWood.addEventListener('input', (ev) => {
  configuratorApplication.setColor(ev.target.value, 'wood');
});

const urlParams = new URLSearchParams(window.location.search);
const modelPath =
  urlParams.get('model') || 'utils/models/1101.11.2_1101.13.glb';
configuratorApplication.initGLTFLoader(modelPath);

const arr = [
  'rgb(61, 112, 179)',
  'rgb(127, 94, 72)',
  'rgb(77, 77, 77)',
  'rgb(52, 126, 42)',
  'rgb(184, 184, 184)',
  'rgb(172, 12, 12)',
  'rgb(255, 97, 160)',
  'rgb(43, 43, 43)'
];

const arrWoods = [
  'rgb(162, 108, 47)',
  'rgb(68, 45, 19)',
  'rgb(246, 147, 55)',
  'rgb(114, 59, 8)'
];

const colors = document.getElementById('colors');
const woods = document.getElementById('woods');

function rgbToHex(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function setColorPickerValue(colorValue, type) {
  const hexColor = rgbToHex(colorValue);
  if (type === 'fabric') {
    color.value = hexColor;
  } else if (type === 'wood') {
    colorWood.value = hexColor;
  }
}

arr.forEach((c) => {
  const div = document.createElement('div');
  div.style.backgroundColor = c;
  div.className = 'color-item';
  div.addEventListener('click', (ev) => {
    configuratorApplication.setColor(ev.target.style.backgroundColor, 'fabric');
    setColorPickerValue(ev.target.style.backgroundColor, 'fabric');
  });
  colors.appendChild(div);
});

arrWoods.forEach((c) => {
  const div = document.createElement('div');
  div.style.backgroundColor = c;
  div.className = 'color-item';
  div.addEventListener('click', (ev) => {
    configuratorApplication.setColor(ev.target.style.backgroundColor, 'wood');
    setColorPickerValue(ev.target.style.backgroundColor, 'wood');
  });
  woods.appendChild(div);
});

emitter.subscribe('setInitFinished', (ev) => {
  configuratorApplication.setColor(arr[0], 'fabric');
  configuratorApplication.setColor(arrWoods[0], 'wood');
  setColorPickerValue(arr[0], 'fabric');
  setColorPickerValue(arrWoods[0], 'wood');
});

document.getElementById('captureButton').addEventListener('click', () => {
  configuratorApplication.renderer.setSnapRenderer();
  const imgData =
    configuratorApplication.renderer.instance2.domElement.toDataURL(
      'image/png'
    );
  downloadImage(imgData, 'threejs-capture.png');
  configuratorApplication.renderer.reSetSnapRenderer();
});

function downloadImage(data, filename) {
  const a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function setSceneControls() {
  const controls = {
    x: 0,
    y: 0,
    z: 0
  };

  for (const key in controls) {
    const container = document.createElement('div');
    container.className = 'scene-controls__input';
    const label = document.createElement('label');
    const input = document.createElement('input');

    label.setAttribute('for', key);
    label.innerHTML = key.toLocaleUpperCase();

    input.id = key;
    input.type = 'range';
    input.min = -10;
    input.max = 10;
    input.step = 0.0001;
    input.value = controls[key];
    input.addEventListener('input', (ev) => {
      configuratorApplication.scene.position[key] = ev.target.value;
      label.innerHTML = `${key.toLocaleUpperCase()} (${Number(
        ev.target.value
      ).toFixed(2)})`;
    });

    container.appendChild(label);
    container.appendChild(input);

    sceneControls.appendChild(container);
  }
}

setSceneControls();
