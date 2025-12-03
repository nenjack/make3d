import { BaseBody } from '../model'
import { floors } from '../state'

export class AbstractBody {
  protected static readonly Z_OFFSET = 0.2

  static getGroup({ z = 0 }) {
    return floors[Math.round((z - AbstractBody.Z_OFFSET) * 2)]
  }

  static getFloor(body: BaseBody, x = body.x, y = body.y) {
    return body.userData.level.getFloor(x, y)
  }

  static onSetPosition(body: BaseBody) {
    body.z = Math.max(body.z, AbstractBody.getFloor(body) / 2)
    body.group = AbstractBody.getGroup(body)
  }
}
