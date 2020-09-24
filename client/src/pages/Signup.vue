<template>
  <Wrapper>
    <c-flex align="center" direction="column">
      <Field
        field="name"
        v-model="name"
        label="Your Name"
        :getErrorText="getErrorText"
        w="60%"
        mt="4"
      />
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
      <Field
        :area="true"
        field="bio"
        placeholder="Enter your bio here.."
        v-model="bio"
        label="Bio"
        :getErrorText="getErrorText"
        w="60%"
        mt="4"
      />
      <c-button variant-color="green" mt="4" @click="onSignup()" :is-loading="loading">Signup</c-button>
    </c-flex>
  </Wrapper>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'

import { useSignupMutation } from '@/generated/graphql'
import { useErrors } from '@/use/useErrors'
import { CToastStatus } from '@/types'
import Field from '@/components/Field.vue'
import { ToastMixin } from '@/mixins/toast-mixin'
import Wrapper from '@/components/Wrapper.vue'

// eslint-disable-next-line @typescript-eslint/no-use-before-define
type SignupThis = InstanceType<typeof SignupVue> & typeof ToastMixin.methods

const SignupVue = Vue.extend({
  name: 'Signup',
  components: {
    Field,
    Wrapper
  },
  mixins: [ToastMixin],
  setup() {
    const { loading, mutate, onDone } = useSignupMutation({
      errorPolicy: 'all'
    })
    const event = reactive({
      name: '',
      email: '',
      password: '',
      bio: ''
    })

    const { error, success, getErrorText } = useErrors(onDone)

    async function onSignup(this: SignupThis) {
      await mutate({ ...event })

      if (success.value || error.value)
        this.showToast({
          status: success.value ? CToastStatus.success : CToastStatus.error,
          title: success.value ? 'Signup Success' : 'An error occurred',
          description: success.value
            ? "We've created your account for you."
            : error.value
        })
    }

    return { loading, onSignup, getErrorText, ...toRefs(event) }
  }
})

export default SignupVue
</script>