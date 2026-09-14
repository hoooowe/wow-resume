<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label?: string
  startDate: string
  endDate: string
  presentLabel?: string
  startPlaceholder?: string
  endPlaceholder?: string
}>()
const emit = defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()

const presentLabel = computed(() => props.presentLabel ?? '至今')

function toMonthInput(value: string) {
  if (!value || value === presentLabel.value) return ''
  const match = value.match(/^(\d{4})[.\-/](\d{1,2})$/)
  if (!match) return ''
  return `${match[1]}-${match[2].padStart(2, '0')}`
}

function fromMonthInput(value: string) {
  if (!value) return ''
  const [year, month] = value.split('-')
  return `${year}.${month}`
}

const startInput = computed({
  get: () => toMonthInput(props.startDate),
  set: (value: string) => emit('update:startDate', fromMonthInput(value)),
})

const isPresent = computed({
  get: () => props.endDate === presentLabel.value,
  set: (value: boolean) => {
    emit('update:endDate', value ? presentLabel.value : '')
  },
})

const endInput = computed({
  get: () => toMonthInput(props.endDate),
  set: (value: string) => emit('update:endDate', fromMonthInput(value)),
})
</script>

<template>
  <label class="date-range-field">
    <span v-if="label" class="field-caption">{{ label }}</span>
    <div class="date-range-control">
      <input v-model="startInput" type="month" :placeholder="startPlaceholder ?? '开始'" aria-label="开始时间" />
      <span class="date-range-sep">至</span>
      <input v-if="!isPresent" v-model="endInput" type="month" :placeholder="endPlaceholder ?? '结束'" aria-label="结束时间" />
      <span v-else class="date-range-present">{{ presentLabel }}</span>
      <label class="date-present-toggle">
        <input v-model="isPresent" type="checkbox" />
        {{ presentLabel }}
      </label>
    </div>
  </label>
</template>
