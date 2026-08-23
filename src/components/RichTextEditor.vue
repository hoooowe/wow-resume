<script setup lang="ts">
import { Bold, List, ListOrdered } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const editor = ref<HTMLElement>()
const active = ref({ bold: false, ordered: false, unordered: false })

function sync() {
  if (!editor.value) return
  emit('update:modelValue', editor.value.innerHTML)
  updateActive()
}

function command(name: 'bold' | 'insertOrderedList' | 'insertUnorderedList') {
  editor.value?.focus()
  document.execCommand(name, false)
  sync()
}

function updateActive() {
  if (!editor.value || !editor.value.contains(document.activeElement)) return
  active.value = {
    bold: document.queryCommandState('bold'),
    ordered: document.queryCommandState('insertOrderedList'),
    unordered: document.queryCommandState('insertUnorderedList'),
  }
}

function pastePlainText(event: ClipboardEvent) {
  event.preventDefault()
  document.execCommand('insertText', false, event.clipboardData?.getData('text/plain') ?? '')
  sync()
}

watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.innerHTML !== value) editor.value.innerHTML = value
})
onMounted(() => {
  if (editor.value) editor.value.innerHTML = props.modelValue
  document.addEventListener('selectionchange', updateActive)
})
onBeforeUnmount(() => document.removeEventListener('selectionchange', updateActive))
</script>

<template>
  <div class="rich-editor">
    <div class="rich-editor-toolbar" aria-label="富文本工具栏">
      <button type="button" :class="{ active: active.bold }" title="加粗" @mousedown.prevent @click="command('bold')"><Bold :size="15" /></button>
      <button type="button" :class="{ active: active.unordered }" title="无序列表" @mousedown.prevent @click="command('insertUnorderedList')"><List :size="16" /></button>
      <button type="button" :class="{ active: active.ordered }" title="有序列表" @mousedown.prevent @click="command('insertOrderedList')"><ListOrdered :size="16" /></button>
      <span>支持加粗与列表排版</span>
    </div>
    <div ref="editor" class="rich-editor-content" contenteditable="true" role="textbox" aria-label="专业技能内容" aria-multiline="true" data-placeholder="输入专业技能，可使用工具栏排版" @input="sync" @keyup="updateActive" @mouseup="updateActive" @paste="pastePlainText"></div>
  </div>
</template>
