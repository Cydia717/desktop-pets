# Desktop Pets

基于用户原创蓝色恐龙的 Windows 桌面伙伴，Electron + React + TypeScript。

## 0.1.0 动画与交互开发版

- 单击轻跳，长按 650 ms 摸摸冒爱心；按住移动超过 6 px 开始桌面拖动。
- 随机眨眼，闭眼坐姿睡觉，左右走路，八方向观察鼠标。透明图集通过 Canvas 播放。
- 闲置 60 秒睡觉；清醒时以 18–40 秒间隔小范围散步。右键可暂停自主活动、重置位置或退出。
- 透明区域按角色 alpha 判断点击穿透；拖动限制在显示器工作区，松手、取消或失焦后停止。
- 保留悬停时的“摸摸 / 睡觉 / 唤醒”按钮。按 Esc 退出，Ctrl+Shift+Q 为全局应急退出（注册成功时）。

## 下载与运行

在 Actions 中打开本次成功的 **Build Windows Desktop Pets**，下载 **Desktop-Pets-Windows-x64** 并解压，运行 `Desktop-Pets-0.1.0-x64.exe`。这是 Windows x64 免安装开发版，尚无代码签名。产物保留 14 天。

透明、点击穿透、拖动、多屏和 DPI 效果仍需 Windows 实机验证。浏览器预览无法验证桌面窗口移动和下方应用点击。

## 开发与检查

```bash
cd renderer
npm ci
npm run dev -- --host 0.0.0.0
```

```bash
npm run lint
npm test
npm run build
```

Windows 打包：`npm run dist:win`。推送 renderer 或 Windows 工作流修改至 main 会触发 Actions。工作流检查代码、素材、ASAR 内容并在 Windows 启动打包后的渲染器，输出 EXE 与 SHA256SUMS.txt。

## 当前边界

本版为 2D 逐帧动画开发版。完整功能目标仍按工作书推进；真实 3D、骨骼、重力落地、摔倒恢复、完整情绪系统、托盘、尺寸设置和开机启动尚未实现，不代表完整 V1.0 交付。生成式动画帧存在造型差异，正式角色仍以原始三视图为准，原图已保留在 assets/references。

参考项目、许可与采用范围见 [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)。本次开发与验证记录见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)，历史记录见 [docs/WORKLOG.md](docs/WORKLOG.md)。
