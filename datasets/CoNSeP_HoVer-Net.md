# CoNSeP 数据集详情

## 数据集描述

CoNSeP（Colorectal Nuclear Segmentation and Phenotypes）是一个专用于**结直肠腺癌**组织病理学图像中**细胞核实例分割与分类**的数据集，随 HoVer-Net（Hover-map for Nuclei Segmentation）论文一同发布（2019）。

### 数据来源

图像来自英国华威大学附属医院（UHCW, University Hospitals Coventry and Warwickshire），采用 40× 放大倍数的结直肠腺癌 H&E 切片。

## 数据集基本信息

- **器官类型**：结直肠腺癌（Colorectal Adenocarcinoma）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：27 张图像
  - 测试集：14 张图像
  - 共含 24,319 个细胞核实例
- **图像分辨率**：1000 × 1000 像素
- **放大倍数**：40x
- **数据来源**：UHCW（University Hospitals Coventry and Warwickshire）
- **任务类型**：分割（seg）+ 分类（classi）

## 数据集规模

| 子集 | 图像数 | 细胞核数 |
|------|--------|---------|
| 训练集 | 27 | ~17,000 |
| 测试集 | 14 | ~7,319 |
| **合计** | **41** | **~24,319** |

## 细胞核类别

CoNSeP 提供 **4 大类**细胞核分类（原始标注为 7 类，常被合并为 4 类使用）：

### 原始 7 类（论文定义）

| 类别 | 英文 | 说明 |
|------|------|------|
| 1 | Other | 其他细胞 |
| 2 | Inflammatory | 炎症细胞（含淋巴细胞、中性粒细胞等） |
| 3 | Connective | 结缔组织细胞（含成纤维细胞等） |
| 4 | Dead | 死亡细胞（凋亡体等） |
| 5 | Epithelial | 上皮细胞（非肿瘤） |
| 6 | Epithelial（malignant） | 上皮细胞（肿瘤性） |
| 7 | Epithelial（malignant）| 上皮细胞变体 |

### HoVer-Net 合并为 4 类（常用设定）

| 合并后类别 | 包含原始类别 | 说明 |
|----------|------------|------|
| 1 | Other (1) | 其他 |
| 2 | Inflammatory (2) | 炎症细胞 |
| 3 | Connective/Soft-tissue (3) | 结缔组织 |
| 4 | Dead (4) | 死亡细胞 |
| 5 | Epithelial (5+6+7) | 上皮细胞（良恶性合并） |

> **注意**：实际使用中常见 4 类合并方案，具体以 HoVer-Net 官方代码为准。

## 标注格式

### MATLAB `.mat` 文件

每张图像对应一个 `.mat` 文件，包含以下字段：

```python
import scipy.io as sio

mat = sio.loadmat('train/Images/train_1.mat')
# 字段:
# - inst_map:   (H, W) 实例 ID 掩码，0 为背景
# - type_map:   (H, W) 细胞核类别掩码（1-7）
# - inst_type:  (N, 1) 每个实例对应的类别 ID
# - inst_centroid: (N, 2) 每个实例的中心坐标 (x, y)
```

### 文件结构

```
consep/
├── Train/
│   ├── Images/    # 训练图像 (.png)
│   └── Labels/    # 标注文件 (.mat)
└── Test/
    ├── Images/    # 测试图像 (.png)
    └── Labels/    # 标注文件 (.mat)
```

## 数据特点

### HoVer-Net 配套数据集
- 专为 HoVer-Net 模型设计，标注细致且质量高
- 是细胞核分割领域最常用的基准数据集之一

### 实例级精确标注
- 每个细胞核都有独立的实例 ID 和类别标签
- 提供中心点坐标，支持检测任务评估

### 结直肠腺癌
- 结直肠腺癌的组织学特征（腺体结构、肿瘤间质）在该数据集中有充分体现

## 使用建议

### 数据加载

```python
import scipy.io as sio
import numpy as np
from PIL import Image

# 加载图像
img = np.array(Image.open('Train/Images/train_1.png').convert('RGB'))

# 加载标注
mat = sio.loadmat('Train/Labels/train_1.mat')
inst_map = mat['inst_map']        # (H, W) 实例 ID
type_map = mat['type_map']        # (H, W) 类别 ID（1-7）
inst_type = mat['inst_type']      # (N, 1)
inst_centroid = mat['inst_centroid']  # (N, 2)

# 合并为 4 类 + 1 (epithelial=5,6,7 -> 5)
MERGE_MAP = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 5}
merged_type_map = np.vectorize(lambda x: MERGE_MAP.get(x, 0))(type_map)
```

### 评估指标

```python
# HoVer-Net 官方使用以下指标
# 1. Dice (binary segmentation)
# 2. AJI (Aggregated Jaccard Index) - 实例级分割
# 3. DQ, SQ, PQ (Detection Quality, Segmentation Quality, Panoptic Quality)

def compute_aji(pred_instances, gt_instances):
    """
    Aggregated Jaccard Index (AJI)
    一种综合考虑分割质量和实例匹配的指标
    """
    pass  # 详见 HoVer-Net 官方代码
```

## 相关资源

- [数据集下载（Warwick TIA）](https://warwick.ac.uk/fac/cross_fac/tia/data/hovernet/)
- [论文（MedIA 2019）](https://www.sciencedirect.com/science/article/abs/pii/S1361841519301045?via%3Dihub)
- [OpenDataLab 下载](https://opendatalab.com/OpenDataLab/CoNSeP/tree/main)
- [HoVer-Net 代码](https://github.com/vqdang/hover_net)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{graham2019hover,
  title={Hover-net: Simultaneous segmentation and classification of nuclei in multi-tissue histology images},
  author={Graham, Simon and Vu, Quoc Dang and Raza, Shan E Ahmed and Azam, Ayesha and Tsang, Yee Wah and Kwak, Jin Tae and Rajpoot, Nasir},
  journal={Medical Image Analysis},
  volume={58},
  pages={101563},
  year={2019},
  publisher={Elsevier}
}
```

## 注意事项

1. **类别合并**：原始 7 类标注在多数论文中被合并为 4–5 类，使用前需确认合并策略。
2. **与 Lizard 的关联**：Lizard 数据集部分来源于 CoNSeP，标注体系相似但有调整。
3. **HoVer-Net 基准**：该数据集是 HoVer-Net 的官方基准，建议参考 HoVer-Net 代码进行数据处理。
4. **数据许可**：使用时遵守 Warwick TIA 的数据使用协议。
