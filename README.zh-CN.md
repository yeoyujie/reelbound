<h1 align="center">Reelbound</h1>

<p align="center">
  <strong>故事，从这一帧开始。精彩，未完待续。</strong><br>
  一个精心策展、富有电影感的 AI 生成短剧系列观看平台。
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/yeoyujie/reelbound/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/yeoyujie/reelbound/ci.yml?branch=main&label=CI" alt="CI 状态"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6"></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white" alt="pnpm 12"></a>
</p>

<p align="center">
  <img src="docs/screenshots/home-desktop-zh-CN.webp" alt="Reelbound 深色模式中文版首页，展示精选系列和“观看第 1 集”按钮" width="900">
</p>

Reelbound 把 Netflix 式的“系列优先”体验带到短视频中。这里没有无尽的信息流：
**发现一个系列，从第一集开始，按顺序一直看下去**，视频通过抖音官方播放器播放。

```text
发现系列  →  打开剧集  →  观看  →  继续下一集
```

> 这是一个个人非商业项目。目前不提供账号、付费、广告或用户追踪功能。

## 界面一览

### 发现

精心挑选的系列目录，而不是零散的视频。每张卡片展示封面、标题、类型和简短
简介，点击即可从第一集开始观看。

<p align="center">
  <img src="docs/screenshots/catalogue-desktop-zh-CN.webp" alt="系列目录，展示海报封面、类型和简介" width="900">
</p>

### 观看

播放器是页面的主角，旁边是完整的分集列表，当前集数一目了然。醒目的
**上一集 / 下一集**按钮会直接显示目标集数和标题，接下来看什么始终清清楚楚。

<p align="center">
  <img src="docs/screenshots/episode-desktop-zh-CN.webp" alt="剧集页面，展示抖音播放器、剧集标题和简介、上一集和下一集按钮以及分集列表" width="900">
</p>

### 为手机而设计

移动端经过专门设计，而不是把桌面版缩小：播放器在最前，接着是剧集信息、
通栏的**下一集**按钮和数字分集网格。

<table>
  <tr>
    <td align="center" width="50%"><img src="docs/screenshots/home-mobile-zh-CN.webp" alt="移动端首页，展示精选系列" width="300"></td>
    <td align="center" width="50%"><img src="docs/screenshots/episode-mobile-zh-CN.webp" alt="移动端剧集页面，展示播放器、剧集信息、上一集和下一集按钮以及分集网格" width="300"></td>
  </tr>
  <tr>
    <td align="center"><sub>精选系列</sub></td>
    <td align="center"><sub>先看视频，再选下一集</sub></td>
  </tr>
</table>

### 简体中文与 English

所有页面都提供简体中文和英文版本。系列标题、简介和集数标签都会针对不同观众
分别本地化，而不只是翻译界面文字。

<table>
  <tr>
    <th width="50%">简体中文</th>
    <th width="50%">English</th>
  </tr>
  <tr>
    <td><img src="docs/screenshots/episode-desktop-zh-CN.webp" alt="中文剧集页面"></td>
    <td><img src="docs/screenshots/episode-desktop-en.webp" alt="英文剧集页面"></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/episode-mobile-zh-CN.webp" alt="中文移动端剧集页面" width="260"></td>
    <td align="center"><img src="docs/screenshots/episode-mobile-en.webp" alt="英文移动端剧集页面" width="260"></td>
  </tr>
</table>

<details>
<summary>更多英文界面截图</summary>
<br>

| 首页 | 系列目录 | 移动端 |
| --- | --- | --- |
| ![英文首页](docs/screenshots/home-desktop-en.webp) | ![英文系列目录](docs/screenshots/catalogue-desktop-en.webp) | ![英文移动端首页](docs/screenshots/home-mobile-en.webp) |

</details>

<sub>所有截图均为默认的深色模式；只需点击一次即可切换到浅色主题。</sub>

## 功能特点

- 以**系列**为单位的精选目录；未配置缩略图时使用专门设计的备用封面
- 支持多季、番外、分段剧集和合集，并自动编号
- 支持分享、精确到集数的观看链接，例如 `/zh-CN/series/gui-xu/episode/2`
- 使用抖音官方 iframe 播放器，并为竖屏视频响应式调整尺寸
- 上一集 / 下一集按钮直接显示目标剧集
- 分集列表始终清晰标识当前播放集数
- 支持简体中文和英文，以及深色和浅色主题
- 使用静态 TypeScript 内容，无需数据库、后端 API 或用户账号系统
- GitHub Actions 自动执行代码检查、生产构建、依赖审计和密钥扫描

## 技术栈

