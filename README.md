# desktop-pets
AI Desktop Pet Project


## Windows 初版

技术栈：Electron + React + TypeScript。界面源代码位于 `renderer/`。

### 下载与运行

在仓库 Actions 中打开成功的 **Build Windows Desktop Pets** 任务，下载 **Desktop-Pets-Windows-x64** 产物并解压，双击其中的 `Desktop-Pets-0.0.0-x64.exe`。这是 x64 Windows 的免安装测试版，未配置代码签名。

运行后将鼠标移到恐龙上方，可使用“摸摸 / 睡觉 / 唤醒”。点击窗口后按 **Esc** 退出。当前“睡觉”切换文字和呼吸节奏，尚无闭眼或走路动画。

### 云端开发

```bash
cd renderer
npm ci
npm run dev -- --host 0.0.0.0
```

Codespaces 的浏览器预览用于检查界面；Windows 透明窗口的实际效果需要在 Windows 测试。

### 构建 Windows EXE

推送 `renderer/` 或 Windows 工作流修改到 `main` 会自动构建，也可以在 Actions 中手动运行。工作流检查入口语法、类型、生产构建和打包后的角色素材，并输出 EXE 与 `SHA256SUMS.txt`。产物保留 14 天。

在 Windows 开发环境中也可运行：

```bash
cd renderer
npm ci
npm run dist:win
```

### 当前范围

已接入正面恐龙素材、悬停菜单、三个按钮、文字状态和简单呼吸动效；窗口配置为透明、无边框、置顶。拖动、托盘、开机启动、多角色与逐帧动画尚未加入。角色素材是基于用户原创三视图制作的初稿，正式造型以原图为准。
