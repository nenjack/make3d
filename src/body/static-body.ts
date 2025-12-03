import { Level } from '../level'
import { BaseBody, BodyUserData } from '../model'
import { AbstractBody } from './abstract-body'

export class StaticBody implements BaseBody {
  x!: number
  y!: number
  z!: number
  group!: number
  angle = 0
  userData: BodyUserData

  constructor(x: number, y: number, level: Level) {
    this.userData = { level }
    this.setPosition(x, y)
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y

    AbstractBody.onSetPosition(this)

    return this
  }
}
