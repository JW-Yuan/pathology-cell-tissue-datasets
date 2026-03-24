# Lizard 数据集详情

## 数据集描述

Lizard 是一个面向**结肠**组织病理学的大规模数据集，提供**细胞核实例分割**与 **6 类细胞核分类**标注。

### 数据来源（论文/官方说明）

图像与标注来自**公开文献与资源**的汇总与再标注（论文中常列出的出处包括 **TCGA**、**PanNuke**、**GlaS**、**DigestPath**、**CoNSeP** 等；部分条目仅采用原图并重标或调整任务定义）。不同子集对应的 **20× / 40×**、是否沿用既有标注、以及病例与 patch 的对应关系，**以论文表格与 Warwick 发布页为准**。

### 第三方 `.npy` 与官方数据

网络上由**其它仓库预处理**得到的 `.npy` 多为**非官方**产物，**不等同**于 Warwick 发布的原始包。若需与论文或评测一致，请从 **Warwick 官方/Kaggle 镜像**重新下载，并以 **PNG 图像 + `.mat` 标注** 为准自行解析或转换；**不要**直接假定第三方 `.npy` 与官方 `inst_map` / `class` 一致。

## 数据集基本信息

- **器官类型**：结肠 (Colon)
- **染色方式**：H&E (Hematoxylin and Eosin)
- **数据集大小**：431,913 个细胞核实例，来自 238 个 .mat 文件
- **图像分辨率**：500-1000 不等（patch 大小）
- **放大倍数**：20x
- **数据来源**：见上文「数据来源」；**TCGA / PanNuke / GlaS / DigestPath / CoNSeP** 等原始资源各自有许可与引用要求，二次发布与组合方式**以 Lizard 论文与 Warwick 为准**。

## 文件结构

```
lizard/
├── Lizard_Images1/
│ └── Lizard_Images1（子文件夹）
│ └── 【若干.png图片文件】（如xxx.png、yyy.png等）
│ ▶ 文件名与Lizard_Labels/Labels中的.mat文件**完全一一对应**
├── Lizard_Images2/
│ └── Lizard_Images2（子文件夹）
│ └── 【若干.png图片文件】（如xxx.png、yyy.png等）
│ ▶ 文件名与Lizard_Labels/Labels中的.mat文件**完全一一对应**
├── Lizard_Labels/
│ ├── Labels（子文件夹）
│ │ └── 【若干.mat标注文件】（如xxx.mat、yyy.mat等）
│ │ ▶ 核心：每个.mat文件名与Lizard_Images1/Lizard_Images1、Lizard_Images2/Lizard_Images2中的.png文件名**完全一致**
│ │ └── 每个.mat文件的 key 结构（与 `scipy.io.loadmat` 读入后一致）：
│ │ - **header**：`bytes`（MAT 文件头）
│ │ - **version**：`str`（如 `1.0`）
│ │ - **globals**：`list`（常为 `[]`）
│ │ - **inst_map**：`numpy.ndarray`，`(H, W)`，像素值为**实例 ID**；**0 表示背景**（无效实例）
│ │ - **id**：`numpy.ndarray`，`(N, 1)` 或扁平为 N 个实例；**第 i 个实例**的实例 ID（与 `inst_map` 中非零值对应，**通常从 1 起**，与数组下标 0…N-1 不同）
│ │ - **class**：`numpy.ndarray`，`(N, 1)`，与 `id` **按行对齐**，每个实例一个 **1–6** 的类别编号（Python 中键名为 `'class'`）
│ │ - **bbox**：`numpy.ndarray`，`(N, 4)`，边界框（常见为左上–右下等绝对坐标，具体顺序以官方脚本为准）
│ │ - **centroid**：`numpy.ndarray`，`(N, 2)`，实例中心 **(x, y)** 绝对坐标
│ ├── info.csv（文件）
│ └── read_label.py（文件）
│ └── README.md（文件）
└── Overlay/
```

## 标注格式

### .mat 文件结构

每个 `.mat` 文件包含以下字段：

- **inst_map**：numpy.ndarray，形状为 `(图像高, 图像宽)`
  - 每个像素值对应实例ID（0 不视为有效实例ID）
  - 相同ID的像素属于同一个细胞核实例

- **id**：numpy.ndarray，形状为 `(实例数量, 1)`（或 `N`）
  - 与 `inst_map` 中**非零像素值**一致的实例编号；**数组下标**为 0…N-1，对应第 1…N 个实例。

- **class**：numpy.ndarray，形状为 `(实例数量, 1)`
  - 与 `id` **逐行对应**；每个元素为 **1–6** 的类别编号（Python 读取键为 `'class'`；注意 MATLAB 关键字在部分工具中的转义）。

- **bbox**：numpy.ndarray，形状为 `(实例数量, 4)`
  - 每个元素为对应实例ID的边界框（左上右下绝对值坐标）

- **centroid**：numpy.ndarray，形状为 `(实例数量, 2)`
  - 每个元素为对应实例ID的中心坐标（xy绝对值坐标）

### 类别 ID 与生物学含义（`class` ∈ {1,…,6}）

`class` 仅取 **1–6**，表示六个**细胞核类别**（以下为常见英文与中文对照，便于检索）：

| 语义（非 ID 顺序） | 英文 | 中文 |
|-------------------|------|------|
| 上皮 | Epithelial | 上皮细胞 / 上皮来源 |
| 淋巴细胞 | Lymphocyte | 淋巴细胞 |
| 浆细胞 | Plasma | 浆细胞（非「血浆」） |
| 中性粒 | Neutrophil | 中性粒细胞 |
| 嗜酸性粒 | Eosinophil | 嗜酸性粒细胞 |
| 结缔组织 | Connective | 结缔组织相关细胞 |

