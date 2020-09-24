import { Request } from 'express'
import { Token } from 'src/utils/token'
import { AuthChecker } from 'type-graphql'

export class Auth {
  static authChecker: AuthChecker<Ctx> = ({ context }) => {
    return !!context.user
  }

  static async decodePayload(
    req: Request
  ): Promise<NonNullable<Ctx['user']> | null> {
    let token = req.headers.authorization
    if (!token) {
      return null
    }

    token = token.split(' ')[1]
    if (!token) {
      return null
    }

    try {
      const payload: Ctx['user'] = await Token.verify(token)
      return payload || null
    } catch (err) {
      return null
    }
  }
}
