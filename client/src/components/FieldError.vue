<template>
  <c-form-helper-text :id="id" v-if="show" :color="color">
    <slot />
  </c-form-helper-text>
</template>

<script>
export default {
  name: 'field-error',
  props: {
    id: String,
    show: {
      default: true
    },
    color: {
      default: 'red.400'
    }
  }
}
</script>