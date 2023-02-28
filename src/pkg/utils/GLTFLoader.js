// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js'
import { LoadingManager } from 'three'
import { DRACOLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/DRACOLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const manager = new LoadingManager();
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })

export default class ModelLoader {
  constructor(url, application) {
    this.url = url
    this.application = application
  }

  async initGLTFLoader(callback) {
    const loadingManager = new LoadingManager(
      () => {
        console.log('LOADED')

        if (callback) {
          setTimeout(() => {
            callback()
          })
        }
      },

      // progress
      (item, loaded, total) => {
        if (!this.application) return
        const progress = loaded / total
        console.log(progress, ' progress');
      }
    )
    const loader = new GLTFLoader(loadingManager)
    loader.setDRACOLoader(dracoLoader)

    try {
      this.application.loadedModel = await loader.loadAsync(this.url)
    } catch (e) {
      console.error(e.message)
    }
  }
}
