
<template>
  <c-box mt="8" mx="auto" w="100%" :maxW="variant === 'regular' ? '800px' : '400px'">
    <slot />
  </c-box>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Wrapper',
  props: {
    variant: {
      type: String,
      default: 'regular'
    }
  }
})
</script>