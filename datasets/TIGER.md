# TIGER 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

TIGER（Tumor Infiltrating lymphocytes in breast cancer）是乳腺癌肿瘤浸润淋巴细胞评分挑战，结合组织区域分割、淋巴/浆细胞检测与 WSI 级 TILs 评分。

### 相关论文与发布方

- [官方/第一方来源](https://tiger.grand-challenge.org/Data/)
- [原论文](https://arxiv.org/abs/2206.11943)
- [作者/赛事源码](https://github.com/DIAGNijmegen/pathology-tiger-algorithm-example)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2022 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | detection、seg、tils-scoring |
| **图像单元与尺寸** | wsi |
| **标注内容** | images + rois + label (7) |
| **扫描/附加条件** | (from TCGA, RUMC, JB) from BCSS和Nucls |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | WSIROIS: 195 wsi, WSIBULK: 93, WSITILS: 82 |
| **格式/数据形态** | TCGA-BRCA、Radboud UMC、Jules Bordet 等来源 H&E WSI/ROI、组织区标注、淋巴/浆细胞与 TIL score CSV；约 0.5 μm/px |
| **采集与版本** | 数据按三个**标注制度不同**的子集发布：WSIROIS 195 WSI、WSIBULK 93 WSI、WSITILS 82 WSI。不能合并成所有图片拥有同一份 mask。 |

---

## 任务与标注

WSIROIS 包含密集 ROI 内组织/细胞标注；WSIBULK 只提供粗糙肿瘤范围；WSITILS 仅有 WSI 级可视化估计 TIL 分数，不包含手工像素轮廓。

### 类别与标签语义

- 组织区：肿瘤/间质等（以 ROI 的官方 label map 为准）
- 免疫细胞：lymphocytes、plasma cells（细胞检测）
- Slide-level：TIL score（不是像素类别）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

WSIROIS 195 张、WSIBULK 93 张、WSITILS 82 张，每个 subset 的可用标注不同；官网提供 AWS Open Data `s3://tiger-training/`，测试数据由挑战方保留。

---

## 文件组成与读取方式

- 多级 WSI TIFF/ROI patches
- WSIROIS 的组织与细胞标注
- WSIBULK 的粗糙肿瘤区域
- `tiger-til-scores-wsitils.csv` 中逐片 TIL 值

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

- 按三个 subset 解析不同监督信号，不要把 CSV TIL score 转成虚假实例 mask。

### 建模与数据泄漏风险

- WSIROIS 部分 TCGA 样本及注释基于 BCSS/NuCLS 调整；患者级泄漏十分现实。

### 评估指标

TIL score 回归/排名一致性、淋巴细胞检测 F1、组织分割 Dice/IoU（依各子任务）。

---

## 相关资源

- [data](https://tiger.grand-challenge.org/)
- [paper](https://arxiv.org/abs/2206.11943)
- [github](https://github.com/DIAGNijmegen/pathology-tiger-algorithm-example)
- [official](https://tiger.grand-challenge.org/Data/)

---

## 引用

正确 BibTeX 请从 [论文记录](https://arxiv.org/abs/2206.11943) 导出；不编造作者与卷期页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：WSIROIS 的 TCGA-BRCA 151 WSI 与 BCSS、NuCLS 来源相互关联。
4. **核查边界**：官方TIL评估；检测+组织分割+评分
