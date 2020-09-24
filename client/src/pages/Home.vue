<template>
  <Wrapper>
    <c-text fontSize="xl">Welcome Home 🙋‍♀️</c-text>
    <c-image
      v-if="results === undefined || results.length < 1"
      m="auto"
      w="10rem"
      mt="10rem"
      :src="require('../assets/loading.gif')"
      alt="Loading...."
    />
    <c-flex direction="column" mt="4" v-else>
      <c-flex
        border-width="1px"
        rounded="lg"
        p="4"
        my="2"
        overflow="hidden"
        boxShadow="sm"
        v-for="post in results.posts"
        :key="post.id"
      >
        <c-flex direction="column" mr="4">
          <c-icon-button
            :variantColor="post.voteValue === 1 ? 'green' : 'gray'"
            :_focus="{ boxShadow: 'none' }"
            aria-label="upvote"
            icon="triangle-up"
            mb="1"
            @click="onVote(post.id, 1)"
          />
          <c-text align="center" color="gray.500" fontWeight="bold" my="2">{{post.points}}</c-text>
          <c-icon-button
            aria-label="downvote"
            :variantColor="post.voteValue === -1 ? 'red' : 'gray'"
            :_focus="{ boxShadow: 'none' }"
            icon="triangle-down"
            mt="1"
            @click="onVote(post.id, -1)"
          />
        </c-flex>
        <c-box flexGrow="1" mx="2">
          <c-text
            fontSize="22px"
            fontWeight="bold"
            textTransform="capitalize"
            color="gray.600"
          >{{`#${post.id} ${post.title}`}}</c-text>
          <c-text
            color="gray.500"
            fontStyle="italic"
            fontSize="14px"
            mb="2"
            v-if="post.user"
          >posted by, {{post.user.profile.name}}</c-text>
          <c-text color="gray.500">{{post.content}}</c-text>
        </c-box>
        <c-box ml="4" v-if="post.user && user.id === post.user.id">
          <c-tooltip has-arrow label="wanna delete this post?" placement="right">
            <c-icon-button
              variant-color="white"
              color="red.500"
              aria-label="Search database"
              icon="small-close"
              @click="onDelete(post.id)"
            />
          </c-tooltip>
        </c-box>
      </c-flex>
      <c-link
        v-if="results.hasMore"
        class="-load-more"
        my="4"
        textAlign="center"
        @click="onLoadMore()"
      >Load more</c-link>
    </c-flex>
  </Wrapper>
</template>

<script lang="ts">
import Wrapper from '@/components/Wrapper.vue'
import {
  Post,
  PostsDocument,
  PostsQuery,
  useMeQuery,
  usePostsQuery,
  useVoteMutation,
  VoteMutation,
  useDeletePostMutation,
  DeletePostMutation
} from '@/generated/graphql'
import { useResult } from '@vue/apollo-composable'
import { ref, watch } from '@vue/composition-api'
import { FetchResult } from 'apollo-boost'

function updateVoteValues(
  post: Partial<Post>,
  cachePost: Partial<Post>,
  value: number,
  points: number
) {
  if (post.id === cachePost.id) {
    return {
      voteValue: value,
      points
    }
  }

  return {}
}

export default {
  name: 'Home',
  components: {
    Wrapper
  },
  setup() {
    const cursor = ref<number | null>(null)
    const { loading, result, fetchMore } = usePostsQuery(
      { id: cursor.value, take: 4 },
      { errorPolicy: 'all', returnPartialData: true }
    )
    const { result: meResult } = useMeQuery()
    const { mutate } = useVoteMutation({ errorPolicy: 'all' })
    const { mutate: deletePost } = useDeletePostMutation({ errorPolicy: 'all' })

    const results = useResult(result)
    const user = useResult(meResult)

    async function onLoadMore() {
      if (result.value) {
        cursor.value =
          result.value!.posts!.posts[result.value!.posts!.posts.length - 1]
            ?.id || -1

        await fetchMore({
          variables: { id: cursor.value },
          updateQuery: (previousValue, { fetchMoreResult }) => {
            if (!fetchMoreResult?.posts) {
              return previousValue
            }

            return {
              __typename: 'Query',
              posts: {
                __typename: 'Posts',
                hasMore: fetchMoreResult.posts.hasMore,
                posts: [
                  ...(previousValue.posts?.posts || []),
                  ...fetchMoreResult.posts.posts
                ]
              }
            }
          }
        })
      }
    }

    async function onVote(postId: number, value: number) {
      await mutate(
        { value, postId },
        {
          update: (cache, { data }: FetchResult<VoteMutation>) => {
            if (!data?.vote) {
              return
            }

            const cachedPosts = cache.readQuery<PostsQuery>({
              query: PostsDocument,
              variables: { id: null, take: 4 }
            })

            if (!cachedPosts) {
              return
            }

            const [post] =
              cachedPosts.posts?.posts.filter(({ id }) => id === postId) || []

            if (post) {
              if (value === post.voteValue) {
                return
              }

              const newPoints = post.points! - (post.voteValue! - value)
              // write fragment didint work for me, it didnt update posts query
              cache.writeQuery<PostsQuery>({
                query: PostsDocument,
                data: {
                  __typename: 'Query',
                  posts: {
                    __typename: 'Posts',
                    hasMore: !!cachedPosts.posts?.hasMore,
                    posts: (cachedPosts?.posts?.posts || []).map(cachePost => {
                      return {
                        ...cachePost,
                        ...updateVoteValues(post, cachePost, value, newPoints)
                      }
                    })
                  }
                },
                variables: { id: null, take: 4 }
              })
            }
          }
        }
      )
    }

    async function onDelete(postId: number) {
      await deletePost(
        { id: postId },
        {
          update: (cache, { data }: FetchResult<DeletePostMutation>) => {
            if (!data?.deletePost) {
              return
            }

            const cachedPosts = cache.readQuery<PostsQuery>({
              query: PostsDocument,
              variables: { id: null, take: 4 }
            })

            if (!cachedPosts) {
              return
            }

            cache.writeQuery<PostsQuery>({
              query: PostsDocument,
              data: {
                __typename: 'Query',
                posts: {
                  __typename: 'Posts',
                  hasMore: !!cachedPosts.posts?.hasMore,
                  posts: (cachedPosts.posts?.posts || []).filter(
                    ({ id }) => id !== postId
                  )
                }
              },
              variables: { id: null, take: 4 }
            })
          }
        }
      )
    }

    return { loading, results, onLoadMore, user, onVote, onDelete }
  }
}
</script>

<style lang="scss">
.-load-more {
  font-weight: bold;
  color: #2c3e50;

  &.router-link-exact-active,
  &:hover {
    color: #42b983;
  }

  &:focus {
    box-shadow: none;
  }
}
</style>