**与 mat 中整数 `class` 的对应关系**：官方 README / 论文补充材料中应对 **1→…、2→…** 有明确说明；若仅看到「六个类别」而未写清编号，**不可**自行按上表顺序假定 1=Epithelial。下面给出 **社区实现与 HoVer-Net 等管线中常见**的映射，**使用前请用官方发布的 `read_label.py` 或论文 Table 复核**：

```python
# 常见约定（务必与官方脚本核对）
cls_id_to_name = {
    1: "neutrophil",      # 中性粒细胞
    2: "epithelial",      # 上皮
    3: "lymphocyte",      # 淋巴细胞
    4: "plasma",          # 浆细胞
    5: "eosinophil",      # 嗜酸性粒细胞
    6: "connective"       # 结缔组织
}
```

若论文与代码不一致，**以数据集作者提供的代码为准**。

## 标注情况

### 标注统计

- **总细胞核实例数**：431,913 个
- **总 .mat 文件数**：238 个
- **标注完成度**：100%（所有图像均已完成标注）

### 细胞核类别统计

| 细胞核类型 | 数量 | 比例 |
|----------|------|------|
| **epithelial** (上皮细胞) | 210,372 | 48.71% |
| **lymphocyte** (淋巴细胞) | 92,238 | 21.36% |
| **connective** (结缔组织细胞) | 97,347 | 22.54% |
| **plasma** (浆细胞) | 24,861 | 5.76% |
| **neutrophil** (嗜中性粒细胞) | 4,116 | 0.95% |
| **eosinophil** (嗜酸性粒细胞) | 2,979 | 0.69% |
| **总计** | **431,913** | **100.00%** |

**注**：根据原始统计，不同统计可能有轻微差异：
- 另一种统计显示：epithelial 244,563 (49.39%), lymphocyte 101,413 (20.48%), connective 112,309 (22.68%), plasma 28,466 (5.75%), neutrophil 4,824 (0.97%), eosinophil 3,604 (0.73%)

## 数据特点

### 多数据集整合

数据集整合了多个公开数据集的图像和标注，提供了统一的标注格式和丰富的样本多样性。

### 实例级标注

数据集提供了详细的实例级标注，包括：
- 实例分割掩码（inst_map）
- 边界框（bbox）
- 中心点坐标（centroid）
- 类别标签（class）

### 类别分布

数据集包含 6 种不同类型的细胞核，其中上皮细胞占主导地位（约 48.71%），淋巴细胞和结缔组织细胞各占约 20% 左右。

## 使用建议

### 数据加载

```python
import scipy.io as sio
import numpy as np

# 加载 .mat 文件
mat_data = sio.loadmat('Lizard_Labels/Labels/xxx.mat')

# 获取实例分割掩码
inst_map = mat_data['inst_map']  # (H, W)

# 获取实例ID列表
instance_ids = mat_data['id'].flatten()  # (N,)

# 获取类别标签
classes = mat_data['class'].flatten()  # (N,)

# 获取边界框
bboxes = mat_data['bbox']  # (N, 4)

# 获取中心点坐标
centroids = mat_data['centroid']  # (N, 2)

# 类别ID到名称的映射
cls_id_to_name = {
    1: "neutrophil",
    2: "epithelial",
    3: "lymphocyte",
    4: "plasma",
    5: "eosinophil",
    6: "connective"
}
```

### 数据预处理

1. **图像归一化**：建议对图像进行标准化处理
2. **类别平衡**：注意不同类别细胞核的数量不平衡问题
3. **实例提取**：从 inst_map 中提取每个实例的掩码和类别

### 模型选择

1. **实例分割**：推荐使用 Mask R-CNN、HoVer-Net、StarDist 等模型
2. **细胞核分类**：可以结合实例分割和分类任务
3. **多任务学习**：可以同时进行分割和分类任务

### 评估指标

- **实例分割**：使用 Dice 系数、IoU、F1-score、PQ (Panoptic Quality)
- **分类任务**：使用准确率、精确率、召回率、F1-score、混淆矩阵

## 相关资源

- [数据集下载](https://warwick.ac.uk/fac/cross_fac/tia/data/lizard/)
- [Kaggle 数据集](https://www.kaggle.com/datasets/aadimator/lizard-dataset)
- [论文链接](https://arxiv.org/pdf/2108.11195.pdf)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{lizard2021,
  title={Lizard: A Large-Scale Dataset for Colonic Nuclear Instance Segmentation and Classification},
  author={Graham, Simon and Jahanifar, Mostafa and Azam, Ayesha and Nimir, Mohammed and Tsang, Yee-Wah and Dodd, Kevin and Hero, Emma and Sahota, Harvir and Tank, Akshay and Benes, Ksenija and others},
  journal={arXiv preprint arXiv:2108.11195},
  year={2021}
}
```

## 注意事项

1. **数据使用许可**：请遵守数据集的使用许可协议。
2. **数据格式**：标注为 MATLAB **`.mat`**；使用 `scipy.io.loadmat` 等加载；**勿**将第三方 `.npy` 当作官方发布。
3. **类别不平衡**：不同类别细胞核数量差异较大，建议使用适当的采样策略或损失函数。
4. **数据来源与许可**：见上文「数据来源」；**TCGA、PanNuke、GlaS** 等各原始提供方均有独立使用条款，请一并遵守。
5. **类别编号**：`class` 为 1–6 时，**具体数字对应哪一类**须以官方 README / `read_label.py` / 论文为准；与其它项目的标签混用前须**单独建立映射**，勿假设通道或 ID 通用。
