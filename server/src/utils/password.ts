import { randomBytes, scryptSync } from 'crypto'

export class Password {
  static toHash(password: string) {
    const salt = randomBytes(8).toString('hex')
    const buffer = scryptSync(password, salt, 64)

    return `${buffer.toString('hex')}.${salt}`
  }

  static compare(storedPassword: string, suppliedPassword: string) {
    const [hash, salt] = storedPassword.split('.')

    const buffer = scryptSync(suppliedPassword, salt, 64)
    return buffer.toString('hex') === hash
  }
}
