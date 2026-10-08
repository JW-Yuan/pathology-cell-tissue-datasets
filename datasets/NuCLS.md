# NuCLS 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

NuCLS 是乳腺癌 TCGA H&E 细胞核定位、分类、分割协作注释大规模基准，包括病理医生、住院医和医学学生提供的不同标注类型，适于多标注者一致性研究。

### 相关论文与发布方

- [官方/第一方来源](https://github.com/PathologyDataScience/NuCLS)
- [原论文](https://arxiv.org/ftp/arxiv/papers/2102/2102.09099.pdf)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2021 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | detection、classi、seg |
| **图像单元与尺寸** | patch |
| **标注内容** | roi + bounding bx + classification |
| **扫描/附加条件** | (TCGA,imgs from BCSS) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 220.000 nuclei from 3.944 roi from 125 patients |
| **格式/数据形态** | 3,944 个 ROI，约 220,000 个手工标注核，来自约 125 名患者；支持 bbox/polyline 等几何形式 |
| **采集与版本** | 数据源与 BCSS、TCGA-BRCA 相关；多用户投票和单评估者版本不同，不能混称每个核都有像素级多边形。 |

---

## 任务与标注

有核检测坐标、框、类别；只有实际具备 polyline/polygon 的记录才能生成真实实例 segmentation mask。不同来源标注者的一致性可用于研究监督噪声。

### 类别与标签语义

- 原始类别体系包含肿瘤核、淋巴细胞、间质等；项目提供 raw/main/super 不同层级 taxonomy
- 类别编号和合并方式以 NuCLS 原作者发布的分类表为准

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

3,944 个 ROI / 125 位患者非独立病人级随机样本；原作者数据包有多个版本和可选切分，须按病例/医院来源隔离。

---

## 文件组成与读取方式

- ROI RGB images 与 TCGA 对应关系
- 核几何位置、bbox、类别与 polygon/polyline 注释
- Single-rater / multi-rater 版本与说明

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

- 解析 raw_classification/main_classification 等标签层级；只有多边形才 rasterize 成实例 mask。

### 建模与数据泄漏风险

- 不应将所有 bbox 都声称是实例真值，也不要在 NuCLS/BCSS/TIGER 交叉实验中忽略 TCGA 病例重复。

### 评估指标

检测 mAP/F1、核分类 F1；对有真实轮廓的子集才评估 PQ/Dice。

---

## 相关资源

- [data](https://nucls.grand-challenge.org/)
- [paper](https://arxiv.org/ftp/arxiv/papers/2102/2102.09099.pdf)
- [download](https://sites.google.com/view/nucls/single-rater)
- [official](https://github.com/PathologyDataScience/NuCLS)

---

## 引用

请从 [原论文/出版社](https://arxiv.org/ftp/arxiv/papers/2102/2102.09099.pdf) 导出 BibTeX，不能使用非真实示例作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 BCSS 和 TIGER 的 TCGA-BRCA 部分有标签/病例派生关系。
4. **核查边界**：NuCLS原作者发布仓库
