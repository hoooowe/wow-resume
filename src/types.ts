export type IconName =
  | 'GraduationCap' | 'BriefcaseBusiness' | 'FolderKanban' | 'FlaskConical'
  | 'Building2' | 'Code2' | 'Award' | 'BookOpen' | 'ChartNoAxesCombined'
  | 'CircleUserRound' | 'Coffee' | 'Globe2' | 'HeartHandshake' | 'Languages'
  | 'Laptop' | 'Lightbulb' | 'Medal' | 'Rocket' | 'Star' | 'Target'

export type SectionType = 'education' | 'internship' | 'project' | 'research' | 'campus' | 'skills' | 'awards' | 'custom'

export interface EducationTags {
  is985: boolean
  is211: boolean
  isDoubleFirstClass: boolean
}

export interface ResumeItem {
  id: string
  organization: string
  logo?: string
  position: string
  startDate: string
  endDate: string
  location: string
  subtitle: string
  summary: string
  description: string[]
  educationTags: EducationTags
  summaryHtml: string
  descriptionHtml: string
}

export interface ResumeSection {
  id: string
  type: SectionType
  title: string
  icon: IconName
  visible: boolean
  expanded: boolean
  richText: string
  items: ResumeItem[]
}

export interface ResumeHeaderData {
  name: string
  target: string
  phone: string
  email: string
  location: string
  github: string
  website: string
  schoolLogo: string
  schoolLogoSize: number
  photo: string
  photoSize: number
}

export interface ResumeStyles {
  fontFamily: string
  fontSize: number
  lineHeight: number
  textColor: string
  secondaryColor: string
  themeColor: string
  sectionTitleSize: number
  sectionGap: number
  itemGap: number
  paddingX: number
  paddingY: number
}

export interface ResumeState {
  documentName: string
  header: ResumeHeaderData
  sections: ResumeSection[]
  styles: ResumeStyles
}
