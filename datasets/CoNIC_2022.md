# CoNIC 2022 数据集详情

## 数据集描述

CoNIC（Colon Nuclei Identification and Counting Challenge 2022）是一个以结肠组织中**细胞核实例分割、分类和计数**为核心任务的挑战赛数据集。数据集是目前已知规模最大的结肠细胞核实例分割与分类公开数据集，包含超过 53.5 万个独立细胞核。

### 数据来源

CoNIC 2022 数据集是 **Lizard 数据集**的扩展版本，在其基础上增加了更多图像和更细化的任务设置（增加了细胞核计数回归任务）。图像来自结肠组织切片，汇集了多个公开数据源的图像并重新标注。

## 数据集基本信息

- **器官类型**：结肠 (Colon)
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：4,981 个 patch，包含 431,913+ 个细胞核（6 类）
- **图像分辨率**：256 × 256 像素
- **放大倍数**：20x
- **任务类型**：分割（seg）+ 分类（classi）+ 细胞数量回归（reg）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| Patch 总数 | 4,981 |
| 细胞核实例总数 | >431,913 |
| 细胞核类别数 | 6 |
| Patch 尺寸 | 256 × 256 px |

## 细胞核类别统计

| 类别 | 英文 | 中文 | 比例 |
|------|------|------|------|
| 1 | Neutrophil | 中性粒细胞 | — |
| 2 | Epithelial | 上皮细胞 | — |
| 3 | Lymphocyte | 淋巴细胞 | — |
| 4 | Plasma | 浆细胞 | — |
| 5 | Eosinophil | 嗜酸性粒细胞 | — |
| 6 | Connective | 结缔组织细胞 | — |

（具体比例与 Lizard 数据集相近，以官方发布数据为准）

## 任务定义

CoNIC 2022 包含**两个子任务**：

### Task 1：细胞核分割与分类（Segmentation + Classification）

- 输入：256×256 的 H&E 图像
- 输出：
  - **实例分割掩码（inst_map）**：像素值为实例 ID
  - **类别掩码（class_map）**：像素值为 1–6 的细胞核类别

### Task 2：细胞核计数（Cell Counting/Regression）

- 输入：256×256 的 H&E 图像
- 输出：每种类别的细胞核数量（6 维回归向量）

## 标注格式

### 数据文件结构

```
conic_data/
├── images/       # 图像文件 (.png) 256x256 RGB
└── masks/        # 标注掩码 (.png) 256x256
    ├── inst_map  # 实例 ID 掩码 (16位或32位整数)
    └── class_map # 类别掩码 (8位整数, 1-6)
```

### 掩码说明

```python
import numpy as np
from PIL import Image

# 加载实例分割掩码
inst_mask = np.array(Image.open('mask_inst.png'))  # 每个像素为实例 ID，0 为背景
# 加载类别掩码
class_mask = np.array(Image.open('mask_class.png'))  # 像素值: 0=背景, 1-6=细胞核类别

# 提取单个实例
instance_ids = np.unique(inst_mask)
instance_ids = instance_ids[instance_ids != 0]  # 去除背景

# 获取实例的类别
for inst_id in instance_ids:
    inst_pixels = (inst_mask == inst_id)
    class_id = class_mask[inst_pixels][0]  # 同一实例像素类别相同
```

## 数据特点

### Lizard 超集
- CoNIC 数据集是 Lizard 的扩展，标注质量高，已被广泛验证
- 提供了目前最大规模的结肠细胞核分割标注

### 三合一任务
- 同时评估分割、分类和计数，全面衡量算法性能
- 计数任务不依赖实例分割，可单独研究

### 高密度标注
- 256×256 patch 内平均含约 87 个细胞核
- 细胞核密集，粘连和重叠现象普遍

## 使用建议

### 数据加载

```python
import numpy as np
from PIL import Image
import os

def load_conic_sample(img_path, inst_path, class_path):
    """加载一个 CoNIC 样本"""
    img = np.array(Image.open(img_path).convert('RGB'))          # (256, 256, 3)
    inst_map = np.array(Image.open(inst_path).convert('I'))      # (256, 256) int32
    class_map = np.array(Image.open(class_path).convert('L'))    # (256, 256) uint8
    return img, inst_map, class_map

def count_cells(class_map, inst_map):
    """统计每类细胞核数量"""
    counts = {}
    class_names = {1: 'neutrophil', 2: 'epithelial', 3: 'lymphocyte',
                   4: 'plasma', 5: 'eosinophil', 6: 'connective'}
    
    inst_ids = np.unique(inst_map)
    inst_ids = inst_ids[inst_ids != 0]
    
    for inst_id in inst_ids:
        pixels = inst_map == inst_id
        cls = class_map[pixels][0]
        if cls in class_names:
            counts[class_names[cls]] = counts.get(class_names[cls], 0) + 1
    
    return counts
```

### 评估指标

```python
# 官方评估指标
# Task 1: mPQ+ (multi-class Panoptic Quality)
# Task 2: R² (R-squared, 回归系数)

# mPQ+ 计算（简化版）
def compute_pq(pred_inst, pred_class, gt_inst, gt_class, num_classes=6):
    """计算 Panoptic Quality (PQ) per class"""
    pqs = []
    for c in range(1, num_classes + 1):
        pred_c = pred_inst * (pred_class == c)
        gt_c = gt_inst * (gt_class == c)
        # ... IoU 匹配计算 TP/FP/FN
        # PQ = SQ * RQ = (sum_IoU / TP) * (TP / (TP + 0.5*FP + 0.5*FN))
    return np.mean(pqs)  # mPQ+
```

## 相关资源

- [Grand Challenge 官方页](https://conic-challenge.grand-challenge.org/)
- [GitHub 代码](https://github.com/TissueImageAnalytics/CoNIC)
- [论文（arXiv 2021）](https://arxiv.org/pdf/2111.14485.pdf)
- [挑战赛结果论文（MedIA 2024）](https://www.sciencedirect.com/science/article/pii/S1361841523003079)
- [Google Drive 下载](https://drive.google.com/drive/folders/1il9jG7uA4-ebQ_lNmXbbF2eOK9uNwheb)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{conic2022,
  title={CoNIC: Colon Nuclei Identification and Counting Challenge 2022},
  author={Graham, Simon and others},
  journal={arXiv preprint arXiv:2111.14485},
  year={2021}
}

@article{conic_challenge2024,
  title={CoNIC Challenge: Pushing the frontiers of nuclear detection, segmentation, classification and counting},
  author={Graham, Simon and others},
  journal={Medical Image Analysis},
  year={2024}
}
```

## 注意事项

1. **与 Lizard 的关系**：CoNIC 数据是 Lizard 的子集/扩展，两者标注体系一致，可互相参考。
2. **掩码格式注意**：实例掩码可能需要 16 位或 32 位图像格式存储，加载时需确认位深度。
3. **类别编号**：类别 1–6 的具体对应关系以官方 GitHub 代码为准，不可自行假定。
4. **mPQ+ 指标**：官方主要评估指标为 mPQ+，不同于普通 Dice 或 IoU，需使用官方评估脚本。
