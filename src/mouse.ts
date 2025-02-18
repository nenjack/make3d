import { Vector2 } from 'three';
import { doubleClickTime, state } from './state';

export class Mouse extends Vector2 {
  pageX = innerWidth / 2;
  pageY = innerWidth / 2;
  lastClickTime = 0;

  onPointerMove(event: MouseEvent | TouchEvent) {
    const pointer = event instanceof TouchEvent ? event.touches[0] : event;
    if (pointer && state.player) {
      event.preventDefault();

      this.pageX = pointer.pageX;
      this.pageY = pointer.pageY;
    }
  }

  clampNumber(n: number) {
    return Math.max(-1, Math.min(1, n));
  }

  clampX(x: number, multiply: number) {
    return this.clampNumber(x * multiply * 1.33);
  }

  clampY(y: number, multiply: number) {
    return this.clampNumber(y * multiply * 2);
  }

  getCenterY() {
    return state.player.getScreenPosition().y;
  }

  getMultiply() {
    return 2 / Math.min(innerWidth, innerHeight);
  }

  updateMouseXY() {
    const multiply = this.getMultiply();
    this.x = this.clampX(this.pageX - innerWidth / 2, multiply);
    this.y = this.clampY(this.pageY - this.getCenterY(), multiply);
  }

  preventEvent(event: PointerEvent | MouseEvent) {
    event.preventDefault();
  }

  onPointerDown(event: PointerEvent) {
    const clickTime = Date.now();
    if (clickTime - this.lastClickTime < doubleClickTime) {
      state.keys.space = true;
      setTimeout(() => {
        state.keys.space = false;
      }, 100);
    }

    this.lastClickTime = clickTime;
    state.mouseDown = true;

    this.preventEvent(event);
    this.onPointerMove(event);
  }

  onPointerUp(event: PointerEvent | TouchEvent) {
    event.preventDefault();
    state.mouseDown = false;
    state.keys.up = false;
    state.keys.down = false;
    state.keys.left = false;
    state.keys.right = false;
  }
}
