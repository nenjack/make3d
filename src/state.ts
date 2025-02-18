import { groupBits, System } from 'detect-collisions';
import { FrontSide, Texture } from 'three';
import { Loader } from './loader';
import { Direction, Key, State } from './model';
import { Mouse } from './mouse';
import { queryParams } from './query-params';
import { Renderer } from './renderer';
import { DeviceDetector } from './detect';

export const minLevelHeight = 2;

export const maxLevelHeight = 10;

export const waterZ = 0.5;

export const doubleClickTime = 400;

export const keys: Partial<Record<Key, boolean>> = {};

export const textures: Record<string, Texture> = {};

export const mouse = new Mouse();

export const physics = new System();

export const renderer = new Renderer();

export const loader = new Loader();

export const floors = Array.from(
  { length: maxLevelHeight },
  (_: unknown, power) => groupBits(128 * Math.pow(2, power))
);

export const state: State = {
  keys,
  mouse
};

export const materialProps = {
  transparent: true,
  alphaTest: 1,
  side: FrontSide
};

export const directions: Direction[] = ['up', 'right', 'down', 'left'];

export const Math_Half_PI = Math.PI * 0.5;

export const Math_Double_PI = Math.PI * 2;

export const defaultEnemiesCount =
  'limit' in queryParams
    ? Number(queryParams.limit)
    : DeviceDetector.HIGH_END
      ? 64
      : 16;
