import { doubleClickTime, keys, mouse, state } from './state';

export const onPointerMove = (event: MouseEvent | TouchEvent) => {
  const pointer = event instanceof TouchEvent ? event.touches[0] : event;

  if (pointer && state.player) {
    const CENTER_Y = 0.75;
    const MARGIN_Y = 0.1;

    mouse.x = (pointer.pageX / innerWidth) * 2 - 1;
    mouse.y = pointer.pageY / innerHeight - CENTER_Y;

    if (state.mouseDown) {
      keys.up = mouse.y < -MARGIN_Y;
      keys.down = mouse.y > MARGIN_Y;
    }
  }
};

export const setKey = (value: boolean) => {
  return (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        keys.left = value;
        break;
      case 'ArrowRight':
        keys.right = value;
        break;
      case 'ArrowUp':
        keys.up = value;
        break;
      case 'ArrowDown':
        keys.down = value;
        break;
      case ' ':
        keys.space = value;
        break;
      default:
        // console.log(event.key);
        break;
    }
  };
};

let lastClickTime = 0;

export const preventEvent = (event: PointerEvent | MouseEvent) =>
  event.preventDefault();

export const onPointerDown = (event: PointerEvent) => {
  const clickTime = Date.now();
  if (clickTime - lastClickTime < doubleClickTime) {
    keys.space = true;
    setTimeout(() => {
      // safe
      keys.space = false;
    }, 200);
  }

  lastClickTime = clickTime;

  state.mouseDown = true;

  preventEvent(event);
  onPointerMove(event);
};

export const onPointerUp = () => {
  state.mouseDown = false;
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
};

export const addEventListeners = () => {
  window.addEventListener('keydown', setKey(true), { passive: true });
  window.addEventListener('keyup', setKey(false), { passive: true });
  window.addEventListener('contextmenu', preventEvent, { passive: false });
  window.addEventListener('pointerdown', onPointerDown, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('touchend', onPointerUp, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
};
