<script setup lang="ts">
import { iconOptions } from '../icons'
import type { IconName } from '../types'
import ResumeIcon from './ResumeIcon.vue'
defineProps<{ modelValue: IconName; open: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: IconName]; close: [] }>()
</script>
<template>
  <div v-if="open" class="icon-picker" role="dialog" aria-label="选择模块图标">
    <div class="icon-picker-head"><strong>选择图标</strong><button aria-label="关闭" @click="emit('close')">×</button></div>
    <div class="icon-grid">
      <button v-for="name in iconOptions" :key="name" :class="{ active: modelValue === name }" :title="name" @click="emit('update:modelValue', name); emit('close')"><ResumeIcon :name="name" /></button>
    </div>
  </div>
</template>
