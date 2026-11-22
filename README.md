# wow-resume

一个本地优先的中文简历编辑器。支持在同一个项目中管理多份简历，实时预览 A4 排版，并导出多页 PDF 或单张长图。

## 功能

- 多简历管理：新建、复制、重命名、删除和独立保存
- 本地项目存储：草稿写入 `data/resumes/`，不依赖浏览器缓存
- 可视化编辑：教育、实习、项目、科研、校园、技能、荣誉和自定义模块
- 灵活排版：字体、字号、行距、主题色、模块间距和页面边距
- 模块排序：拖拽调整模块及条目顺序
- 富文本技能区：支持加粗、有序列表和无序列表
- 可上传校徽和证件照并调整尺寸，实习公司 Logo 支持选择[内置品牌图标](src/assets/company-logos/SOURCES.md)或上传图片
- A4 分页预览：内容自动分页，PDF 按 A4 多页导出
- 长图导出：将整份简历导出为一张 PNG
- 隐私优先：简历草稿、证件照和本地参考资料默认不纳入 Git

## 技术栈

- Vue 3 + TypeScript
- Vite
- Pinia
- Element Plus
- Lucide Icons
- VueDraggable
- html-to-image

## 本地运行

建议使用 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

打开终端中显示的本地地址，通常为 <http://localhost:5173>。

项目使用 Vite 本地接口把草稿写入工作目录，因此请通过 `npm run dev` 运行；直接打开构建后的静态 HTML 无法写入项目文件。

## 测试与构建

```bash
npm test
npm run typecheck
npm run build
```

构建结果生成在 `dist/`。

## 草稿与隐私

运行后会自动创建以下本地文件：

```text
data/
└── resumes/
    ├── index.json
    ├── resume-*.json
    └── .trash/
```

- `index.json` 保存简历列表信息。
- 每份简历独立保存在一个 `resume-*.json` 文件中。
- 删除的简历会先移入 `.trash/`，避免误删后无法恢复。
- 旧版 `data/resume-draft.json` 会自动迁移为简历库中的第一份简历。
- `data/`、`references/`、证件照和校徽路径已加入 `.gitignore`，不会被默认提交。

如果需要备份个人草稿，请单独复制 `data/` 目录，并注意其中可能包含以 Base64 保存的个人图片。

## 导出

- PDF：点击编辑器右上角“导出 PDF”，浏览器会按 A4 页面打印。
- PNG：点击“导出长图”，生成完整简历长图。
- 导出文件名使用简历名称，并自动替换操作系统不允许的文件名字符。

## 项目结构

```text
src/
├── components/        # 主页面、编辑器、预览和通用组件
├── stores/            # 简历状态与默认空白模板
├── utils/             # 文件名等通用工具
├── App.vue            # 主页面与编辑器路由入口
└── styles.css         # 应用及打印样式

vite.config.ts         # Vite 配置与本地简历文件接口
```

## 数据安全提示

提交代码前建议运行：

```bash
git status --short
git ls-files data references public/assets
```

确认没有个人草稿、参考 PDF、校徽或证件照被纳入提交。
