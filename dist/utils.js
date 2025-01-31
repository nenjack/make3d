'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createMaterial = exports.getMatrix = exports.randomOf = void 0;
const three_1 = require('three');
const state_1 = require('./state');
const randomOf = (array) => array[Math.floor(Math.random() * array.length)];
exports.randomOf = randomOf;
const getMatrix = (position, rotation, scale) => {
  const matrix = new three_1.Matrix4();
  const quaternion = new three_1.Quaternion();
  const offset = new three_1.Vector3(0.5, 0.5, 0);
  quaternion.setFromEuler(rotation);
  matrix.compose(position.add(offset), quaternion, scale);
  return matrix;
};
exports.getMatrix = getMatrix;
const createMaterial = (textureName) => {
  try {
    const material = new three_1.MeshBasicMaterial({
      map: state_1.textures[textureName].clone(),
      transparent: true
    });
    material.size = new three_1.Vector2(90 / 3, 240 / 6);
    return material;
  } catch (_missing) {
    console.warn(
      `${textureName} missing in ${Object.keys(state_1.textures).join(', ')}`
    );
    return {};
  }
};
exports.createMaterial = createMaterial;
