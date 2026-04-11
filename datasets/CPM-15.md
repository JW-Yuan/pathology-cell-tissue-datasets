# CPM-15 数据集详情

## 数据集描述

CPM-15（Cell Position Map Dataset with 15 images）是一个用于**细胞核实例分割与分类**的小规模基准数据集，包含 15 张来自多种器官的组织病理学图像，共 2,905 个已标注的细胞核实例。

### 数据来源

图像来源于**TCGA（The Cancer Genome Atlas）**，涵盖**脑组织**为主的多器官组织切片，由研究者手工标注细胞核轮廓和类别。

## 数据集基本信息

- **器官类型**：脑（Brain，以及部分其他器官）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：15 张图像，2,905 个细胞核实例
- **图像分辨率**：400×400 至 600×1000 像素（尺寸不一）
- **放大倍数**：20x 和 40x（TCGA 扫描）
- **任务类型**：分割（seg）+ 分类（classi）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 图像总数 | 15 |
| 细胞核实例数 | 2,905 |
| 图像分辨率范围 | 400×400 ~ 600×1000 px |

## 标注格式

### MATLAB `.mat` 文件（推测格式，与 CPM-17 一致）

```python
import scipy.io as sio
import numpy as np

mat = sio.loadmat('image_001.mat')
# 字段（参考 CPM-17 格式）：
# - inst_map:   (H, W) 实例 ID 掩码
# - type_map:   (H, W) 类别掩码
# - inst_centroid: (N, 2) 细胞核中心坐标
```

## 数据特点

### 小规模高质量基准
- 15 张图像提供了精细的实例级标注
- 尽管规模小，但覆盖了多种细胞核形态

### TCGA 来源
- 高分辨率，细节丰富
- 来源明确，可溯源至具体患者/组织

### 常与 CPM-17 联合使用
- CPM-15 和 CPM-17 常作为互补基准，在细胞核分割论文中一起报告结果

## 使用建议

### 数据加载

```python
import scipy.io as sio
import numpy as np
from PIL import Image
import os

def load_cpm_sample(img_path, label_path):
    """加载 CPM 数据集样本"""
    img = np.array(Image.open(img_path).convert('RGB'))
    
    # 加载 .mat 标注
    mat = sio.loadmat(label_path)
    inst_map = mat.get('inst_map', mat.get('inst_seg', None))
    
    return img, inst_map

# 数据目录结构
# cpm15/
# ├── train/
# │   ├── images/   (*.png)
# │   └── labels/   (*.mat)
# └── test/
#     ├── images/   (*.png)
#     └── labels/   (*.mat)
```

### 评估指标

```python
# 常用细胞核分割评估指标
# 1. Dice（二值分割）
# 2. AJI（Aggregated Jaccard Index）
# 3. PQ（Panoptic Quality）

def dice_coef(pred, gt):
    intersection = (pred & gt).sum()
    return 2 * intersection / (pred.sum() + gt.sum() + 1e-8)

def aji_score(pred_instances, gt_instances):
    """聚合 Jaccard 指数，综合考虑实例匹配质量"""
    # 参见 Kumar 数据集的标准评估代码
    pass
```

## 相关资源

- [Google Drive 数据下载](https://drive.google.com/drive/folders/11ko-GcDsPpA9GBHuCtl_jNzWQl6qY_-I)
- [与 CPM-17 相关论文（PMC）](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6454006/)

## 引用

如果您使用了此数据集，请在引用相关方法论文（如使用 CPM-15 的算法论文）时同时说明数据来源。目前暂无专门的 CPM-15 原始论文，通常随算法论文一起发布。

## 注意事项

1. **规模限制**：仅 15 张图像，不适合独立训练，通常用于测试集或跨数据集评估。
2. **分辨率不一致**：图像尺寸不统一（400×400 ~ 600×1000），需在数据加载时处理。
3. **放大倍数混合**：包含 20x 和 40x 图像，使用时需注意。
4. **与 CPM-17 区别**：CPM-15 图像数更少（15 vs. 64），细胞核数也更少（2,905 vs. 7,570）。
