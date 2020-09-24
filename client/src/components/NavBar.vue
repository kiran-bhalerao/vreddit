<template>
  <c-flex
    id="nav"
    pos="fixed"
    w="100%"
    zIndex="2"
    bg="white"
    boxShadow="md"
    justify="space-between"
    align="center"
  >
    <router-link to="/">
      <c-flex align="flex-end">
        <c-image alt="Vue logo" :src="require('../assets/logo.png')" h="50px" w="50px" />
        <c-text fontSize="24px">Vreddit</c-text>
      </c-flex>
    </router-link>
    <div v-if="loading">Loading...</div>
    <c-box v-else-if="user">
      <c-link as="router-link" to="/create-post" px="4">Create Post</c-link>
      <c-link @click="logout()">Logout</c-link>
      <c-text as="sup" px="1">{{user.profile && user.profile.name}}</c-text>
    </c-box>
    <c-box v-else-if="error">
      <c-link as="router-link" to="/login" px="4">Login</c-link>
      <c-link as="router-link" to="/signup">Signup</c-link>
    </c-box>
  </c-flex>
</template>

<script lang="ts">
import { useMeQuery } from '@/generated/graphql'
import router from '@/router'
import { useApolloClient, useResult } from '@vue/apollo-composable'

export default {
  name: 'NavBar',
  setup() {
    const { result, loading, error } = useMeQuery({
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    })
    const { client } = useApolloClient()
    const user = useResult(result)

    async function logout() {
      localStorage.clear()
      await client.resetStore()

      router.push({ name: 'Login' })
    }

    return {
      user,
      loading,
      error,
      logout
    }
  }
}
</script>

<style lang="scss">
#nav {
  padding: 20px 30px;

  a {
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
}
</style>
