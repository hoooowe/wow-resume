<script setup lang="ts">
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'
defineProps<{ modelValue?: string; size?: number; label: string; kind: 'logo' | 'photo' }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; 'update:size': [value: number] }>()
const input = ref<HTMLInputElement>()
let pendingReader: FileReader | undefined

function choose() { input.value?.click() }

function upload(event: Event) {
  const fileInput = event.currentTarget as HTMLInputElement
  const file = fileInput.files?.[0]
  fileInput.value = ''
  if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return

  pendingReader?.abort()
  const reader = new FileReader()
  pendingReader = reader
  reader.onload = () => {
    if (typeof reader.result === 'string') emit('update:modelValue', reader.result)
  }
  reader.readAsDataURL(file)
}

function remove() {
  pendingReader?.abort()
  emit('update:modelValue', '')
}

function updateSize(event: Event) {
  emit('update:size', Number((event.target as HTMLInputElement).value))
}

onBeforeUnmount(() => pendingReader?.abort())
</script>
<template>
  <div class="image-upload">
    <button
      class="upload-target"
      :class="kind"
      type="button"
      :aria-label="`${modelValue ? '更换' : '上传'}${label}`"
      :title="modelValue ? `更换${label}` : undefined"
      @click="choose"
    >
      <img v-if="modelValue" :src="modelValue" :alt="label" />
      <span v-else><ImagePlus :size="18" />上传{{ label }}</span>
    </button>
    <button v-if="modelValue" class="image-delete" type="button" :aria-label="`删除${label}`" @click="remove"><Trash2 :size="13" /></button>
    <label v-if="size !== undefined" class="image-size-control">
      <span>{{ label }}大小</span>
      <input type="range" min="60" max="160" step="5" :value="size" :aria-label="`${label}大小`" @input="updateSize" />
      <output>{{ size }}%</output>
    </label>
    <input ref="input" hidden type="file" accept="image/png,image/jpeg,image/webp" @change="upload" />
  </div>
</template>
