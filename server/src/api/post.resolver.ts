import {
  ApolloError,
  ForbiddenError,
  UserInputError
} from 'apollo-server-express'
import { validate } from 'class-validator'
import { Post } from 'generated/type-graphql'
import {
  CreatePostArgs,
  Posts,
  PostsArgs,
  UpdatePostArgs
} from 'src/api/@types'
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root
} from 'type-graphql'

@Resolver(Post)
class PostResolver {
  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: number, @Ctx() { prisma }: Ctx) {
    return prisma.post.findOne({
      where: { id },
      include: { User: { include: { profile: true } }, Vote: true }
    })
  }

  @FieldResolver(() => Int)
  async voteValue(@Root() post: Post, @Ctx() { prisma, user }: Ctx) {
    const [vote] = await prisma.vote.findMany({
      where: { postId: post.id, userId: user?.id },
      take: 1
    })

    return vote?.value || 0
  }

  @Authorized()
  @Mutation(() => Boolean)
  async vote(
    @Arg('postId') postId: number,
    @Arg('value') val: number,
    @Ctx() { prisma, user }: Ctx
  ) {
    const { id } = user!
    const value = val === -1 ? -1 : 1

    const [vote] = await prisma.vote.findMany({
      where: { postId, userId: id },
      take: 1
    })

    const post = await prisma.post.findOne({
      where: { id: postId }
    })

    if (!post) {
      throw new ApolloError('Invalid post ID')
    }

    if (!vote) {
      // never votted before
      const createVote = prisma.vote.create({
        data: {
          value,
          User: { connect: { id } },
          Post: { connect: { id: postId } }
        }
      })

      const updatePost = prisma.post.update({
        where: { id: postId },
        data: { points: post.points + value }
      })

      await prisma.$transaction([createVote, updatePost])
      return true
    } else if (vote.value !== value) {
      // changing previous vote
      const updateVote = prisma.vote.update({
        where: { id: vote.id },
        data: { value }
      })
      const updatePost = prisma.post.update({
        where: { id: postId },
        data: { points: post.points + 2 * value }
      })

      await prisma.$transaction([updateVote, updatePost])
      return true
    } else {
      // same as previous, do nothing

      return false
    }
  }

  @Query(() => Posts, { nullable: true })
  async posts(@Args() { id, take }: PostsArgs, @Ctx() { prisma }: Ctx) {
    let cursorOpt = {}
    let hasMore = false
    take = Math.max(Math.min(10, take), 1)

    if (id && id != -1) {
      cursorOpt = {
        skip: 1, // Skip the cursor
        cursor: {
          id
        }
      }
    }

    let posts = await prisma.post.findMany({
      take: take + 1,
      ...cursorOpt,
      orderBy: {
        id: 'desc'
      },
      where: { published: true },
      include: { User: { include: { profile: true } } }
    })

    if (posts.length === take + 1) {
      hasMore = true
      posts = posts.slice(0, -1)
    }

    return { hasMore, posts }
  }

  @Authorized()
  @Mutation(() => Post)
  async createPost(@Args() args: CreatePostArgs, @Ctx() { prisma, user }: Ctx) {
    const { content, title, published } = args
    const { id } = user!

    // validate input
    const errors = await validate(args, {
      validationError: { target: false, value: false }
    })
    if (errors.length > 0) {
      throw new UserInputError('Invalid inputs', { errors })
    }

    const post = await prisma.post.create({
      data: { content, title, published, User: { connect: { id } } },
      include: { User: { include: { profile: true } } }
    })

    return post
  }

  @Authorized()
  @Mutation(() => Post)
  async updatePost(@Args() args: UpdatePostArgs, @Ctx() { prisma, user }: Ctx) {
    const { id } = args
    let { content, published, title } = args

    // validate input
    const errors = await validate(args, {
      validationError: { target: false, value: false }
    })
    if (errors.length > 0) {
      throw new UserInputError('Invalid inputs', { errors })
    }

    const post = await prisma.post.findOne({
      where: { id },
      include: { User: { include: { profile: true } } }
    })
    if (!post) {
      throw new ForbiddenError('Post not Found')
    }

    // check publisher of post
    if (post.User.email !== user?.email) {
      throw new ForbiddenError('This Post does not belongs to you')
    }

    // re-map inputs
    content = content || post.content || ''
    title = title || post.title || ''
    published = typeof published === 'boolean' ? published : post.published

    const upatedPost = await prisma.post.update({
      where: { id },
      data: { title, content, published },
      include: {
        User: { include: { profile: true } }
      }
    })

    return upatedPost
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number, @Ctx() { prisma, user }: Ctx) {
    const post = await prisma.post.findOne({
      where: { id },
      include: { User: true }
    })
    if (!post) {
      throw new ForbiddenError('Post not Found')
    }

    // check publisher of post
    if (post.User.email !== user?.email) {
      throw new ForbiddenError('This Post does not belongs to you')
    }

    // delete all ovte asociated with the post
    await prisma.vote.deleteMany({ where: { postId: id } })

    await prisma.post.delete({ where: { id } })
    const existsPost = await prisma.post.findOne({ where: { id } })

    return !existsPost
  }
}

export default PostResolver
