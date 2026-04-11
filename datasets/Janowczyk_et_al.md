# Janowczyk et al. 数据集详情

## 数据集描述

Janowczyk et al. 数据集是一个用于**乳腺组织病理学图像中细胞核实例分割**的数据集，随深度学习在数字病理中应用的教程论文（2016）一同发布，由 Andrew Janowczyk 提供。

### 数据来源

图像来自乳腺癌 H&E 染色切片，由病理学家进行手工细胞核分割标注。数据集通过作者个人主页对外公开，常与深度学习教程一起使用。

## 数据集基本信息

- **器官类型**：乳腺（Breast）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：143 张图像，含约 12,000 个细胞核
- **图像分辨率**：2000 × 2000 像素（较大尺寸）
- **放大倍数**：40x
- **任务类型**：分割（Nuclei Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 图像总数 | 143 |
| 细胞核数量 | ~12,000 |
| 图像分辨率 | 2000 × 2000 px |

## 标注格式

### 细胞核二值分割掩码

```python
import numpy as np
from PIL import Image

# 加载高分辨率乳腺图像
img = np.array(Image.open('img001.png').convert('RGB'))  # (2000, 2000, 3)

# 加载二值分割掩码（细胞核 = 1，背景 = 0）
mask = np.array(Image.open('img001_mask.png').convert('L'))
binary_mask = (mask > 0).astype(np.uint8)

# 大图像建议切分为小 patch
patch_size = 500
for y in range(0, 2000, patch_size):
    for x in range(0, 2000, patch_size):
        patch = img[y:y+patch_size, x:x+patch_size]
        patch_mask = binary_mask[y:y+patch_size, x:x+patch_size]
```

### 文件结构

```
janowczyk_nuclei/
├── images/    # (*.tif 或 *.png) 2000x2000 乳腺图像
└── masks/     # (*.tif 或 *.png) 对应二值细胞核掩码
```

## 数据特点

### 高分辨率大图
- 2000×2000 px 的高分辨率图像，细胞核细节丰富
- 40x 放大倍数下，细胞核形态清晰

### 深度学习教程配套
- 随 Janowczyk & Madabhushi (2016) 深度学习细胞核分割教程发布
- 常用于深度学习方法在病理图像分割任务上的教学示例

### 乳腺特异性
- 专注于乳腺 H&E 切片
- 与 Gelasca、Naylor、TNBC 等乳腺细胞核数据集互补

## 使用建议

### 数据加载与 Patch 提取

```python
import os
import numpy as np
from PIL import Image
import glob

def extract_patches_from_large_image(img, mask, patch_size=256, stride=128, 
                                     min_nuclei_ratio=0.1):
    """从大图像中提取含细胞核的 patch"""
    H, W = img.shape[:2]
    patches = []
    
    for y in range(0, H - patch_size + 1, stride):
        for x in range(0, W - patch_size + 1, stride):
            patch_img = img[y:y+patch_size, x:x+patch_size]
            patch_mask = mask[y:y+patch_size, x:x+patch_size]
            
            nuclei_ratio = patch_mask.mean()
            if nuclei_ratio > min_nuclei_ratio:
                patches.append({
                    'image': patch_img,
                    'mask': patch_mask,
                    'pos': (y, x)
                })
    return patches
```

### 评估指标

```python
# 二值细胞核分割指标
def compute_binary_seg_metrics(pred, gt):
    tp = ((pred == 1) & (gt == 1)).sum()
    fp = ((pred == 1) & (gt == 0)).sum()
    fn = ((pred == 0) & (gt == 1)).sum()
    
    dice = 2 * tp / (2 * tp + fp + fn + 1e-8)
    precision = tp / (tp + fp + 1e-8)
    recall = tp / (tp + fn + 1e-8)
    f1 = 2 * precision * recall / (precision + recall + 1e-8)
    
    return {'Dice': dice, 'F1': f1, 'Precision': precision, 'Recall': recall}
```

## 相关资源

- [作者主页（Andrew Janowczyk）](http://www.andrewjanowczyk.com/use-case-1-nuclei-segmentation/)
- [GitHub 代码](https://github.com/choosehappy/public/tree/master/DL%20tutorial%20Code)
- [数据直接下载](https://andrewjanowczyk.com/wp-static/nuclei.tgz)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{janowczyk2016deep,
  title={Deep learning for digital pathology image analysis: A comprehensive tutorial with selected use cases},
  author={Janowczyk, Andrew and Madabhushi, Anant},
  journal={Journal of Pathology Informatics},
  volume={7},
  number={1},
  pages={29},
  year={2016},
  publisher={Elsevier}
}
```

## 注意事项

1. **大图像处理**：2000×2000 px 的图像较大，训练时需切分为小 patch，并注意边界处的细胞核补全。
2. **仅二值标注**：不提供细胞核类别标签，仅适用于二值（有/无核）分割任务。
3. **下载方式**：可直接通过 `.tgz` 链接下载，无需注册。
4. **40x 分辨率**：相比 20x 数据集，40x 下细胞核更大，适合研究高分辨率图像的分割方法。
