# DigestPath2019 数据集详情

## 数据集描述

DigestPath2019（Digestive-System Pathological Detection and Segmentation Challenge 2019）是消化系统病理检测与分割挑战赛的数据集，包含**结肠组织镜下图像**中的病变分割与分类任务（Task 1：结肠镜下切片分割）。

### 主要任务

- **Task 1（结肠组织镜切片）**：在高分辨率结肠镜下切片中检测和分割病变区域（良恶性病变）
- 原始挑战赛还包含 Task 2（肠镜视频目标检测），本文件重点介绍 Task 1

## 数据集基本信息

- **器官类型**：结肠（Colon）— 结肠镜活检/切除标本
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：660 张
  - 测试集：212 张
- **图像分辨率**：平均约 5000×5000 像素（大尺寸 patch）
- **放大倍数**：20x
- **任务类型**：分割（seg）+ 分类（classi）

## 数据集划分

| 子集 | 数量 | 说明 |
|------|------|------|
| 训练集 | 660 | 含病变标注 |
| 测试集 | 212 | 评估用 |
| **合计** | **872** | — |

## 标注格式

### 病变区域分割标注

- **像素级掩码（PNG 格式）**：标注病变（阳性）区域
- **类别**：
  - 0: 背景/正常
  - 1: 阳性（病变）区域

```python
import numpy as np
from PIL import Image

# 加载大尺寸图像（5000x5000 px）
img = Image.open('train_001.png').convert('RGB')
img_array = np.array(img)

# 加载分割掩码
mask = np.array(Image.open('train_001_mask.png').convert('L'))
# 0: 正常, 1 或 255: 病变区域
lesion_mask = (mask > 0).astype(np.uint8)

# 图像较大，建议切分为小 patch
patch_size = 512
for y in range(0, img_array.shape[0] - patch_size, patch_size):
    for x in range(0, img_array.shape[1] - patch_size, patch_size):
        patch = img_array[y:y+patch_size, x:x+patch_size]
        patch_mask = lesion_mask[y:y+patch_size, x:x+patch_size]
        if patch_mask.sum() > 0:  # 含病变区域
            # 处理 patch
            pass
```

## 数据特点

### 大尺寸图像
- 平均约 5000×5000 px 的高分辨率大图
- 单张图像含有大量组织信息，计算成本高
- 训练时通常切分为 512×512 或 1024×1024 的 patch

### 病变多样性
- 覆盖多种结肠病变类型（腺瘤、腺癌等）
- 病变大小、形态、分布差异大

### 结肠特异性
- 专注于消化系统（结肠）病理
- 与 GlaS、CRAG 等结肠数据集互补

## 使用建议

### 大图像处理策略

```python
import numpy as np
from PIL import Image

def process_large_image(img_path, mask_path, patch_size=1024, stride=512):
    """滑动窗口切分大尺寸图像"""
    img = np.array(Image.open(img_path).convert('RGB'))
    mask = np.array(Image.open(mask_path).convert('L'))
    
    H, W = img.shape[:2]
    patches = []
    
    for y in range(0, H - patch_size + 1, stride):
        for x in range(0, W - patch_size + 1, stride):
            patch_img = img[y:y+patch_size, x:x+patch_size]
            patch_mask = mask[y:y+patch_size, x:x+patch_size]
            patches.append({
                'image': patch_img,
                'mask': (patch_mask > 0).astype(np.uint8),
                'pos': (y, x)
            })
    
    return patches
```

### 评估指标

```python
from sklearn.metrics import f1_score

# 像素级分割指标
def pixel_wise_metrics(pred, gt):
    pred_flat = pred.flatten()
    gt_flat = gt.flatten()
    
    f1 = f1_score(gt_flat, pred_flat, average='binary')
    
    tp = ((pred == 1) & (gt == 1)).sum()
    fp = ((pred == 1) & (gt == 0)).sum()
    fn = ((pred == 0) & (gt == 1)).sum()
    
    dice = 2 * tp / (2 * tp + fp + fn + 1e-8)
    iou = tp / (tp + fp + fn + 1e-8)
    
    return {'F1': f1, 'Dice': dice, 'IoU': iou}
```

## 相关资源

- [Grand Challenge 官方页](https://digestpath2019.grand-challenge.org/)
- [论文（arXiv 2019）](https://arxiv.org/pdf/1907.03954.pdf)
- [Google Drive 下载](https://drive.google.com/drive/folders/1hLd_OD4eGeyUrmb7UCWxxFfGSwwMI15V)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{digestpath2019,
  title={DigestPath: a benchmark dataset with key challenges for algorithms of colonoscopy pathology detection and segmentation},
  author={Li, Ruining and others},
  year={2019},
  journal={arXiv preprint arXiv:1907.03954}
}
```

## 注意事项

1. **大尺寸图像**：5000×5000 px 的图像需大量内存，建议切分为 patch 后处理。
2. **正负样本不均衡**：阳性（病变）区域仅占图像一部分，类别不均衡问题显著。
3. **数据访问**：通过 Grand Challenge 官网或 Google Drive 链接下载。
4. **与 Kather 数据集的区别**：DigestPath 侧重于病变区域分割，Kather 侧重于组织块多类分类。
