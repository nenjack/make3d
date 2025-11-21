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

export class Events {
  static keyDown = setKey(true)
  static keyUp = setKey(false)
  static click = mouse.onPointerDown.bind(mouse)
  static release = mouse.onPointerUp.bind(mouse)
  static move = mouse.onPointerMove.bind(mouse)
  static cancel = mouse.preventEvent.bind(mouse)
  static events = {
    pointerdown: Events.click,
    pointermove: Events.move,
    pointerup: Events.release,
    touchstart: Events.cancel,
    touchend: Events.cancel,
    touchmove: Events.cancel,
    dragstart: Events.cancel,
    contextmenu: Events.cancel
  }

  static eventListenersAdded = false

  static addEventListeners() {
    if (Events.eventListenersAdded) return
    Events.eventListenersAdded = true

    const options = { passive: false }
    Object.entries(Events.events).forEach(([event, action]) => {
      window.addEventListener(event, action, options)
    })

    window.addEventListener('keydown', Events.keyDown, { passive: true })
    window.addEventListener('keyup', Events.keyUp, { passive: true })
  }

  static removeEventListeners() {
    if (!Events.eventListenersAdded) return
    Events.eventListenersAdded = false

    Object.entries(Events.events).forEach(([event, action]) => {
      window.removeEventListener(event, action)
    })

    window.removeEventListener('keydown', Events.keyDown)
    window.removeEventListener('keyup', Events.keyUp)
  }
}
