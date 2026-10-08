# CRCHisto 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

结直肠癌组织图像中的细胞核**定位与分类**数据，由 10 张 WSI 的 100 张高倍图裁切而成，包含近 30,000 个核的中心点类别标注。

### 相关论文与发布方

- [官方/第一方来源](https://warwick.ac.uk/fac/cross_fac/tia/data/crchistolabelednucleihe/)
- [原论文](https://ieeexplore.ieee.org/document/7399414)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2016 |
| **器官/组织或物种** | Colon |
| **染色及模态** | H&E |
| **具体任务** | detection、classi |
| **图像单元与尺寸** | patch (500x500) |
| **标注内容** | H&E images + nuclei centroid/point annotations with type labels (not pixel-level nuclear masks) |
| **扫描/附加条件** | 20x - Omnyx VL120 (UHCW) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 100 images, 29.756 nuclei (10 wsi, 9 patients) |
| **格式/数据形态** | 100 张 H&E 500×500 RGB patches + 核中心点坐标和类别标签 |
| **采集与版本** | 9 位患者、10 张 WSI；20×，Omnyx VL120。 |

---

## 任务与标注

原始 supervision 是核中心位置/类别，不是逐核像素掩膜。若使用 Gaussian target 或 point-matching 训练检测器，这些热图均为衍生标签。

### 类别与标签语义

- Epithelial（上皮核）
- Inflammatory（炎性核）
- Fibroblast（成纤维细胞）
- Miscellaneous（其他核）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

100 张 500×500 图、29,756 个已标注核；具体是否全部标注与原论文评测设置相关，按源 split 或患者分组划分。

---

## 文件组成与读取方式

- 原图像 RGB patches
- 核中心位置、核类型的点标注文件

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

- 以标注坐标生成目标位置 heatmap 或检测点序列；不应把 points 直接当像素 mask。

### 建模与数据泄漏风险

- 分类任务是 point-level nucleus phenotype 分类；不能声称有官方逐核分割 mask。

### 评估指标

定位 precision/recall、F1，逐类检测 F1 和分类准确率（按匹配距离阈值）。

---

## 相关资源

- [data](https://warwick.ac.uk/fac/cross_fac/tia/data/crchistolabelednucleihe/)
- [paper](https://ieeexplore.ieee.org/document/7399414)
- [official](https://warwick.ac.uk/fac/cross_fac/tia/data/crchistolabelednucleihe/)

---

## 引用

正式引文请从 [原论文](https://ieeexplore.ieee.org/document/7399414) 获取并导出 BibTeX，不猜测完整作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 Colorectal Nuclei 相关研究存在来源共享风险，应按原始图像 id 核对。
4. **核查边界**：Warwick作者数据页；核中心点标注
