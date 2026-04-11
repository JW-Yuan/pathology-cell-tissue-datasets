# BACH - ICIA2018 数据集详情

## 数据集描述

BACH（Breast Cancer Histology，ICIAR 2018 挑战赛）是一个乳腺癌组织病理学数据集，发布于 ICIAR 2018（International Conference on Image Analysis and Recognition）挑战赛。数据集同时支持**图像级分类**（Task A）和**像素级语义分割**（Task B）两个子任务。

### 发布机构

由葡萄牙 **Ipatimup**（病理学与肿瘤免疫学研究所）和 **INEB**（生物医学工程研究所）联合构建。

## 数据集基本信息

- **器官类型**：乳腺 (Breast)
- **染色方式**：H&E（苏木精-伊红）
- **扫描设备**：Leica SCN400
- **任务类型**：分类（classi）+ 语义分割（seg）

## 数据集划分与规模

### Task A — 图像级分类（显微镜图像）

| 类别 | 数量 | 说明 |
|------|------|------|
| Normal（正常） | 100 | 正常乳腺组织 |
| Benign（良性） | 100 | 良性病变 |
| In Situ Carcinoma（原位癌） | 100 | 导管原位癌 (DCIS) |
| Invasive Carcinoma（浸润性癌） | 100 | 浸润性乳腺癌 |
| **合计（标注）** | **400** | 2048×1536 px |
| Unlabeled（无标注，额外测试） | 20 | — |

### Task B — 像素级分割（WSI）

| 子集 | 数量 | 说明 |
|------|------|------|
| 标注 WSI | 10 | 同一 4 类标签的像素级标注 |
| 无标注 WSI | 20 | 用于半监督研究 |

## 类别说明

| 类别 | 病理描述 | 标签编号 |
|------|---------|---------|
| Normal | 正常乳腺组织，腺体结构正常 | 0 |
| Benign | 良性病变（如纤维腺瘤），无恶性特征 | 1 |
| In Situ Carcinoma | 癌细胞局限于导管/小叶内，未突破基底膜 | 2 |
| Invasive Carcinoma | 癌细胞突破基底膜，侵入周围间质 | 3 |

## 标注格式

### Task A
- 标注以**目录分类**形式提供：每个类别一个文件夹，文件夹内为对应的 `.tif` 图像文件

### Task B
- **像素级 PNG 掩码**：与 WSI 对应的语义分割掩码，每个像素标注为 4 类之一

## 数据特点

### 4 类分层诊断
- 覆盖从正常到恶性的完整乳腺癌进展谱系
- 4 类分类映射了临床中最常见的乳腺组织诊断结论

### 双任务设计
- Task A（分类）可直接用于 patch 级或图像级分类模型
- Task B（分割）适合训练像素级语义分割模型

### 高分辨率图像
- 2048×1536 px 的高分辨率显微镜图像，细节丰富

## 使用建议

### Task A 数据加载

```python
import os
from PIL import Image
import numpy as np

CLASS_NAMES = ['Normal', 'Benign', 'InSitu', 'Invasive']
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASS_NAMES)}

def load_dataset(root_dir):
    images, labels = [], []
    for class_name in CLASS_NAMES:
        class_dir = os.path.join(root_dir, class_name)
        for fname in os.listdir(class_dir):
            if fname.endswith('.tif'):
                img_path = os.path.join(class_dir, fname)
                images.append(img_path)
                labels.append(CLASS_TO_IDX[class_name])
    return images, labels
```

### Task B 数据加载

```python
import openslide

# 加载 WSI
wsi = openslide.OpenSlide('wsi_sample.svs')

# 加载对应掩码
from PIL import Image
mask = Image.open('wsi_sample_mask.png')
mask_array = np.array(mask)
# 像素值: 0=Normal, 1=Benign, 2=InSitu, 3=Invasive
```

### 评估指标

```python
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

# Task A - 分类指标
acc = accuracy_score(y_true, y_pred)
f1 = f1_score(y_true, y_pred, average='weighted')
cm = confusion_matrix(y_true, y_pred)

# Task B - 分割指标（Dice / IoU per class）
def iou_per_class(pred, gt, num_classes=4):
    ious = []
    for c in range(num_classes):
        intersection = ((pred == c) & (gt == c)).sum()
        union = ((pred == c) | (gt == c)).sum()
        ious.append(intersection / (union + 1e-8))
    return ious
```

## 相关资源

- [Grand Challenge 官方页](https://iciar2018-challenge.grand-challenge.org/Dataset/)
- [论文（MedIA 2019）](https://www.sciencedirect.com/science/article/abs/pii/S1361841518307941)
- [arXiv 版本](https://arxiv.org/abs/1808.04277)
- [Zenodo 数据下载](https://zenodo.org/records/3632035)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{aresta2019bach,
  title={BACH: Grand challenge on breast cancer histology images},
  author={Aresta, Guilherme and Ara{\'u}jo, Teresa and Kwok, Scotty and Chennamsetty, Sai Saketh and Safwan, Mohammed and Alex, Varghese and Marami, Bahram and Prastawa, Marcel and Chan, Monica and Donovan, Michael and others},
  journal={Medical Image Analysis},
  volume={56},
  pages={122--139},
  year={2019},
  publisher={Elsevier}
}
```

## 注意事项

1. **双任务设计**：Task A 和 Task B 面向不同粒度的分析，请按需使用。
2. **数据下载**：可通过 Zenodo 直接下载（zenodo.org/records/3632035）。
3. **类别平衡**：Task A 四类各 100 张，完全平衡，适合直接训练分类器。
4. **WSI 分割复杂性**：Task B 的 WSI 图像较大，建议切分为 patch 后训练分割模型。
