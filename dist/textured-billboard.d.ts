import { Billboard } from './billboard';
export type Direction = 'down' | 'right' | 'up' | 'left';
export type directionsToRows = Partial<Record<Direction | 'default', number>>;
export interface TexturedBillboardProps {
  textureName: string;
  frameDuration?: number;
  totalFrames?: number;
  directionsToRows?: directionsToRows;
}
export declare class TexturedBillboard extends Billboard {
  static directions: Direction[];
  static reverseDirections: Direction[];
  static findByAngle: (
    angle: number
  ) => (_animation: unknown, index: number) => boolean;
  readonly isPlayer: boolean;
  frame: number;
  frameDuration: number;
  totalFrames: number;
  directionsToRows: directionsToRows;
  constructor({
    textureName,
    frameDuration,
    totalFrames,
    directionsToRows
  }: TexturedBillboardProps);
  protected getDirection(): any;
  protected getRow(direction: Direction): number;
  protected update(ms: number): void;
}
//# sourceMappingURL=textured-billboard.d.ts.map
