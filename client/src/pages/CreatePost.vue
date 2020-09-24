<template>
  <Wrapper>
    <c-flex align="center" direction="column">
      <Field
        field="title"
        placeholder="Enter post title"
        v-model="title"
        :getErrorText="getErrorText"
        label="Title"
        w="60%"
        mt="4"
      />
      <Field
        :area="true"
        field="content"
        placeholder="Write your post content here.."
        v-model="content"
        :getErrorText="getErrorText"
        label="Post"
        w="60%"
        mt="4"
      />
      <c-checkbox v-model="published" mt="4">Published</c-checkbox>
      <c-button variant-color="green" mt="4" @click="onSubmit()" :is-loading="loading">Submit</c-button>
    </c-flex>
  </Wrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import Wrapper from '@/components/Wrapper.vue'
import { reactive, toRefs } from '@vue/composition-api'
import Field from '@/components/Field.vue'
import {
  CreatePostMutation,
  PostsDocument,
  PostsQuery,
  useCreatePostMutation
} from '@/generated/graphql'
import { useErrors } from '@/use/useErrors'
import { CToastStatus } from '@/types'
import { ToastMixin } from '@/mixins/toast-mixin'
import { FetchResult } from 'apollo-boost'

// eslint-disable-next-line @typescript-eslint/no-use-before-define
type ICreatePostComponent = InstanceType<typeof CreatePostComponent> &
  typeof ToastMixin.methods

const CreatePostComponent = Vue.extend({
  components: {
    Wrapper,
    Field
  },
  mixins: [ToastMixin],
  setup() {
    const event = reactive({
      title: '',
      content: '',
      published: false
    })

    const { loading, mutate, onDone } = useCreatePostMutation({
      errorPolicy: 'all'
    })
    const { error, success, getErrorText } = useErrors(onDone)

    async function onSubmit(this: ICreatePostComponent) {
      await mutate(
        { ...event },
        {
          update: (cache, { data }: FetchResult<CreatePostMutation>) => {
            let cachedPosts

            try {
              cachedPosts = cache.readQuery<PostsQuery>({
                query: PostsDocument,
                variables: { id: null, take: 4 }
              })
            } catch (error) {}

            if (!cachedPosts) {
              return
            }

            if (!data?.createPost.published) {
              return
            }

            cache.writeQuery<PostsQuery>({
              query: PostsDocument,
              data: {
                __typename: 'Query',
                posts: {
                  __typename: 'Posts',
                  hasMore: !!cachedPosts.posts?.hasMore,
                  posts: [
                    data.createPost,
                    ...(cachedPosts.posts?.posts || [])
                  ].filter(({ id }) => !!id)
                }
              },
              variables: { id: null, take: 4 }
            })
          }
        }
      )

      if (success.value || error.value)
        this.showToast({
          status: success.value ? CToastStatus.success : CToastStatus.error,
          title: success.value ? 'Post Submitted' : 'An error occurred',
          description: success.value ? "We've created a new Post." : error.value
        })
    }

    return { ...toRefs(event), getErrorText, loading, onSubmit }
  }
})

export default CreatePostComponent
</script>