- [Next.js](https://nextjs.org/) 16 App Router
- [React](https://react.dev/) 19
- TypeScript
- Tailwind CSS 4，以及项目现有的全局 CSS
- pnpm
- 使用 Vercel 部署
- 使用[抖音官方嵌入式播放器](https://open.douyin.com/)播放视频，并通过
  [抖音开放平台 API](https://developer.open-douyin.com/docs/resource/zh-CN/developer/introduction/overview)
  获取元数据和播放器尺寸

项目刻意不引入数据库或 CMS。这样可以让代码更容易理解，也让精选目录能够
通过版本控制稳定、可复现地维护。

## 当前范围

Reelbound 目前是一个精选观看平台，而不是社交网络。当前没有用户账号、社交
登录、个人主页、评论、点赞、关注、个性化推荐或“稍后观看”列表。视频目录
有意采用静态 TypeScript 内容进行精选和维护。

## 未来路线图

可能的后续方向（按优先级排序）：

- 在需要持久化用户功能时加入后端和数据库
- 支持可选的社交账号登录和用户账号
- 允许用户收藏剧集或视频以便稍后观看
- 保存观看进度，并提供“继续观看”历史
- 在具备完善审核机制后，引入评论等社区功能
- 使用轻量级编辑流程改进内容目录管理
- 随着目录增长，加入更丰富的元数据、搜索和发现工具

以上内容是探索中的想法，并不代表已实现的功能或确定承诺。任何账号或社区
功能上线前，都需要明确的隐私、审核、安全和数据保留政策。

## 本地运行

请使用 Node.js 24 和 pnpm 12.10.1。pnpm 版本已固定在
[`package.json`](package.json) 中。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

然后打开 [http://localhost:3000](http://localhost:3000)。

如需以接近生产环境的方式运行：

```bash
pnpm build
pnpm start
```

## 内容目录

规范的数据模型位于
[`data/series/types.ts`](data/series/types.ts)。每个剧集都有独立的内容文件，
存放在 [`data/series/`](data/series/) 中；[`data/series.ts`](data/series.ts)
是控制展示顺序的目录清单。

### 添加或更新剧集

添加剧集时，在 `data/series/` 中创建一个类型安全的文件，然后在
`data/series.ts` 中添加对应的导入和条目。移动 `data/series.ts` 中的条目即可
调整首页顺序，第一项会最先显示。请保持每个剧集中的分集按集数排列，因为它们
也会控制上一集和下一集的导航。

### 本地化标题和简介

由于 Reelbound 面向英文观众呈现中文抖音系列，原始中文标题是内容的规范来源。
`title.en` 是可独立调整的英文本地化标题，不应决定剧集的技术身份。对于新的
中文剧集，请使用稳定的汉语拼音作为 slug 和内容文件名，例如 `归墟` 使用
`gui-xu`；像 `NOVA` 这样的品牌名则保留原本的拉丁字母写法。

### 内容字段

每个系列包含：

- `slug`：稳定的 URL 路径片段
- `title` 和 `description`，各自包含 `en` 和 `zh` 文本
- 可选的 `tags`、`thumbnail` 和季标题
- 按顺序排列的 `episodes` 数组

每一集只需要提供公开的抖音 `videoId`。集数和 URL 片段会根据每一季中的列表
顺序自动生成，因此 `title`、`label`、`season`、`kind`（`special` 或
`compilation`）等字段都是可选的。已知视频尺寸时，可以填写可选的
`videoWidth` 和 `videoHeight`；如果没有填写，应用会使用竖屏播放器默认值，并
可能通过抖音 iframe API 查询尺寸。`previewUrl` 为未来功能预留，目前不会被使用。

### 剧集路由和页面标题

剧集页面会根据目录在构建时生成，路由格式为：

```text
/[lang]/series/[slug]/episode/[episode]
```

`lang` 为 `en` 或 `zh-CN`。集数片段形如 `4`、`9-part-1`、`s2-e1` 或
`special-1`。

剧集页面的浏览器标题在两种语言中都采用“系列名称优先”的结构，同时保留各自
自然的标点和空格规范：

```text
The Laid-Off Girl — Episode 4 | Reelbound
被裁掉的女孩 · 第4集｜Reelbound
```

英文使用长破折号分隔系列名称和剧集信息；中文使用间隔号作为紧凑的内容分隔符，
并在平台名称前使用全角竖线。

### 播放器集成

播放器 URL 的构造和 iframe 行为集中在
[`components/video-player.tsx`](components/video-player.tsx) 中，避免将平台
相关细节散落在其他 UI 组件里。

## 项目结构

```text
app/[lang]/                  多语言 App Router 页面和布局
app/globals.css              全局样式和设计变量
components/                  Header、卡片、剧集列表、导航和播放器
lib/                         集数编号和本地化工具
data/series.ts               有序的视频目录清单
data/series/                 每个系列一个 TypeScript 内容文件
docs/screenshots/            README 截图
.github/workflows/ci.yml     代码检查、构建、安全和依赖检查
```

## 检查与部署

你可以在本地运行主要检查：

```bash
pnpm lint
pnpm build
```

GitHub Actions 会针对以 `main` 为目标分支的 Pull Request，以及推送到 `main`
的提交运行代码检查和生产构建。同时还会执行生产依赖审计、Dependabot/依赖
审查和 Gitleaks Git 历史密钥扫描。定期安全工作流每周运行一次。

Vercel 通过 Git 集成处理部署：Pull Request 和功能分支会获得 Preview 部署，
`main` 分支会部署到 Production。GitHub Actions 负责验证代码，不负责部署。

## 内容、版权与许可

Reelbound 的原创源代码采用
[MIT License](LICENSE) 授权。你可以使用、修改、分发和商业化这些源代码，但
必须按照许可证要求保留版权声明和许可证文本。

目录中的视频 ID 和嵌入视频来自抖音，相关内容仍受视频创作者、发布者及平台条款
约束。Reelbound 不主张拥有这些视频的版权，不下载或重新托管视频文件，而是使用
抖音官方嵌入播放器。MIT License 不会授予复制、分发、商业化或以其他方式使用
这些第三方内容的权利。关于署名请求和第三方内容边界，请参阅
[`NOTICE`](NOTICE)。

如果你是目录中内容的版权所有者或代理人，并希望移除相关内容，请提交 Issue，
并提供足以定位系列或剧集的信息。

## 参与贡献

请让改动围绕精选观看体验展开。添加系列时，请使用稳定的 slug，保持集数顺序，
确认视频 ID 可以通过官方播放器公开播放，并在提交 Pull Request 前运行
`pnpm lint` 和 `pnpm build`。

## 许可证

Reelbound 原创源代码：[MIT License](LICENSE)。

第三方内容不在 MIT License 的授权范围内，详情请参阅 [`NOTICE`](NOTICE)。
