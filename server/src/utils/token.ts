/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken'

export class Token {
  static sign(payload: Record<string, any>) {
    const JWT_KEY = process.env.JWT_KEY!

    return jwt.sign({ ...payload }, JWT_KEY)
  }

  static verify(token: string): Promise<any> {
    const JWT_KEY = process.env.JWT_KEY!

    return new Promise((res, rej) => {
      jwt.verify(token, JWT_KEY, (err, decoded?: any) => {
        if (err) {
          return rej(err)
        }
        res(decoded)
      })
    })
  }
}
