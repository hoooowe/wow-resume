<script setup lang="ts">
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import draggable from 'vuedraggable'
import type { IconName, ResumeSection } from '../types'
import { useResumeStore } from '../stores/resume'
import ResumeIcon from './ResumeIcon.vue'
import IconPicker from './IconPicker.vue'
import RichTextEditor from './RichTextEditor.vue'
const props = defineProps<{ section: ResumeSection }>()
const store = useResumeStore()
const pickerOpen = ref(false)
function updateIcon(value: IconName) { props.section.icon = value }
</script>
<template>
  <section class="section-editor-wrap">
    <div class="section-editor-head">
      <GripVertical class="section-drag" :size="18" aria-label="拖拽模块排序" />
      <button class="section-icon-button" type="button" title="更换图标" @click="pickerOpen = true"><ResumeIcon :name="section.icon" :size="18" /></button>
      <input v-model="section.title" class="section-title-input" aria-label="模块标题" />
      <button type="button" :title="section.visible ? '隐藏模块' : '显示模块'" @click="section.visible = !section.visible"><component :is="section.visible ? Eye : EyeOff" :size="17" /></button>
      <button type="button" title="删除模块" @click="store.deleteSection(section.id)"><Trash2 :size="17" /></button>
      <button type="button" :title="section.expanded ? '收起' : '展开'" @click="section.expanded = !section.expanded"><component :is="section.expanded ? ChevronUp : ChevronDown" :size="18" /></button>
      <IconPicker :open="pickerOpen" :model-value="section.icon" @update:model-value="updateIcon" @close="pickerOpen = false" />
    </div>
    <RichTextEditor v-if="section.expanded && section.type === 'skills'" v-model="section.richText" />
    <draggable v-else-if="section.expanded" v-model="section.items" item-key="id" handle=".item-drag" class="item-list" :animation="180">
      <template #item="{ element: item, index }">
        <article class="editor-card item-card">
          <div class="item-card-head"><GripVertical class="item-drag" :size="16" /><span>条目 {{ index + 1 }}</span><button type="button" aria-label="删除条目" @click="store.deleteItem(section.id, item.id)"><Trash2 :size="15" /></button></div>
          <div class="field-grid compact">
            <label>组织 / 项目<input v-model="item.organization" placeholder="学校、公司或项目名称" /></label>
            <label>职位 / 专业<input v-model="item.position" placeholder="职位、专业或奖项" /></label>
            <label>开始时间<input v-model="item.startDate" placeholder="2025.09" /></label><label>结束时间<input v-model="item.endDate" placeholder="至今" /></label>
            <label>地点<input v-model="item.location" placeholder="城市" /></label><label>副标题<input v-model="item.subtitle" placeholder="可选补充信息" /></label>
          </div>
          <label v-if="section.type === 'internship' || section.type === 'project'" class="summary-field">总体描述<textarea v-model="item.summary" rows="2" placeholder="对这段经历进行一句话概括，不显示项目符号" /></label>
          <div class="bullets"><span class="field-caption">内容要点</span>
            <div v-for="(_, bulletIndex) in item.description" :key="bulletIndex" class="bullet-input"><i>•</i><textarea v-model="item.description[bulletIndex]" rows="2" placeholder="描述你的成果、行动与影响" /><button type="button" aria-label="删除要点" @click="store.deleteBullet(section.id, item.id, bulletIndex)">×</button></div>
            <button class="text-button" type="button" @click="store.addBullet(section.id, item.id)"><Plus :size="14" />新增要点</button>
          </div>
        </article>
      </template>
    </draggable>
    <button v-if="section.expanded && section.type !== 'skills'" class="add-item-button" type="button" @click="store.addItem(section.id)"><Plus :size="16" />添加一段{{ section.title }}</button>
  </section>
</template>
