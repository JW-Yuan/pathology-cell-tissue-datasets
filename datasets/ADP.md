# ADP 数据集详情

## 数据集描述

ADP（Atlas of Digital Pathology）是一个通用的多器官组织学组织类型（Histological Tissue Type, HTT）标注数据集，发表于 CVPR 2019。数据集旨在为基于深度学习的数字病理学研究提供多器官、多组织类型的分层标注基准。

### 核心贡献

- 提出了一套 **57 类层次化 HTT（Histological Tissue Type）** 标注体系
- 覆盖多个器官的大规模 patch 级标注数据集
- 支持**多标签分类**和**分层分类**任务

## 数据集基本信息

- **器官类型**：多器官（multiple）—— 来自 100 个 WSI，涵盖多种器官
- **染色方式**：多染色（大多数为 H&E）
- **数据集大小**：
  - 训练集：14,134 张 patch
  - 验证集：1,767 张 patch
  - 测试集：1,767 张 patch
  - 总计：约 17,668 张（来自 100 个 WSI）
- **图像分辨率**：1088 × 1088 像素（patch 大小）
- **放大倍数**：40x — Huron TissueScope LE1.2 扫描仪
- **标注类型**：57 种 HTT 的层次化多标签分类

## 标注体系

### HTT 层次结构（3 级）

```
Level 1 (大类, 约 8 类)
├── Level 2 (中类, 约 20 类)
│   └── Level 3 (细粒度, 约 57 类)
```

- **Level 1 示例**：Epithelium（上皮）、Connective Tissue（结缔组织）、Muscle（肌肉）等
- **Level 2 示例**：Glandular Epithelium（腺上皮）、Squamous Epithelium（鳞状上皮）等
- **Level 3**：57 种具体的组织学组织类型，每张 patch 可标注多个类别（多标签）

### 标注数量

| 层级 | 类别数 |
|------|--------|
| Level 1 | 8 |
| Level 2 | 20 |
| Level 3 | 57 |

## 数据集划分

| 子集 | Patch 数量 |
|------|-----------|
| 训练集 | 14,134 |
| 验证集 | 1,767 |
| 测试集 | 1,767 |
| **合计** | **~17,668** |

## 数据特点

### 多标签分层分类
- 每张 patch 可能同时含有多种组织类型（多标签）
- 标注具有层次结构，支持层次化分类算法的评估

### 大规模多器官覆盖
- 来自 100 个不同器官的 WSI
- 涵盖组织学中常见的主要组织类型

### 高分辨率
- 1088×1088 px 的 patch 尺寸，信息量丰富
- 40x 高倍放大，细节清晰

## 使用建议

### 数据加载

```python
import os
import json
import numpy as np
from PIL import Image

# 加载 ADP 数据集
# 假设标注以 JSON 格式存储
with open('adp_labels.json', 'r') as f:
    labels = json.load(f)

# 示例结构：
# {
#   "image_id": "patch_001.png",
#   "htts_l1": [1, 3],        # Level 1 HTT 标签索引
#   "htts_l2": [2, 7, 12],    # Level 2 HTT 标签索引
#   "htts_l3": [5, 18, 33]    # Level 3 HTT 标签索引
# }

img = Image.open(os.path.join('adp_images', labels['image_id']))
img_array = np.array(img)  # (1088, 1088, 3)
```

### 评估指标

```python
# 多标签分类常用指标
from sklearn.metrics import f1_score, average_precision_score

# 宏平均 F1（按类别平均）
f1_macro = f1_score(y_true, y_pred, average='macro')

# 加权 F1
f1_weighted = f1_score(y_true, y_pred, average='weighted')

# mAP（平均精度均值）
mAP = average_precision_score(y_true, y_scores, average='macro')
```

### 层次化分类建议
- 可使用**层次化 softmax** 或**条件随机场**利用标签间的层次依赖关系
- 上层标签可作为下层标签的约束条件

## 相关资源

- [官方项目页](https://www.dsp.utoronto.ca/projects/ADP/)
- [GitHub 代码](https://github.com/mahdihosseini/ADP)
- [论文（CVPR 2019）](https://openaccess.thecvf.com/content_CVPR_2019/papers/Hosseini_Atlas_of_Digital_Pathology_A_Generalized_Hierarchical_Histological_Tissue_Type-Annotated_CVPR_2019_paper.pdf)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@inproceedings{hosseini2019atlas,
  title={Atlas of digital pathology: A generalized hierarchical histological tissue type-annotated database for deep learning},
  author={Hosseini, Mahdi S and Chan, Lyndon and Tse, Gabriel and Tang, Michael and Deng, Jun and Norouzi, Sajad and Rowsell, Corwyn and Plataniotis, Konstantinos N and Damaskinos, Savvas},
  booktitle={Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition},
  pages={11744--11753},
  year={2019}
}
```

## 注意事项

1. **多标签特性**：一张 patch 可同时含多种组织类型，需使用多标签分类框架（如 Binary Cross-Entropy 损失）。
2. **层次关系利用**：标签的层次结构是该数据集的核心特色，建议充分利用。
3. **数据获取**：数据通过官方项目页和 GitHub 申请获取。
4. **版权声明**：数据使用需遵守相关许可协议，商业用途须联系作者。
