# Cellseg 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

NeurIPS 2022 细胞分割挑战覆盖不同实验室、不同显微模态的细胞图像，重点是**跨模态实例分割**，不是仅处理 H&E WSI 的组织病理集合。

### 相关论文与发布方

- [官方/第一方来源](https://neurips22-cellseg.grand-challenge.org/)
- [原论文](https://proceedings.mlr.press/v212/lee23b.html)
- [官方代码/原作者仓库](https://github.com/JunMa11/NeurIPS-CellSeg)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2022 |
| **器官/组织或物种** | multiple |
| **染色及模态** | multiple 模态也不同 |
| **具体任务** | seg |
| **图像单元与尺寸** | multi-modality microscopy images, variable field sizes |
| **标注内容** | images + limited labeled patches |
| **扫描/附加条件** | 以官方扫描信息为准 |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 1,000 annotated microscopy images + 1,725 unlabelled images (challenge/publication release; verify subset split) |
| **格式/数据形态** | 多模态显微图（明场、相差、DIC、荧光等）与实例分割标签，图像尺寸随采集来源变化 |
| **采集与版本** | 官方赛事提供约 1,000 张带标签训练图像、无标签高分辨率图像和验证/测试集。不同论文对无标签 WSI 是否单独计数不一，不能混加。 |

---

## 任务与标注

目标是完整细胞实例分割；标签有不同实例 ID。官方 baseline 可能转换为背景/内部/边缘三类只是训练表示，不是原始任务的三种细胞语义。

### 类别与标签语义

- 前景：Cell（每个实例独立标识）
- 背景：非细胞区域；不存在跨全部显微模态统一的 5 类病理核分类

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

约 1,000 带标签训练图；验证（tuning）和隐藏测试另行提供。未标注数据有些文献计 1,712 张图+13 张 WSI，有些写 1,725；来源及单位需逐项区分。

---

## 文件组成与读取方式

- 显微 RGB/灰度图像（PNG/BMP/TIFF，视模态而定）
- 逐细胞实例 annotation
- 无标签预训练图和挑战评测脚本

> 此处描述发布包实际提供的文件类型与目录线索；未下载核对的完整文件树不作为“官方目录”展示。

### 文件核验示例

```python
from pathlib import Path

root = Path("DATASET_ROOT")  # 下载并解压后替换成实际路径
for p in sorted(root.rglob("*")):
    if p.is_file():
        print(p.relative_to(root), p.suffix)
```

对目录和标注文件进行核验后，再建立患者/图像/标注文件之间的映射，记录数量、尺寸及未知标签。

---

## 使用建议（简要）

### 加载与预处理

- 先检查每张图的通道、染色和像素范围，避免把荧光强度当作 H&E 的 RGB。

### 建模与数据泄漏风险

- 不能把不同模态简单合并计算固定 20× 或 40×；标签不是核分类语义。

### 评估指标

实例 F1 / IoU、challenge 官方细胞分割 F-score。

---

## 相关资源

- [data](https://neurips22-cellseg.grand-challenge.org/)
- [paper](https://proceedings.mlr.press/v212/lee23b.html)
- [github](https://github.com/JunMa11/NeurIPS-CellSeg)
- [download](https://pan.baidu.com/s/1lUK7dOR1MhVlaZ-iyOOhhA?pwd=2022#list/path=%2F)
- [official](https://neurips22-cellseg.grand-challenge.org/)

---

## 引用

引用请从 [原论文或出版社页面](https://proceedings.mlr.press/v212/lee23b.html) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与通用 Cellpose/Omnipose 等公开集合的补充训练使用需逐图防重。
4. **核查边界**：NeurIPS 2022 多模态细胞实例分割官方赛页
