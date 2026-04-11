# SegLungTCGA 数据集详情

## 数据集描述

SegLungTCGA 是一个来自 TCGA 的**肺癌 WSI 分割**数据集，提供从 WSI 中分割出的肺组织图像块及文件映射信息，用于肺癌组织学分析和分割研究。

### 数据来源

图像从 **TCGA（The Cancer Genome Atlas）**肺腺癌（LUAD）和肺鳞状细胞癌（LUSC）数据集中筛选和预处理而来，由 GitHub 仓库 `animgoeth/SegLungTCGA` 维护。

## 数据集基本信息

- **器官类型**：肺（Lung）— 肺癌（LUAD/LUSC）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：454 张图像 + 文件映射信息（mapping info）
- **图像类型**：从 WSI 中分割出的 87×87 像素 patch 集合
- **数据来源**：TCGA（LUAD + LUSC）
- **任务类型**：分割（Lung Tissue Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 图像/样本总数 | 454 |
| 图像类型 | 87×87 px patches |
| 肺癌亚型 | LUAD + LUSC |
| 文件映射 | 提供 TCGA 文件 ID 映射 |

## 数据特点

### TCGA 来源
- 图像来自 TCGA 公开数据集
- 附带文件映射信息，可溯源至具体 TCGA 患者和 WSI

### 小 Patch 格式
- 87×87 px 的小尺寸 patch，计算需求低
- 适合快速原型验证和小样本研究

### 肺癌两大亚型
- 涵盖肺腺癌（LUAD）和肺鳞状细胞癌（LUSC）两种最常见的非小细胞肺癌亚型
- 两种亚型的组织学形态差异明显，可用于分型研究

## 肺癌组织学特征

| 亚型 | 简称 | 主要组织学特征 |
|------|------|--------------|
| 肺腺癌 | LUAD | 腺体结构（腺泡、乳头状、微乳头状）、黏液产生 |
| 肺鳞状细胞癌 | LUSC | 角化珠、细胞间桥、鳞状分化 |

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
import pandas as pd
import glob

def load_seglungtcga(root_dir):
    """加载 SegLungTCGA 数据集"""
    # 加载文件映射信息
    mapping_file = os.path.join(root_dir, 'file_mapping.csv')
    if os.path.exists(mapping_file):
        mapping = pd.read_csv(mapping_file)
    
    # 加载所有 patch
    img_paths = sorted(glob.glob(os.path.join(root_dir, 'patches', '*.png')))
    
    dataset = []
    for img_path in img_paths:
        img = np.array(Image.open(img_path).convert('RGB'))  # (87, 87, 3)
        dataset.append({
            'image': img,
            'path': img_path
        })
    
    return dataset

# 肺癌亚型标签（通过 TCGA 映射获取）
LUNG_TYPES = {
    'LUAD': 0,  # 肺腺癌
    'LUSC': 1   # 肺鳞状细胞癌
}
```

### 分类任务示例（LUAD vs LUSC）

```python
import torch
import torchvision.transforms as transforms
from torchvision import models

# 数据预处理（适应小尺寸 87x87 patch）
transform = transforms.Compose([
    transforms.Resize(224),  # 调整为标准分类网络输入大小
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# 使用预训练 ResNet 进行二分类（LUAD vs LUSC）
model = models.resnet50(pretrained=True)
model.fc = torch.nn.Linear(2048, 2)
```

### 评估指标

```python
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

def evaluate_lung_classification(y_true, y_pred, y_scores):
    return {
        'Accuracy': accuracy_score(y_true, y_pred),
        'F1': f1_score(y_true, y_pred, average='binary'),
        'AUC': roc_auc_score(y_true, y_scores[:, 1])
    }
```

## 相关资源

- [GitHub 代码与数据](https://github.com/animgoeth/SegLungTCGA)
- [论文（BMC Cancer 2022）](https://bmccancer.biomedcentral.com/articles/10.1186/s12885-022-10081-w)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{seglungtcga2022,
  title={Segmentation and classification of lung cancer histology in digitized whole-slide images},
  journal={BMC Cancer},
  year={2022},
  url={https://bmccancer.biomedcentral.com/articles/10.1186/s12885-022-10081-w}
}
```

## 注意事项

1. **TCGA 使用协议**：数据来源于 TCGA，使用时遵守 TCGA 数据使用协议（dbGaP）。
2. **小尺寸限制**：87×87 px 的 patch 尺寸非常小，直接用于大多数模型时需进行 resize 处理。
3. **文件映射**：提供的文件映射信息可帮助将 patch 关联回原始 TCGA WSI，便于获取更多患者信息。
4. **数据规模**：454 张图像规模较小，适合快速验证或迁移学习的目标域。
