<script setup lang="ts">
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import draggable from 'vuedraggable'
import type { IconName, ResumeItem, ResumeSection } from '../types'
import { useResumeStore } from '../stores/resume'
import ResumeIcon from './ResumeIcon.vue'
import IconPicker from './IconPicker.vue'
import RichTextEditor from './RichTextEditor.vue'
import DateRangePicker from './DateRangePicker.vue'

const props = defineProps<{ section: ResumeSection }>()
const store = useResumeStore()
const pickerOpen = ref(false)
function updateIcon(value: IconName) { props.section.icon = value }

function ensureEducationTags(item: ResumeItem) {
  if (!item.educationTags) item.educationTags = { is985: false, is211: false, isDoubleFirstClass: false }
  return item.educationTags
}

const dateLabel = () => props.section.type === 'education' ? '就读时间' : '实习时间'
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
    <RichTextEditor v-if="section.expanded && section.type === 'skills'" v-model="section.richText" content-label="专业技能内容" placeholder="输入专业技能，可使用工具栏排版" />
    <draggable v-else-if="section.expanded" v-model="section.items" item-key="id" handle=".item-drag" class="item-list" :animation="180">
      <template #item="{ element: item, index }">
        <article class="editor-card item-card">
          <div class="item-card-head"><GripVertical class="item-drag" :size="16" /><span>条目 {{ index + 1 }}</span><button type="button" aria-label="删除条目" @click="store.deleteItem(section.id, item.id)"><Trash2 :size="15" /></button></div>

          <!-- 教育经历 -->
          <template v-if="section.type === 'education'">
            <div class="field-grid compact">
              <label>学校<input v-model="item.organization" placeholder="学校名称" /></label>
              <label>专业<input v-model="item.position" placeholder="专业名称" /></label>
            </div>
            <DateRangePicker
              class="item-date-range"
              :label="dateLabel()"
              :start-date="item.startDate"
              :end-date="item.endDate"
              @update:start-date="item.startDate = $event"
              @update:end-date="item.endDate = $event"
            />
            <div class="edu-tags-field">
              <span class="field-caption">院校标签</span>
              <div class="edu-tag-toggles">
                <label class="edu-tag-toggle" :class="{ checked: ensureEducationTags(item).is985 }">
                  <input v-model="ensureEducationTags(item).is985" type="checkbox" />985
                </label>
                <label class="edu-tag-toggle" :class="{ checked: ensureEducationTags(item).is211 }">
                  <input v-model="ensureEducationTags(item).is211" type="checkbox" />211
                </label>
                <label class="edu-tag-toggle" :class="{ checked: ensureEducationTags(item).isDoubleFirstClass }">
                  <input v-model="ensureEducationTags(item).isDoubleFirstClass" type="checkbox" />双一流
                </label>
              </div>
            </div>
          </template>

          <!-- 实习经历 -->
          <template v-else-if="section.type === 'internship'">
            <div class="field-grid compact">
              <label>公司<input v-model="item.organization" placeholder="公司名称" /></label>
              <label>职位<input v-model="item.position" placeholder="职位名称" /></label>
            </div>
            <DateRangePicker
              class="item-date-range"
              :label="dateLabel()"
              :start-date="item.startDate"
              :end-date="item.endDate"
              @update:start-date="item.startDate = $event"
              @update:end-date="item.endDate = $event"
            />
            <div class="item-rich-fields">
              <RichTextEditor
                v-model="item.summaryHtml"
                compact
                label="总体描述"
                placeholder="对这段实习进行一句话概括"
                content-label="实习总体描述"
              />
              <RichTextEditor
                v-model="item.descriptionHtml"
                compact
                label="内容要点"
                placeholder="描述你的工作内容、成果与影响，可使用列表排版"
                content-label="实习内容要点"
              />
            </div>
          </template>

          <!-- 项目经历 -->
          <template v-else-if="section.type === 'project'">
            <div class="field-grid compact">
              <label class="wide">项目名称<input v-model="item.organization" placeholder="项目名称" /></label>
            </div>
            <div class="item-rich-fields">
              <RichTextEditor
                v-model="item.summaryHtml"
                compact
                label="总体描述"
                placeholder="对项目进行一句话概括"
                content-label="项目总体描述"
              />
              <RichTextEditor
                v-model="item.descriptionHtml"
                compact
                label="内容要点"
                placeholder="描述项目职责、方案与成果，可使用列表排版"
                content-label="项目内容要点"
              />
            </div>
          </template>

          <!-- 其他模块 -->
          <template v-else>
            <div class="field-grid compact">
              <label>组织 / 项目<input v-model="item.organization" placeholder="学校、公司或项目名称" /></label>
              <label>职位 / 专业<input v-model="item.position" placeholder="职位、专业或奖项" /></label>
              <label>开始时间<input v-model="item.startDate" placeholder="2025.09" /></label><label>结束时间<input v-model="item.endDate" placeholder="至今" /></label>
              <label>地点<input v-model="item.location" placeholder="城市" /></label><label>副标题<input v-model="item.subtitle" placeholder="可选补充信息" /></label>
            </div>
            <label class="summary-field">总体描述<textarea v-model="item.summary" rows="2" placeholder="对这段经历进行一句话概括，不显示项目符号" /></label>
            <div class="bullets"><span class="field-caption">内容要点</span>
              <div v-for="(_, bulletIndex) in item.description" :key="bulletIndex" class="bullet-input"><i>•</i><textarea v-model="item.description[bulletIndex]" rows="2" placeholder="描述你的成果、行动与影响" /><button type="button" aria-label="删除要点" @click="store.deleteBullet(section.id, item.id, bulletIndex)">×</button></div>
              <button class="text-button" type="button" @click="store.addBullet(section.id, item.id)"><Plus :size="14" />新增要点</button>
            </div>
          </template>
        </article>
      </template>
    </draggable>
    <button v-if="section.expanded && section.type !== 'skills'" class="add-item-button" type="button" @click="store.addItem(section.id)"><Plus :size="16" />添加一段{{ section.title }}</button>
  </section>
</template>
