<template>
  <c-theme-provider>
    <c-reset />
    <NavBar />
    <c-box pt="90px">
      <router-view />
    </c-box>
  </c-theme-provider>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>
