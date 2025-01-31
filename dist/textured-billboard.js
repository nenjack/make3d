'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TexturedBillboard = void 0;
const three_1 = require('three');
const billboard_1 = require('./billboard');
const state_1 = require('./state');
const utils_1 = require('./utils');
class TexturedBillboard extends billboard_1.Billboard {
  constructor({
    textureName = '',
    frameDuration = 60,
    totalFrames = 1,
    directionsToRows = {}
  }) {
    super((0, utils_1.createMaterial)(textureName));
    this.isPlayer = false;
    this.frame = 0;
    this.frameDuration = frameDuration;
    this.directionsToRows = directionsToRows;
    this.totalFrames = totalFrames;
  }
  getDirection() {
    const characterAngle = this.normalize(this.body.angle);
    const cameraAngle = this.normalize(
      state_1.renderer.camera.rotation.z - Math.PI / 2
    );
    const angle = this.normalize(characterAngle - cameraAngle + Math.PI / 4);
    const findByAngle = TexturedBillboard.findByAngle(angle);
    const direction =
      TexturedBillboard.directions.find(findByAngle) ||
      TexturedBillboard.directions[0];
    return this.gear === -1
      ? TexturedBillboard.reverseDirections[direction]
      : direction;
  }
  getRow(direction) {
    var _a;
    return (
      ((_a = this.directionsToRows[direction]) !== null && _a !== void 0
        ? _a
        : this.directionsToRows.default) || 0
    );
  }
  update(ms) {
    var _a;
    super.update(ms);
    if (Object.values(this.state.keys).some(Boolean)) {
      this.frame = (this.frame + ms / this.frameDuration) % this.totalFrames;
    }
    const frame = Math.floor(this.frame);
    const direction = this.getDirection();
    const row = this.getRow(direction);
    const x = (frame % 3) / 3;
    const y = (Math.floor(frame / 3) + row) / this.totalFrames;
    const material = this.mesh.material;
    if (material instanceof three_1.MeshBasicMaterial) {
      (_a = material.map) === null || _a === void 0
        ? void 0
        : _a.offset.set(x, y);
      this.scale.x = (direction === 'left' ? -1 : 1) * Math.abs(this.scale.x);
    }
  }
}
exports.TexturedBillboard = TexturedBillboard;
TexturedBillboard.directions = ['down', 'right', 'up', 'left'];
TexturedBillboard.reverseDirections = ['up', 'left', 'down', 'right'];
TexturedBillboard.findByAngle = (angle) => (_animation, index) =>
  angle >= (Math.PI / 2) * index && angle < (Math.PI / 2) * (index + 1);
