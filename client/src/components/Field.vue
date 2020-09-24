<template>
  <c-form-control :w="w" :mt="mt">
    <c-form-label :for="field">{{label}}</c-form-label>
    <c-textarea
      v-if="area"
      :rows="rows"
      :id="field"
      :aria-describedby="`${field}-helper-text`"
      :value="value"
      :placeholder="placeholder"
      @change="$emit('input', $event)"
    />
    <c-input
      v-else
      :type="type"
      :id="field"
      :aria-describedby="`${field}-helper-text`"
      :value="value"
      :placeholder="placeholder"
      @input="$emit('input', $event)"
    />
    <FieldError
      :id="`${field}-helper-text`"
      :show="showError"
      :color="isError ? 'red.400': 'gray.500'"
    >
      <slot v-if="!isError" />
      <c-text v-else>{{error}}</c-text>
    </FieldError>
  </c-form-control>
</template>

<script>
import FieldError from './FieldError.vue'

export default {
  name: 'field',
  components: {
    FieldError
  },
  computed: {
    error: function () {
      return this.getErrorText?.(this.field)
    },
    isError: function () {
      return !!this.getErrorText?.(this.field)
    },
    showError: function () {
      return !!this.$slots || this.isError
    }
  },
  props: {
    field: String,
    value: String,
    label: String,
    placeholder: String,
    getErrorText: Function,
    type: {
      default: 'type'
    },
    area: {
      default: false
    },
    rows: {
      default: 2
    },
    w: String,
    mt: String
  }
}
</script>