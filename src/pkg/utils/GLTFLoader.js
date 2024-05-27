// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'
import { LoadingManager } from 'three'
import { DRACOLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js'

const manager = new LoadingManager();
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);
dracoLoader.setDecoderConfig({ type: 'js' })


export default class ModelLoader {
  constructor(url, application) {
      this.url = url
      this.application = application
  }

  async initGLTFLoader(url) {
      const loadingManager = new LoadingManager(
          () => {},

          // progress
          (item, loaded, total) => {
              if (!this.application) return
              const progress = loaded / total
              this.application.eventEmitter.notify('loadedProgress', progress)
          }
      )
      const loader = new GLTFLoader(loadingManager)
      loader.setDRACOLoader(dracoLoader)
      try {
          const obj = await loader.loadAsync(url || this.url)
          if (this.application) {
              this.application.eventEmitter.notify('setLoadingFinished')
          }
          return obj
      } catch (e) {
          console.error(e.message)
      }
  }
}