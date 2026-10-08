# GlaS 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

GlaS（MICCAI 2015 Gland Segmentation Challenge）是结直肠 H&E 显微图的腺体实例/组织区域分割数据集，包含良性和恶性组织。

### 相关论文与发布方

- [官方/第一方来源](https://warwick.ac.uk/fac/cross_fac/tia/data/glascontest/)
- [原论文](https://arxiv.org/pdf/1603.00275v2.pdf)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2015 |
| **器官/组织或物种** | Colorectal (Gland) |
| **染色及模态** | H&E |
| **具体任务** | classi、seg |
| **图像单元与尺寸** | Patch (diff sizes - few hundred px) |
| **标注内容** | Train: 85 (37 benign, 48 malignant); Test: 80 (37 benign, 43 malignant) |
| **扫描/附加条件** | 20x - Zeiss MIRAX MIDI |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 165 |
| **格式/数据形态** | RGB 组织 H&E patches + gland boundary/segmentation ground truth |
| **采集与版本** | 训练 85、测试 80，共 165 张；不同组织中腺体形状、大小及病理破坏程度变化显著。 |

---

## 任务与标注

标注对象是 gland（腺体），不是每一个核。图像级 benign/malignant 信息用于挑战子组分析，不能直接变为核级分类 GT。

### 类别与标签语义

- Gland/Non-gland（腺体区域）
- 图像/组织类别：Benign、Malignant

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

训练 85（37 benign、48 malignant），测试 80（37 benign、43 malignant）。

---

## 文件组成与读取方式

- 组织显微图像（大小随样本变化）
- 与原图像对应的 gland segmentation GT

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

- 核查像素级 gland 标注；分割前尽量保持原始扫描比例。

### 建模与数据泄漏风险

- 若与 CRAG 联合训练，谨慎检查原始病例重合；GlaS 不提供逐核多类分割 GT。

### 评估指标

Object-level Dice、F1、Hausdorff distance（按 MICCAI GlaS 赛题定义）。

---

## 相关资源

- [data](https://warwick.ac.uk/fac/cross_fac/tia/data/glascontest/)
- [paper](https://arxiv.org/pdf/1603.00275v2.pdf)
- [download](https://www.kaggle.com/datasets/sani84/glasmiccai2015-gland-segmentation)
- [official](https://warwick.ac.uk/fac/cross_fac/tia/data/glascontest/)

---

## 引用

正式引文请从 [原论文](https://arxiv.org/pdf/1603.00275v2.pdf) 获取并导出 BibTeX，不猜测完整作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：Lizard 来源图像中含 GlaS 数据片段。
4. **核查边界**：Warwick GlaS 官方数据页；腺体分割
