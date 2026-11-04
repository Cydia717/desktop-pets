# 动画与交互参考来源

本项目继续采用 Electron + React + TypeScript。以下三个项目作为开发方法和交互设计参考，并非三个直接装入 EXE 的插件。本次运行时代码独立实现，没有复制或分发它们的源码或角色模型。

| 参考项目 | 核对版本 | 使用的方法 | 当前边界 |
| --- | --- | --- | --- |
| https://github.com/promptwhisper/sprite-pet-skill | 641ec9aa637e48f4ca59c5a91d5ed970d24c1014 | 原图身份约束、动作姿态图、每动作 4×2 八帧、逐帧边界与大小检查、按住冻结自主移动 | 使用原生透明 PNG 图集，运行时裁取帧；未导入其模板或安装为个人 AI skill |
| https://github.com/Y1fe1-Yang/desktop-pet-skill | 7eb3bfa22bf562cae6867ba8b889a2b34ac70331 | 区分点击、拖动和长按，爱心反馈、闲置睡觉 | 不运行其自动生成工程，保留现有仓库结构 |
| https://github.com/ayangweb/BongoCat | 47a73ed1765b13fdd674ec356d51b5b16a6b5a5b | 根据鼠标位置驱动角色响应的交互思路 | 使用八方向完整角色帧；没有 Live2D 模型、骨骼跟踪或全局键盘监听 |

前两个来源各自有不同的依赖与授权情况；如未来直接引入源码，须单独检查对应文件授权并保留通知。现有检查结果：desktop-pet-skill 仓库为 MIT，BongoCat 为 Apache-2.0，sprite-pet-skill 根目录未发现独立 LICENSE，仅见上游许可证。

## 素材来源与一致性

原始参考位于 `assets/references/blue-dino-three-view.png`，保持不变。新增动作由图像生成工具根据原图与代码绘制的姿态指引生成。原始动作图位于 `assets/animation-source/`，提示词位于 `prompts/`，姿态指引位于 `assets/pose-guides/`。

动作图可能存在生成式细节差异，属于待持续校准的动作素材，不宣称与原图逐像素一致。当前使用 2D 动画图集，不是真实 3D GLB / Live2D 角色；完整 3D 工作书仍需独立建模、骨骼和实机验收。
