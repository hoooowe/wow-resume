<script setup lang="ts">
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { ref, useId } from 'vue'
import { companyLogos, type CompanyLogo } from '../companyLogos'
import ImageUploader from './ImageUploader.vue'

const logo = defineModel<string>()
const organization = defineModel<string>('organization', { required: true })
const open = ref(false)
const trigger = ref<HTMLButtonElement>()
const uploader = ref<InstanceType<typeof ImageUploader>>()
const optionsId = useId()

function closePicker() {
  open.value = false
  trigger.value?.focus()
}

function handleEscape(event: KeyboardEvent) {
  if (!open.value) return
  event.stopPropagation()
  closePicker()
}

function choose(preset: CompanyLogo) {
  uploader.value?.cancelPendingUpload()
  logo.value = preset.src
  if (!organization.value.trim()) organization.value = preset.name
  closePicker()
}
</script>

<template>
  <div class="company-logo-field" @keydown.esc="handleEscape">
    <div class="company-logo-controls">
      <ImageUploader ref="uploader" v-model="logo" class="company-logo-upload" label="公司 Logo" kind="logo" />
      <button ref="trigger" type="button" class="company-logo-toggle" :aria-expanded="open" :aria-controls="optionsId" @click="open = !open">
        选择公司 Logo
        <component :is="open ? ChevronUp : ChevronDown" :size="14" aria-hidden="true" />
      </button>
    </div>
    <div :id="optionsId" :hidden="!open">
      <div v-if="open" class="company-logo-options" role="group" aria-label="公司 Logo 选项">
        <button v-for="preset in companyLogos" :key="preset.id" type="button" :aria-pressed="logo === preset.src" @click="choose(preset)">
          <img :src="preset.src" alt="" width="22" height="22" />
          <span>{{ preset.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-logo-field {
  margin-top: 10px;
}

.company-logo-controls {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.company-logo-upload {
  flex: 1;
  max-width: 200px;
  min-width: 0;
}

.company-logo-upload :deep(.upload-target) {
  display: block;
  height: 38px;
}

.company-logo-upload :deep(.image-delete) {
  top: 50%;
  transform: translateY(-50%);
}

.company-logo-toggle,
.company-logo-options button {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #dfe7f1;
  border-radius: 9px;
  background: #f8fafc;
  cursor: pointer;
  font-size: 12px;
}

.company-logo-toggle {
  justify-content: center;
  padding: 0 10px;
  white-space: nowrap;
}

.company-logo-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(98px, 1fr));
  gap: 6px;
  margin-top: 8px;
}

.company-logo-options button {
  min-height: 36px;
  padding: 5px 8px;
  text-align: left;
  overflow-wrap: anywhere;
}

.company-logo-options img {
  flex: none;
  object-fit: contain;
}

.company-logo-toggle:hover,
.company-logo-options button:hover,
.company-logo-options button[aria-pressed='true'] {
  border-color: #9bbcf2;
  background: #eef5ff;
  color: #245fbf;
}

.company-logo-toggle:focus-visible,
.company-logo-options button:focus-visible {
  outline: 2px solid var(--app-accent);
  outline-offset: 2px;
}
</style>
