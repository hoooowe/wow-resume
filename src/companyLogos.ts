import tencent from './assets/company-logos/tencent.png?inline'
import alibaba from './assets/company-logos/alibaba.png?inline'
import meituan from './assets/company-logos/meituan.png?inline'
import xiaohongshu from './assets/company-logos/xiaohongshu.png?inline'
import bytedance from './assets/company-logos/bytedance.png?inline'
import baidu from './assets/company-logos/baidu.png?inline'
import jd from './assets/company-logos/jd.png?inline'
import bilibili from './assets/company-logos/bilibili.png?inline'
import google from './assets/company-logos/google.png?inline'
import meta from './assets/company-logos/meta.png?inline'
import microsoft from './assets/company-logos/microsoft.png?inline'
import amazon from './assets/company-logos/amazon.png?inline'
import apple from './assets/company-logos/apple.png?inline'
import nvidia from './assets/company-logos/nvidia.png?inline'

export interface CompanyLogo {
  id: string
  name: string
  src: string
}

export const companyLogos: readonly CompanyLogo[] = [
  { id: 'tencent', name: '腾讯', src: tencent },
  { id: 'alibaba', name: '阿里巴巴', src: alibaba },
  { id: 'meituan', name: '美团', src: meituan },
  { id: 'xiaohongshu', name: '小红书', src: xiaohongshu },
  { id: 'bytedance', name: '字节跳动', src: bytedance },
  { id: 'baidu', name: '百度', src: baidu },
  { id: 'jd', name: '京东', src: jd },
  { id: 'bilibili', name: '哔哩哔哩', src: bilibili },
  { id: 'google', name: 'Google', src: google },
  { id: 'meta', name: 'Meta', src: meta },
  { id: 'microsoft', name: 'Microsoft', src: microsoft },
  { id: 'amazon', name: 'Amazon', src: amazon },
  { id: 'apple', name: 'Apple', src: apple },
  { id: 'nvidia', name: 'NVIDIA', src: nvidia },
]
