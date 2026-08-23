import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElColorPicker } from 'element-plus/es/components/color-picker/index'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus/es/components/dropdown/index'
import { ElInputNumber } from 'element-plus/es/components/input-number/index'
import { ElOption, ElSelect } from 'element-plus/es/components/select/index'
import 'element-plus/es/components/base/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/color-picker/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/dropdown-menu/style/css'
import 'element-plus/es/components/dropdown-item/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/overlay/style/css'
import './styles.css'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App).use(pinia)
for (const component of [ElSelect, ElOption, ElColorPicker, ElInputNumber, ElDropdown, ElDropdownMenu, ElDropdownItem]) app.component(component.name!, component)
app.mount('#app')
