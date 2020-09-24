import '@polyfill'
import { PrismaClient } from '@prisma/client'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import PostResolver from 'src/api/post.resolver'
import UserResolver from 'src/api/user.resolver'
import { Auth } from 'src/utils/auth'
import { buildTypeDefsAndResolvers } from 'type-graphql'

const prisma = new PrismaClient()

async function main() {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [UserResolver, PostResolver],
    validate: false,
    authChecker: Auth.authChecker
  })

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await Auth.decodePayload(req)
      return { user, prisma }
    }
  })

  const app = express()
  const path = '/graphql'

  server.applyMiddleware({ app, path })

  await new Promise(r => app.listen({ port: 4000 }, r))
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
