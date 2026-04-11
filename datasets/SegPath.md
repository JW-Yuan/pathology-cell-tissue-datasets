# SegPath 数据集详情

## 数据集描述

SegPath 是一个大规模多器官组织病理学**语义分割**数据集，包含 158,687 张 patch，标注来源于 IHC 对应的 H&E 切片的自动/半自动标注方法。论文发表于 Cell Patterns（2023）。

### 标注方法亮点

SegPath 使用了一种创新的**基于 IHC 的半自动标注框架**：利用细胞类型特异性的 IHC 抗体标记生成伪标注（Pseudo-labels），再对应到相邻的 H&E 切片上，实现大规模自动化标注。

## 数据集基本信息

- **器官类型**：多器官（multiple）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：158,687 张 patch
- **图像类型**：Patch（标准化尺寸）
- **放大倍数**：20x
- **扫描仪**：Zeiss MIRAX MIDI
- **任务类型**：分割（Semantic/Instance Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| Patch 总数 | 158,687 |
| 来源器官类型 | 多器官 |
| 放大倍数 | 20x |
| 标注类型 | 多类细胞/组织类型 |

## 标注来源与方法

### IHC 引导的自动标注

```
H&E 切片 ←→ 连续 IHC 切片（抗原特异性）
           ↓
      IHC 颜色分割 → 细胞类型标注
           ↓
      形变配准（Registration）到 H&E 切片
           ↓
      生成 H&E 对应的伪标注
```

### 覆盖的细胞类型（通过 IHC 标志物）

| IHC 标志物 | 对应细胞类型 | 说明 |
|----------|------------|------|
| CD3 / CD8 | T 淋巴细胞 | 免疫浸润 |
| CD20 | B 淋巴细胞 | 淋巴滤泡 |
| CD68 | 巨噬细胞 | 肿瘤微环境 |
| KI67 | 增殖细胞 | 细胞周期 |
| CK（广谱） | 上皮/肿瘤细胞 | 上皮来源 |
| SMA / Vimentin | 间质/肌成纤维细胞 | 结缔组织 |

（具体标志物以官方数据说明为准）

## 数据特点

### 大规模自动化标注
- 超过 15 万张 patch，是多类细胞分割领域规模最大的公开数据集之一
- 自动标注方法大幅降低了人工成本

### IHC-H&E 配对
- 利用 IHC 的细胞类型特异性提供高质量标注信息
- 标注准确性通过病理学家验证

### 多器官覆盖
- 来自多种器官的图像，增加了模型训练的多样性和泛化能力

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
import glob

def load_segpath_dataset(root_dir, split='train'):
    """加载 SegPath 数据集"""
    img_dir = os.path.join(root_dir, split, 'images')
    label_dir = os.path.join(root_dir, split, 'labels')
    mask_dir = os.path.join(root_dir, split, 'masks')
    
    img_paths = sorted(glob.glob(os.path.join(img_dir, '*.png')))
    
    dataset = []
    for img_path in img_paths:
        fname = os.path.basename(img_path)
        mask_path = os.path.join(mask_dir, fname)
        
        img = np.array(Image.open(img_path).convert('RGB'))
        
        if os.path.exists(mask_path):
            mask = np.array(Image.open(mask_path).convert('L'))
        else:
            mask = None
        
        dataset.append({'image': img, 'mask': mask, 'filename': fname})
    
    return dataset
```

### 评估指标

```python
import numpy as np

def evaluate_segmentation(pred, gt, num_classes, ignore_index=255):
    """计算多类分割评估指标"""
    iou_per_class = []
    dice_per_class = []
    
    for c in range(num_classes):
        pred_c = (pred == c) & (gt != ignore_index)
        gt_c = (gt == c) & (gt != ignore_index)
        
        intersection = (pred_c & gt_c).sum()
        union = (pred_c | gt_c).sum()
        
        iou = intersection / (union + 1e-8)
        dice = 2 * intersection / (pred_c.sum() + gt_c.sum() + 1e-8)
        
        iou_per_class.append(iou)
        dice_per_class.append(dice)
    
    return {
        'mIoU': np.mean(iou_per_class),
        'mDice': np.mean(dice_per_class),
        'IoU_per_class': iou_per_class,
        'Dice_per_class': dice_per_class
    }
```

## 相关资源

- [官方项目页](https://dakomura.github.io/SegPath/)
- [论文（Cell Patterns 2023）](https://www.cell.com/patterns/fulltext/S2666-3899(23))
- [Zenodo 数据下载](https://zenodo.org/records/7412580)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{segpath2023,
  title={SegPath: Enriching whole slide image segmentation with detailed clinical annotations},
  author={Komura, Daisuke and others},
  journal={Patterns},
  year={2023},
  publisher={Cell Press}
}
```

## 注意事项

1. **伪标注噪声**：IHC 引导的自动标注可能含有一定噪声，使用时注意标注质量评估。
2. **大规模数据管理**：15 万张 patch 的存储和加载需要高效的数据管道（如 HDF5、LMDB 或 WebDataset）。
3. **IHC-H&E 配准误差**：自动配准存在一定误差，标注边界精度不如手工标注。
4. **数据许可**：使用前查阅 Zenodo 数据许可协议。
