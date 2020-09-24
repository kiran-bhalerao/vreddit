import { PrismaClient, PrismaClientOptions, User } from '@prisma/client'

declare global {
  interface Ctx {
    prisma: PrismaClient<PrismaClientOptions, never>
    user?: Omit<User, 'password'>
  }
}
