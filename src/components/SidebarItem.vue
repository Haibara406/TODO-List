<template>
  <button
    @click="$emit('click')"
    :class="[
      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200',
      isActive 
        ? 'bg-ios-accent text-white' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-ios-text dark:text-ios-text-dark'
    ]"
  >
    <span class="text-lg">{{ icon }}</span>
    <span class="flex-1 font-medium">{{ label }}</span>
    <span 
      v-if="badge && !isActive" 
      class="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
    >
      {{ badge }}
    </span>
  </button>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    badge: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['click']
}
</script>