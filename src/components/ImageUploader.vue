<script setup lang="ts">
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
const props = defineProps<{ modelValue: string; size: number; label: string; kind: 'logo' | 'photo' }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; 'update:size': [value: number] }>()
const input = ref<HTMLInputElement>()
function choose() { input.value?.click() }
function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return
  const reader = new FileReader()
  reader.onload = () => emit('update:modelValue', String(reader.result))
  reader.readAsDataURL(file)
  ;(event.target as HTMLInputElement).value = ''
}
function updateSize(event: Event) {
  emit('update:size', Number((event.target as HTMLInputElement).value))
}
</script>
<template>
  <div class="image-upload">
    <button class="upload-target" :class="kind" type="button" @click="choose">
      <img v-if="modelValue" :src="modelValue" :alt="label" />
      <span v-else><ImagePlus :size="18" />{{ label }}</span>
    </button>
    <button v-if="modelValue" class="image-delete" type="button" :aria-label="`删除${label}`" @click="emit('update:modelValue', '')"><Trash2 :size="13" /></button>
    <label class="image-size-control">
      <span>{{ kind === 'logo' ? '校徽大小' : '证件照大小' }}</span>
      <input type="range" min="60" max="160" step="5" :value="size" :aria-label="`${kind === 'logo' ? '校徽' : '证件照'}大小`" @input="updateSize" />
      <output>{{ size }}%</output>
    </label>
    <input ref="input" hidden type="file" accept="image/png,image/jpeg,image/webp" @change="upload" />
  </div>
</template>
