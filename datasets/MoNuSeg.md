# MoNuSeg 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

MoNuSeg 2018 是多器官 H&E 图像核实例分割挑战，训练中包含 7 个器官的高倍图，测试包含额外器官场景，面向跨癌种泛化。

### 相关论文与发布方

- [官方/第一方来源](https://monuseg.grand-challenge.org/Data/)
- [原论文](https://ieeexplore.ieee.org/document/8880654)
- [源码/组织者仓库](https://github.com/ruchikaverma-iitg/MoNuSeg)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2018 |
| **器官/组织或物种** | multiple (7) |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | Patch (1000x1000) |
| **标注内容** | images (Train: 22.000 nuclei, Test: 7000) + masks |
| **扫描/附加条件** | 40x (from TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 30, Test: 14 |
| **格式/数据形态** | 1000×1000 H&E RGB patches + 专家逐核多边形/实例分割真值 |
| **采集与版本** | 训练 30 张 21,623 个核，测试 14 张 7,223 个核；总 44 张、约 28,846 个核。 |

---

## 任务与标注

每个核的轮廓/实例标注，原始赛道没有多表型核分类标签；缺失标注/忽略样本遵循官方说明。

### 类别与标签语义

- Nucleus（单类核实例）
- Background（背景）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

训练 30（Breast/Liver/Kidney/Prostate/Bladder/Colon/Stomach），测试 14（还含 Lung、Brain 等与训练不完全重叠的器官）。

---

## 文件组成与读取方式

- `*.tif` 1000×1000 H&E images
- 与图像对应的 instance segmentation contour annotation（XML / mask，视发布包）

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

- 从 XML 勾画核轮廓得到实例 GT；测试标签可用性按挑战阶段核实。

### 建模与数据泄漏风险

- 核类型分类不可凭背景值推断；和 Kumar 2017 的同源图像关系要显式处理。

### 评估指标

AJI（challenge 核心）、Dice、instance PQ 等。

---

## 相关资源

- [data](https://monuseg.grand-challenge.org/Data/)
- [github](https://github.com/ruchikaverma-iitg/MoNuSeg)
- [paper](https://ieeexplore.ieee.org/document/8880654)
- [download](https://monuseg.grand-challenge.org/Data/)
- [official](https://monuseg.grand-challenge.org/Data/)

---

## 引用

请从 [出版社/原论文](https://ieeexplore.ieee.org/document/8880654) 导出 BibTeX；不编写未经证实的作者或卷号。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：Kumar 2017 的原始图像/训练集与后续 MoNuSeg 存在样本重用。
4. **核查边界**：MoNuSeg官方数据页
