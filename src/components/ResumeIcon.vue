<script setup lang="ts">
import { computed } from 'vue'
import { iconMap } from '../icons'
import type { IconName } from '../types'
const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 18 })
const icon = computed(() => iconMap[props.name])
</script>
<template><component :is="icon" :size="size" :stroke-width="2" /></template>
