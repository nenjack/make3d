import { groupBits, System } from 'detect-collisions';
import { Texture, Vector2 } from 'three';
import { Loader } from './loader';
import { Direction, Key, State } from './model';
import { Renderer } from './renderer';

export const minLevelHeight = 3;

export const maxLevelHeight = 6;

export const waterZ = 0.5;

export const doubleClickTime = 400;

export const keys: Partial<Record<Key, boolean>> = {};

export const textures: Record<string, Texture> = {};

export const mouse = new Vector2();

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
  alphaTest: 1
};

export const directions: Direction[] = ['up', 'right', 'down', 'left'];

export const Math_Half_PI = Math.PI * 0.5;

export const Math_Double_PI = Math.PI * 2;
