# CPM-17 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

MICCAI 2017 Computational Pathology/Digital Pathology Challenge 的核实例分割任务，包含四种癌症组织：NSCLC、HNSCC、GBM、LGG；不能只把全部图像归入 Brain。

### 相关论文与发布方

- [当前 Google Drive 下载入口（发布者归属待核实，不能称官方）](https://drive.google.com/drive/folders/1sJ4nmkif6j4s2FOGj8j6i_Ye7z9w0TfA)
- [原论文](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6454006/)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2017 |
| **器官/组织或物种** | Multiple (four cancer tissue types) |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (500x500 to 600x600) |
| **标注内容** | images + nuclei seg + label |
| **扫描/附加条件** | 20x, 40x (TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 32, test: 32 (7570 nuclei) |
| **格式/数据形态** | H&E tissue tiles，大小约 500×500 至 600×600，像素级核实例轮廓 |
| **采集与版本** | 2017 为**挑战赛年份**；相关总结论文于 2019 年发表。挑战还设置了独立的 WSI 分类子赛道，不能把其标签并入核分割。 |

---

## 任务与标注

核定位与实例边界标注；原核分割子集不代表提供可训练的核表型类别。

### 类别与标签语义

- Nucleus（核实例）/Background（背景）
- 组织来源：NSCLC、HNSCC、GBM、LGG（不是四个核类型）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

核分割子赛道 32 张训练和 32 张测试；早期论文/不同整理包可能只统计 32 张有标签的图。

---

## 文件组成与读取方式

- 核分割高倍视野图像
- 像素级逐核轮廓/mask 标签
- 独立 WSI 分类子挑战不属于本条目标注数据

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

- 分离核分割与另一个 WSI 分类子赛道；用官方提供的样本号核对 split。

### 建模与数据泄漏风险

- 原始云盘文件归属和各版本下载文件的真实测试 GT 目前待核，不推断完整文件树。

### 评估指标

核级 AJI、Dice/PQ；优先遵循 CPM-17 核分割子赛道的官方指标。

---

## 相关资源

- [data](https://drive.google.com/drive/folders/1sJ4nmkif6j4s2FOGj8j6i_Ye7z9w0TfA)
- [paper](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6454006/)
- [official](https://drive.google.com/drive/folders/1sJ4nmkif6j4s2FOGj8j6i_Ye7z9w0TfA)

---

## 引用

正式引文请从 [原论文](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6454006/) 获取并导出 BibTeX，不猜测完整作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：挑战训练来源 TCGA，不应未经匹配就视为与其他 TCGA 衍生集完全独立。
4. **核查边界**：CPM 2017 challenge year (not later publication year); current linked Google Drive mirror has not been verified as organizer-owned.
