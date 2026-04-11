# RINGS 数据集详情

## 数据集描述

RINGS（Reliable Instance-level Nuclear Ground-truth for Segmentation）是一个专用于**前列腺癌 H&E 图像中腺体实例分割**的大规模数据集，提供像素级腺体分割掩码。数据集由 AIIMS（全印度医学科学研究所）发布，论文发表于 Artificial Intelligence in Medicine（2021）。

## 数据集基本信息

- **器官类型**：前列腺（Prostate）— 前列腺腺癌
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：1000 张 patch，含 18,851 个腺体
  - 测试集：500 张 patch
- **图像分辨率**：1500 × 1500 像素
- **放大倍数**：40x
- **任务类型**：分割（Gland Instance Segmentation）

## 数据集规模

| 子集 | Patch 数 | 腺体数 | 说明 |
|------|---------|--------|------|
| 训练集 | 1000 | 约 12,567 | 含标注 |
| 测试集 | 500 | 约 6,284 | 含标注 |
| **合计** | **1500** | **18,851** | — |

## 标注格式

### 像素级腺体实例掩码

```python
import numpy as np
from PIL import Image

# 加载前列腺 patch 图像
img = np.array(Image.open('prostate_patch_001.png').convert('RGB'))  # (1500, 1500, 3)

# 加载腺体实例掩码
mask = np.array(Image.open('prostate_patch_001_mask.png'))
# 0: 背景/间质
# 非零: 腺体实例 ID

# 获取腺体数量
gland_ids = np.unique(mask)
gland_ids = gland_ids[gland_ids != 0]
print(f"图像中腺体数量: {len(gland_ids)}")

# 提取单个腺体
for gid in gland_ids:
    single_gland = (mask == gid).astype(np.uint8)
    area = single_gland.sum()
    print(f"腺体 {gid}: 面积 {area} 像素")
```

## 前列腺腺体 Gleason 特征

| Gleason 等级 | 腺体形态特征 | RINGS 中的表现 |
|-------------|------------|--------------|
| Gleason 3 | 单独腺体，轮廓清晰 | 腺体完整，边界规则 |
| Gleason 4 | 融合腺体，筛状结构 | 腺体融合，形态复杂 |
| Gleason 5 | 无腺体结构 | 极少量腺体或缺失 |

## 数据特点

### 大规模前列腺腺体数据集
- 18,851 个腺体标注，是前列腺腺体分割领域最大的公开数据集之一
- 覆盖多种 Gleason 等级，病例多样

### 大尺寸 Patch
- 1500×1500 px 的 patch，每张图像包含较多腺体（约 12 个）
- 适合研究腺体间上下文关系

### 40x 高分辨率
- 高倍镜下腺体形态细节清晰，适合精细化分割研究

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
import glob

def load_rings_dataset(root_dir, split='train'):
    """加载 RINGS 数据集"""
    img_paths = sorted(glob.glob(os.path.join(root_dir, split, 'images', '*.png')))
    
    dataset = []
    for img_path in img_paths:
        fname = os.path.basename(img_path)
        mask_path = os.path.join(root_dir, split, 'masks', fname)
        
        img = np.array(Image.open(img_path).convert('RGB'))
        if os.path.exists(mask_path):
            mask = np.array(Image.open(mask_path))  # 实例 ID 掩码
            binary = (mask > 0).astype(np.uint8)    # 二值前景掩码
        else:
            mask, binary = None, None
        
        dataset.append({
            'image': img,
            'instance_mask': mask,
            'binary_mask': binary
        })
    
    return dataset
```

### 评估指标（对象级）

```python
# 腺体分割对象级评估（参考 GlaS/CRAG 评估方式）
import numpy as np

def object_level_f1(pred_inst, gt_inst, iou_threshold=0.5):
    """对象级 F1 分数"""
    pred_ids = np.unique(pred_inst)[1:]
    gt_ids = np.unique(gt_inst)[1:]
    
    tp, matched = 0, set()
    
    for pred_id in pred_ids:
        pred_mask = (pred_inst == pred_id)
        best_iou, best_gt = 0, None
        
        for gt_id in gt_ids:
            if gt_id in matched:
                continue
            gt_mask = (gt_inst == gt_id)
            inter = (pred_mask & gt_mask).sum()
            union = (pred_mask | gt_mask).sum()
            iou = inter / (union + 1e-8)
            if iou > best_iou:
                best_iou, best_gt = iou, gt_id
        
        if best_iou >= iou_threshold:
            tp += 1
            matched.add(best_gt)
    
    fp = len(pred_ids) - tp
    fn = len(gt_ids) - tp
    
    precision = tp / (tp + fp + 1e-8)
    recall = tp / (tp + fn + 1e-8)
    f1 = 2 * precision * recall / (precision + recall + 1e-8)
    
    return f1
```

## 相关资源

- [Mendeley Data 下载](https://data.mendeley.com/datasets/h8bdwrtnr5/1)
- [论文（Artificial Intelligence in Medicine 2021）](https://www.sciencedirect.com/science/article/pii/S0933365721000695)
- [直接下载链接](https://prod-dcd-datasets-cache-zipfiles.s3.eu-west-1.amazonaws.com/h8bdwrtnr5-1.zip)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{rings2021,
  title={RINGS: A reliable instance-level nuclear ground-truth segmentation dataset for prostate gland histology},
  author={Arif, Muhammad and others},
  journal={Artificial Intelligence in Medicine},
  volume={116},
  pages={102073},
  year={2021},
  publisher={Elsevier}
}
```

## 注意事项

1. **大尺寸图像**：1500×1500 px 的图像较大，训练时建议切分为较小的 patch（如 512×512）。
2. **前列腺专属**：仅包含前列腺腺体，不含其他器官，是前列腺腺体分割的专用基准。
3. **Gleason 分级关联**：腺体形态与 Gleason 分级高度相关，可进一步研究分割结果与 Gleason 评分的关联。
4. **数据开放下载**：通过 Mendeley Data 公开下载，无需特殊申请。
