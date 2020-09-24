import introspectionQueryResultData from '@/generated/introspection-result.json'
import { logErrorMessages } from '@vue/apollo-util'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { createHttpLink } from 'apollo-link-http'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
})

const errorLink = onError(error => {
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error)
  }
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('auth-token')
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const cache = new InMemoryCache({
  dataIdFromObject: object => {
    return object.id
  },
  fragmentMatcher: new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  })
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(errorLink.concat(httpLink)),
  cache
})
