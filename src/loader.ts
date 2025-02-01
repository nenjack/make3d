import { LoadingManager, Texture, type TextureLoader } from 'three';

export class Loader extends LoadingManager {
  textureLoader: TextureLoader;
  fbxLoader: FBXLoader;
  tgaLoader: boolean;

  constructor(
    onLoad?: () => void,
    onProgress?: (url: string, loaded: number, total: number) => void,
    onError?: (url: string) => void
  ) {
    super(onLoad, onProgress, onError);
  }

  async load(path: string): Promise<Texture | any> {
    return new Promise(async (resolve) => {
      const extension = path.toLowerCase().split('.').pop();

      switch (extension) {
        case 'tga':
          if (!this.tgaLoader) {
            this.tgaLoader = true;
            const { TGALoader } = await import(
              'three/examples/jsm/loaders/TGALoader.js'
            );
            this.addHandler(/\.tga$/i, new TGALoader());
          }
          break;

        case 'fbx':
          if (!this.fbxLoader) {
            const { FBXLoader } = await import(
              'three/examples/jsm/loaders/FBXLoader.js'
            );
            this.fbxLoader = new FBXLoader(this);
          }

          return this.fbxLoader.load(path, resolve);

        default:
          if (!this.textureLoader) {
            const { TextureLoader } = await import('three');
            this.textureLoader = new TextureLoader(this);
          }

          return this.textureLoader.load(path, resolve);
      }
    });
  }
}
