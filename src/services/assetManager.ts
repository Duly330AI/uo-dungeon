export class AssetManager {
  private static images: Record<string, HTMLImageElement> = {};

  static async loadImage(key: string, src: string): Promise<HTMLImageElement> {
    if (this.images[key]) {
      return this.images[key];
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        this.images[key] = img;
        resolve(img);
      };
      img.onerror = (e) => {
        console.error(`Failed to load image: ${src}`, e);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  static getImage(key: string): HTMLImageElement | undefined {
    return this.images[key];
  }
}
