# NextFrame

<p align="right">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://nextframe-ivory.vercel.app/"><img src="https://img.shields.io/badge/在线演示-nextframe--ivory.vercel.app-black?logo=vercel&logoColor=white" alt="在线演示"></a>
  <a href="https://github.com/yeoyujie/NextFrame/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/yeoyujie/NextFrame/ci.yml?branch=main&label=CI" alt="CI 状态"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6"></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white" alt="pnpm 12"></a>
</p>

**故事，从这一帧开始。精彩，未完待续。**

NextFrame 是一个小而精致的 AI 生成视频系列精选平台。它采用“系列优先”
而不是无尽信息流的浏览方式：发现一个系列，打开第一集，然后通过抖音官方
播放器按顺序继续观看。

> 这是一个个人非商业项目。目前不提供账号、付费、广告或用户追踪功能。

## 功能特点

- 以**系列**而不是零散视频作为主要内容单位
- 未配置缩略图时，使用专门设计的备用封面
- 支持分享、精确到集数的观看链接，例如
  `/series/the-last-human/episode/4`
- 使用抖音官方 iframe 播放器，并为竖屏视频响应式调整尺寸
- 支持上一集和下一集导航
- 响应式剧集列表，始终清晰标识当前播放集数
- 使用静态 TypeScript 内容，无需数据库、后端 API 或用户账号系统
- GitHub Actions 自动执行代码检查、生产构建、依赖审计和密钥扫描

核心体验保持简单：

```text
发现系列 → 打开剧集 → 观看 → 继续下一集
```

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

NextFrame 目前是一个精选观看平台，而不是社交网络。当前没有用户账号、社交
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

## 添加或更新内容

规范的数据模型位于
[`data/series/types.ts`](data/series/types.ts)。每个剧集都有独立的内容文件，
存放在 [`data/series/`](data/series/) 中；[`data/series.ts`](data/series.ts)
是控制展示顺序的目录清单。

添加剧集时，在 `data/series/` 中创建一个类型安全的文件，然后在
`data/series.ts` 中添加对应的导入和条目。移动 `data/series.ts` 中的条目即可
调整首页顺序，第一项会最先显示。请保持每个剧集中的分集按集数排列，因为它们
也会控制上一集和下一集的导航。

每个系列包含：

- `slug`：稳定的 URL 路径片段
- `title` 和 `description`
- 可选的 `thumbnail`
- 按顺序排列的 `episodes` 数组

每一集包含公开的抖音 `videoId`、集数和标题。已知视频尺寸时，可以填写可选的
`videoWidth` 和 `videoHeight`；如果没有填写，应用会使用竖屏播放器默认值，并
可能通过抖音 iframe API 查询尺寸。`previewUrl` 为未来功能预留，目前不会被使用。

剧集页面会根据目录在构建时生成，路由格式为：

```text
/series/[slug]/episode/[episode]
```

播放器 URL 的构造和 iframe 行为集中在
[`components/video-player.tsx`](components/video-player.tsx) 中，避免将平台
相关细节散落在其他 UI 组件里。

## 项目结构

```text
app/                         App Router 页面、布局和全局样式
components/                  Header、卡片、剧集列表和播放器
data/series.ts               有序的视频目录清单
data/series/                  每个剧集一个 TypeScript 内容文件
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

NextFrame 的原创源代码采用
[MIT License](LICENSE) 授权。你可以使用、修改、分发和商业化这些源代码，但
必须按照许可证要求保留版权声明和许可证文本。

目录中的视频 ID 和嵌入视频来自抖音，相关内容仍受视频创作者、发布者及平台条款
约束。NextFrame 不主张拥有这些视频的版权，不下载或重新托管视频文件，而是使用
抖音官方嵌入播放器。MIT License 不会授予复制、分发、商业化或以其他方式使用
这些第三方内容的权利。关于署名请求和第三方内容边界，请参阅
[`NOTICE`](NOTICE)。

如果你是目录中内容的版权所有者或代理人，并希望移除相关内容，请提交 Issue，
并提供足以定位系列或剧集的信息。本说明仅供参考，不构成法律意见；在发布网站
或加入任何商业化功能前，请确认适用的抖音条款和当地法律。

## 参与贡献

请让改动围绕精选观看体验展开。添加系列时，请使用稳定的 slug，保持集数顺序，
确认视频 ID 可以通过官方播放器公开播放，并在提交 Pull Request 前运行
`pnpm lint` 和 `pnpm build`。

## 许可证

NextFrame 原创源代码：[MIT License](LICENSE)。

第三方内容不在 MIT License 的授权范围内，详情请参阅 [`NOTICE`](NOTICE)。
