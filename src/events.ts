import { keys, mouse } from './state'

export const setKey = (value: boolean) => {
  return (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        keys.left = value
        break
      case 'ArrowRight':
        keys.right = value
        break
      case 'ArrowUp':
        keys.up = value
        break
      case 'ArrowDown':
        keys.down = value
        break
      case ' ':
        keys.space = value
        break
      default:
        // console.log(event.key);
        break
    }
  }
}

let eventListenersAdded = false

export const addEventListeners = () => {
  if (eventListenersAdded) return
  eventListenersAdded = true

  const block = { passive: false }

  window.addEventListener('keydown', setKey(true), { passive: true })
  window.addEventListener('keyup', setKey(false), { passive: true })
  window.addEventListener('pointerdown', mouse.onPointerDown.bind(mouse), block)
  window.addEventListener('pointermove', mouse.onPointerMove.bind(mouse), block)
  window.addEventListener('touchstart', mouse.preventEvent.bind(mouse), block)
  window.addEventListener('touchend', mouse.preventEvent.bind(mouse), block)
  window.addEventListener('touchmove', mouse.onPointerMove.bind(mouse), block)
  window.addEventListener('pointerup', mouse.onPointerUp.bind(mouse), block)
  window.addEventListener('touchend', mouse.onPointerUp.bind(mouse), block)
  window.addEventListener('dblclick', mouse.preventEvent.bind(mouse), block)
  window.addEventListener('dragstart', mouse.preventEvent.bind(mouse), block)
  window.addEventListener('contextmenu', mouse.preventEvent.bind(mouse), block)
}
