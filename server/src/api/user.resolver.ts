import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { validate } from 'class-validator'
import { Profile, User } from 'generated/type-graphql'
import omit from 'lodash/omit'
import {
  AuthResp,
  LoginArgs,
  SignupArgs,
  UpdateProfileArgs
} from 'src/api/@types'
import { Password } from 'src/utils/password'
import { Token } from 'src/utils/token'
import {
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root
} from 'type-graphql'

@Resolver(User)
class UserResolver {
  @FieldResolver()
  email(@Root() user: User, @Ctx() ctx: Ctx) {
    if (user.id === ctx.user?.id) {
      return user.email
    }

    // hide email for another user
    return ''
  }

  @Authorized()
  @Query(() => User)
  async me(@Ctx() { prisma, user }: Ctx): Promise<User | null> {
    const { email } = user!
    return prisma.user.findOne({
      where: { email },
      include: { profile: true, posts: { include: { User: true } } }
    })
  }

  @Mutation(() => AuthResp)
  async signup(
    @Args() args: SignupArgs,
    @Ctx() { prisma }: Ctx
  ): Promise<AuthResp> {
    const { name, bio, email, password } = args

    // validate input
    const errors = await validate(args, {
      validationError: { target: false, value: false }
    })
    if (errors.length > 0) {
      throw new UserInputError('Invalid inputs', { errors })
    }

    // check user exist with same email
    const existingUser = await prisma.user.findOne({ where: { email } })
    if (existingUser) {
      throw new Error('User already exists with same email')
    }

    const hashPassword = Password.toHash(password)

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        profile: { create: { name, bio } }
      },
      include: {
        profile: true
      }
    })

    // create token
    const token = await Token.sign(omit(user, ['password']))

    return {
      token,
      user
    }
  }

  @Mutation(() => AuthResp)
  async login(
    @Args() { email, password }: LoginArgs,
    @Ctx() { prisma }: Ctx
  ): Promise<AuthResp> {
    // find user by email
    const user = await prisma.user.findOne({
      where: { email },
      include: { profile: true }
    })
    if (!user) {
      throw new ForbiddenError('User not found')
    }

    // compare password
    if (!Password.compare(user.password, password)) {
      throw new ForbiddenError('Invalid password')
    }

    // create token
    const token = await Token.sign(omit(user, ['password']))

    return {
      token,
      user
    }
  }

  @Authorized()
  @Mutation(() => Profile)
  async updateProfile(
    @Args() args: UpdateProfileArgs,
    @Ctx() { prisma, user }: Ctx
  ): Promise<Profile> {
    const { bio, name } = args
    const { id: userId } = user!

    // validate input
    const errors = await validate(args, {
      validationError: { target: false, value: false }
    })
    if (errors.length > 0) {
      throw new UserInputError('Invalid inputs', { errors })
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { name, bio },
      include: {
        User: true
      }
    })

    return profile
  }
}

export default UserResolver
