<template>
  <Wrapper>
    <c-flex align="center" direction="column">
      <Field
        field="email"
        v-model="email"
        type="email"
        label="Email address"
        :getErrorText="getErrorText"
        w="60%"
        mt="4"
      >{{"We'll never share your email."}}</Field>
      <Field
        field="password"
        v-model="password"
        label="Password"
        type="password"
        :getErrorText="getErrorText"
        w="60%"
        mt="4"
      />
      <c-button variant-color="green" mt="4" @click="onLogin()" :is-loading="loading">Login</c-button>
    </c-flex>
  </Wrapper>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'

import {
  LoginMutation,
  MeDocument,
  MeQuery,
  useLoginMutation
} from '@/generated/graphql'
import { useErrors } from '@/use/useErrors'
import { CToastStatus } from '@/types'
import Field from '@/components/Field.vue'
import { ToastMixin } from '@/mixins/toast-mixin'
import router from '@/router'
import Wrapper from '@/components/Wrapper.vue'
import { FetchResult } from 'apollo-boost'

// eslint-disable-next-line @typescript-eslint/no-use-before-define
type ILoginComponent = InstanceType<typeof LoginVue> & typeof ToastMixin.methods

const LoginVue = Vue.extend({
  name: 'Login',
  components: {
    Field,
    Wrapper
  },
  mixins: [ToastMixin],
  setup() {
    const { loading, mutate, onDone } = useLoginMutation({
      errorPolicy: 'all'
    })
    const event = reactive({
      email: '',
      password: ''
    })

    const { error, success, getErrorText } = useErrors(onDone)

    async function onLogin(this: ILoginComponent) {
      const { data } = await mutate(
        { ...event },
        {
          update: (cache, { data }: FetchResult<LoginMutation>) => {
            if (!data?.login.user) {
              return
            }

            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: 'Query',
                me: data.login.user
              }
            })
          }
        }
      )

      if (success.value) {
        localStorage.setItem('auth-token', data!.login.token)
        return router.push({ name: 'Home' })
      }

      if (error.value)
        this.showToast({
          status: CToastStatus.error,
          title: 'An error occurred',
          description: error.value
        })
    }

    return { loading, onLogin, getErrorText, ...toRefs(event) }
  }
})

export default LoginVue
</script>