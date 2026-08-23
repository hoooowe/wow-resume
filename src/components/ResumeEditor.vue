<script setup lang="ts">
import { CirclePlus, GripVertical } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { useResumeStore } from '../stores/resume'
import type { SectionType } from '../types'
import HeaderEditor from './HeaderEditor.vue'
import SectionEditor from './SectionEditor.vue'
const store = useResumeStore()
const options: { label: string; value: SectionType }[] = [
  { label: '教育经历', value: 'education' }, { label: '实习经历', value: 'internship' }, { label: '项目经历', value: 'project' },
  { label: '科研经历', value: 'research' }, { label: '校园经历', value: 'campus' }, { label: '技能', value: 'skills' },
  { label: '荣誉奖项', value: 'awards' }, { label: '自定义模块', value: 'custom' },
]
</script>
<template>
  <aside class="editor-pane no-print">
    <div class="editor-intro"><div><span class="eyebrow">CONTENT</span><h1>编辑简历</h1></div><small><i></i>已自动保存到本地</small></div>
    <HeaderEditor />
    <div class="section-list-label"><span>简历模块</span><small><GripVertical :size="13" />拖拽调整顺序</small></div>
    <draggable v-model="store.sections" item-key="id" handle=".section-drag" :animation="220" ghost-class="drag-ghost">
      <template #item="{ element }"><SectionEditor :section="element" /></template>
    </draggable>
    <el-dropdown trigger="click" placement="top-start" @command="(type: SectionType) => store.addSection(type)">
      <button class="add-section-button" type="button"><CirclePlus :size="18" />添加模块</button>
      <template #dropdown><el-dropdown-menu><el-dropdown-item v-for="option in options" :key="option.value" :command="option.value">{{ option.label }}</el-dropdown-item></el-dropdown-menu></template>
    </el-dropdown>
    <p class="privacy-note">内容会自动保存到项目的 data/resume-draft.json，也可点击顶部“保存草稿”。</p>
  </aside>
</template>
