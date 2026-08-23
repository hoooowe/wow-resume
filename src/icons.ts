import {
  Award, BookOpen, BriefcaseBusiness, Building2, ChartNoAxesCombined, CircleUserRound,
  Code2, Coffee, FolderKanban, FlaskConical, Globe2, GraduationCap, HeartHandshake,
  Languages, Laptop, Lightbulb, Medal, Rocket, Star, Target,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { IconName } from './types'

export const iconMap: Record<IconName, Component> = {
  Award, BookOpen, BriefcaseBusiness, Building2, ChartNoAxesCombined, CircleUserRound,
  Code2, Coffee, FolderKanban, FlaskConical, Globe2, GraduationCap, HeartHandshake,
  Languages, Laptop, Lightbulb, Medal, Rocket, Star, Target,
}

export const iconOptions = Object.keys(iconMap) as IconName[]
