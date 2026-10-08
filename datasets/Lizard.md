# Lizard 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Lizard 是结肠细胞核大规模实例分割与六类别核分类数据，整合多个公开结肠图像来源并重注释，用于稠密细胞核 panoptic 分割。

### 相关论文与发布方

- [官方/第一方来源](https://warwick.ac.uk/fac/cross_fac/tia/data/lizard/)
- [原论文](https://arxiv.org/pdf/2108.11195.pdf)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2021 |
| **器官/组织或物种** | Colon |
| **染色及模态** | H&E |
| **具体任务** | seg、classi |
| **图像单元与尺寸** | patch |
| **标注内容** | images + instance seg mask |
| **扫描/附加条件** | 20x (DigestPath + CRAG + GlaS + PanNuke + CoNSeP + TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 431,913 nuclei (6 classes: epithelial 48.71%, lymphocyte 21.36%, connective 22.54%, plasma 5.76%, neutrophil 0.95%, eosinophil 0.69%), 238 .mat files |
| **格式/数据形态** | 结肠 H&E 图像与 `.mat` 格式逐核 instance/type 标签；多源图像切成 patch 用于训练 |
| **采集与版本** | 431,913 个核、6 类；论文与整理包中可见 238 个 `.mat` 注释文件，不等于 238 个独立患者。 |

---

## 任务与标注

提供核像素实例 ID 和每实例六分类表型；需根据 `.mat` 文件结构中 type map/inst map 的具体键读入。

### 类别与标签语义

- Epithelial（上皮）
- Lymphocyte（淋巴）
- Connective（结缔组织）
- Plasma（浆细胞）
- Neutrophil（中性粒细胞）
- Eosinophil（嗜酸性粒细胞）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

多个源数据集合并重新标注，应该采用官方基准 split，并记录训练图像原始来源；CoNIC 重用相关 Lizard 图像。

---

## 文件组成与读取方式

- 结肠 H&E 源图像/切块
- MATLAB `.mat` 核实例和类别标签
- 类别/来源元数据，若发布包提供

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

- 使用 scipy.io.loadmat；先核对 ID、类别编码、补丁原点，再裁剪图像或拼接。

### 建模与数据泄漏风险

- 不能仅写 `seg`：六种核类别是标注核心；CoNIC 和 Lizard 不能直接互相作独立外测。

### 评估指标

mPQ、多类 F1、PQ/Dice；保证 instance ID 与 type map 一致。

---

## 相关资源

- [data](https://warwick.ac.uk/fac/cross_fac/tia/data/lizard/)
- [paper](https://arxiv.org/pdf/2108.11195.pdf)
- [download](https://www.kaggle.com/datasets/aadimator/lizard-dataset)
- [official](https://warwick.ac.uk/fac/cross_fac/tia/data/lizard/)

---

## 引用

请从 [出版社/原论文](https://arxiv.org/pdf/2108.11195.pdf) 导出 BibTeX；不编写未经证实的作者或卷号。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 CoNIC 2022 大量数据重叠，并整合 CRAG/GlaS/CoNSeP 等源图像。
4. **核查边界**：Warwick Lizard官方发布页
