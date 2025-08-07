<template>
  <button
    :class="[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark focus:ring-offset-2',
      value ? 'bg-ios-accent dark:bg-ios-accent-dark' : 'bg-gray-300 dark:bg-gray-600'
    ]"
    @click="toggle"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
        value ? 'translate-x-6' : 'translate-x-1'
      ]"
    />
  </button>
</template>

<script>
export default {
  name: 'ToggleSwitch',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value'],
  methods: {
    toggle() {
      this.$emit('update:value', !this.value)
    }
  }
}
</script>