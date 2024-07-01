import { ConfiguratorApplication } from './js/applications/configurator/index.js';
import EventEmitter from './pkg/utils/EventEmitter.js';

const emitter = new EventEmitter();
const configuratorApplication = new ConfiguratorApplication(emitter);
const canvas = document.getElementById('scene-canvas');
const container = document.getElementById('scene-container');

configuratorApplication.build(canvas, container);
configuratorApplication.mount();

configuratorApplication.initGLTFLoader('assets/models/SinteponС2.glb');
console.log(
  configuratorApplication.renderer,
  ' onfiguratorApplication.renderer'
);

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
