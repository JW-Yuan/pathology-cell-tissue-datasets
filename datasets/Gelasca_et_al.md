# Gelasca et al. 数据集详情

## 数据集描述

Gelasca et al. 数据集是一个乳腺癌组织病理学数据集，来自美国加州大学圣芭芭拉分校（UCSB）BioImage Lab，用于**乳腺细胞核分割与恶性/良性分类**研究。数据集在 UCSB 生物图像分割基准（Bio-Segmentation Benchmark）网站上发布。

### 数据来源

图像来自 UCSB 生物图像库，由病理学家提供乳腺 H&E 染色切片，并完成细胞核轮廓的手工标注。

## 数据集基本信息

- **器官类型**：乳腺（Breast）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：50 张图像（恶性 + 良性），包含约 1,895 个细胞核
- **图像分辨率**：
  - 896×768 像素（部分）
  - 768×512 像素（部分）
- **任务类型**：分类（classi）+ 分割（seg）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 图像总数 | 50 |
| 细胞核数量 | ~1,895 |
| 图像尺寸（类型 1） | 896 × 768 px |
| 图像尺寸（类型 2） | 768 × 512 px |

## 标注格式

### 细胞核轮廓标注（Contour Annotation）

- **标注形式**：每个细胞核的轮廓（Contour）多边形坐标
- **二值分类**：恶性（Malignant）vs. 良性（Benign）图像级标签

```python
import numpy as np
from PIL import Image
import os

# 加载图像
img = np.array(Image.open('malignant_001.png').convert('RGB'))

# 加载细胞核轮廓标注（通常为 .mat 格式或 .txt 格式）
import scipy.io as sio
mat = sio.loadmat('malignant_001_seg.mat')
# 字段可能包含轮廓多边形坐标列表
```

## 数据特点

### 恶性/良性分类
- 数据集包含恶性（Malignant）和良性（Benign）两类乳腺组织图像
- 支持图像级恶性分类和细胞核级分割任务

### 早期基准数据集
- 作为早期细胞核分割基准数据集，对后续工作有历史参考价值
- 规模较小（50 张图像），适合作为补充评估集

### 多尺寸图像
- 两种不同分辨率（896×768 和 768×512），加载时需灵活处理

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image

def load_gelasca_dataset(root_dir):
    """加载 Gelasca 数据集"""
    malignant_dir = os.path.join(root_dir, 'malignant')
    benign_dir = os.path.join(root_dir, 'benign')
    
    dataset = []
    
    for cls, cls_dir in [('malignant', malignant_dir), ('benign', benign_dir)]:
        for fname in os.listdir(cls_dir):
            if fname.endswith('.png') or fname.endswith('.bmp'):
                img = np.array(Image.open(os.path.join(cls_dir, fname)).convert('RGB'))
                dataset.append({'image': img, 'label': cls})
    
    return dataset
```

### 评估指标

```python
# 二值分类评估
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score

def evaluate_classification(y_true, y_pred, y_scores):
    acc = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    auc = roc_auc_score(y_true, y_scores)
    return {'Accuracy': acc, 'F1': f1, 'AUC': auc}
```

## 相关资源

- [UCSB Bio-Segmentation Benchmark](https://bioimage.ucsb.edu/research/bio-segmentation)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@inproceedings{gelasca2008evaluation,
  title={Evaluation and benchmark for biological image segmentation},
  author={Gelasca, Elisa Drelie and Byun, Jiyun and Obara, Boguslaw and Manjunath, BS},
  booktitle={2008 15th IEEE International Conference on Image Processing},
  pages={1816--1819},
  year={2008},
  organization={IEEE}
}
```

## 注意事项

1. **历史数据集**：发布较早（2008 年前后），规模小，主要用于历史基准对比。
2. **标注格式**：具体标注文件格式请参考 UCSB 官方网站说明。
3. **数据规模**：50 张图像，适合小样本研究或作为额外验证集。
4. **与 Janowczyk 数据集的区别**：两者均为乳腺 H&E 细胞核数据集，Gelasca 更小但提供二值分类标签。
