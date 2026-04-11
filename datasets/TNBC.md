# TNBC 数据集详情

## 数据集描述

TNBC 是一个用于**三阴性乳腺癌（Triple Negative Breast Cancer）**组织病理学图像**细胞核分割**的公开数据集，由法国 Institut Curie（居里研究所）的 Peter Naylor、Marick Laé、Fabien Reyal 和 Thomas Walter 发布，相关研究于 2018 年发表在 IEEE Transactions on Medical Imaging（TMI）上。

该数据集以**距离图深度回归（Deep Regression of the Distance Map）**方法解决相邻/接触细胞核的分割难题，是计算病理领域细胞核分割任务的重要基准数据集之一。

### 数据来源

所有图像均从 11 位三阴性乳腺癌患者的 H&E 染色组织切片中采集，每位患者选取 3–8 个高细胞密度子区域，以 512×512 像素的 patch 形式存储，40× 放大倍数拍摄。

## 数据集基本信息

- **器官类型**：乳腺 (Breast)
- **癌症类型**：三阴性乳腺癌（Triple Negative Breast Cancer, TNBC）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：50 张带标注图像，4,022 个细胞核实例
- **患者数量**：11 位患者
- **图像分辨率**：512 × 512 像素
- **放大倍数**：40×
- **任务类型**：细胞核实例分割
- **发布平台**：Zenodo（DOI: 10.5281/zenodo.2579118）
- **论文来源**：IEEE Transactions on Medical Imaging, 2018

## 文件结构

```
TNBC_NucleiSegmentation/
├── Slide_XX/                       # XX 为 01–11（患者编号）
│   ├── image/                      # 原始 H&E 图像
│   │   ├── image_XXYYY.png         # YYY 为图像编号（如 01001）
│   │   └── ...
│   └── mask/                       # 对应细胞核二值掩膜
│       ├── mask_XXYYY.png          # 与 image_XXYYY.png 一一对应
│       └── ...
└── README.md
```

> **命名规则**：`image_XXYYY.png` 中 `XX` 为患者编号（01–11），`YYY` 为该患者的图像序号（001 起）。

## 标注格式

### 二值掩膜（Binary Mask）

每张图像对应一个 PNG 格式二值掩膜：
- **像素值 0**：背景（非细胞核区域）
- **像素值 255**：细胞核区域（前景）

```python
from PIL import Image
import numpy as np

# 加载图像与掩膜
image = np.array(Image.open("Slide_01/image/image_01001.png"))  # (512, 512, 3)
mask  = np.array(Image.open("Slide_01/mask/mask_01001.png"))    # (512, 512)

# 二值化（确保 0/1）
binary_mask = (mask > 0).astype(np.uint8)
print(f"细胞核像素占比: {binary_mask.mean():.2%}")
```

### 实例分割提取

原始标注为**语义分割**（合并掩膜），若需实例分割可通过连通域分析提取：

```python
from scipy import ndimage

# 连通域标记（提取独立细胞核实例）
labeled_mask, num_instances = ndimage.label(binary_mask)
print(f"该图像中共 {num_instances} 个细胞核实例")
```

## 标注情况

### 标注统计

| 统计项 | 数值 |
|-------|-----|
| 总图像数 | 50 张 |
| 总患者数 | 11 位 |
| 总细胞核数 | 约 4,022 个 |
| 平均每张图细胞核数 | ~80 个 |
| 图像分辨率 | 512 × 512 px |
| 放大倍数 | 40× |

### 患者分布

每位患者贡献 3–8 个不同子区域的图像，子区域选取时兼顾不同细胞密度分布，确保数据多样性。

## 数据特点

### 挑战性场景

- **密集细胞核**：图像采自高细胞密度区域，相邻细胞核之间往往出现接触和重叠
- **形状多样**：三阴性乳腺癌细胞核形态不规则，大小差异显著
- **图像采集条件变化**：来自不同患者，存在染色强度差异

### 距离图方法（论文贡献）

该数据集与"距离图深度回归"方法共同发布，核心思想是将细胞核分割问题转化为距离图回归任务：

```python
from scipy.ndimage import distance_transform_edt

# 计算距离图（用于模型训练目标）
dist_map = distance_transform_edt(binary_mask)

# 归一化距离图
import numpy as np
if dist_map.max() > 0:
    dist_map_norm = dist_map / dist_map.max()
else:
    dist_map_norm = dist_map
```

### 数据集局限性

- 规模较小（50 张图像），常与其他数据集（如 Kumar、MoNuSAC）联合使用
- 仅包含三阴性乳腺癌，器官多样性有限
- 仅提供二值掩膜，无细胞核类型标注

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
from pathlib import Path

def load_tnbc_dataset(root_dir):
    """加载 TNBC 数据集"""
    images, masks = [], []
    root = Path(root_dir)
    
    for slide_dir in sorted(root.glob("Slide_*")):
        img_dir  = slide_dir / "image"
        mask_dir = slide_dir / "mask"
        
        for img_file in sorted(img_dir.glob("image_*.png")):
            # 对应掩膜文件名
            mask_file = mask_dir / img_file.name.replace("image_", "mask_")
            
            if mask_file.exists():
                img  = np.array(Image.open(img_file))     # (512, 512, 3)
                mask = np.array(Image.open(mask_file))    # (512, 512)
                
                images.append(img)
                masks.append((mask > 0).astype(np.uint8))
    
    return np.array(images), np.array(masks)

images, masks = load_tnbc_dataset("TNBC_NucleiSegmentation")
print(f"加载完成：{len(images)} 张图像，掩膜形状: {masks.shape}")
```

### 数据预处理

```python
def preprocess_image(image, mask):
    """标准化预处理"""
    # 图像归一化（ImageNet 均值/方差）
    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])
    image_norm = (image / 255.0 - mean) / std
    
    return image_norm.astype(np.float32), mask.astype(np.float32)
```

### 数据集划分

```python
# 按患者划分（避免数据泄漏）
# 推荐：前 8 位患者训练，后 3 位患者测试（常见划分）
train_slides = ["Slide_01", "Slide_02", ..., "Slide_08"]
test_slides  = ["Slide_09", "Slide_10", "Slide_11"]
```

### 数据增强

```python
# 推荐数据增强（针对有丝分裂/细胞核任务）
import albumentations as A

transform = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.ElasticTransform(p=0.3),
    A.HueSaturationValue(hue_shift_limit=10, p=0.3),  # 模拟染色差异
])
```

### 模型选择

1. **经典方法**：Watershed 算法 + 距离图
2. **深度学习**：U-Net、HoVer-Net、StarDist（尤其擅长密集细胞核）
3. **论文方法**：距离图深度回归（Deep Regression of the Distance Map, DRFNS）

### 评估指标

```python
def dice_coefficient(pred, target):
    """Dice 系数"""
    smooth = 1e-7
    pred_flat   = pred.flatten()
    target_flat = target.flatten()
    intersection = (pred_flat * target_flat).sum()
    return (2.0 * intersection + smooth) / (pred_flat.sum() + target_flat.sum() + smooth)

def aggregated_jaccard_index(pred_instances, gt_instances):
    """AJI（Aggregated Jaccard Index）- 实例分割指标"""
    # ... （需连通域标记后计算）
    pass
```

常用评估指标：

| 指标 | 类型 | 说明 |
|------|------|------|
| Dice | 语义分割 | 像素级重叠度 |
| IoU / Jaccard | 语义分割 | 交并比 |
| AJI | 实例分割 | 聚合 Jaccard 指数 |
| Precision / Recall | 检测 | 细胞核检测精确率/召回率 |
| F1-score | 检测 | 精确率与召回率的调和平均 |

## 相关资源

- [Zenodo 数据集下载](https://zenodo.org/records/2579118)（DOI: 10.5281/zenodo.2579118）
- [IEEE Dataport 镜像](https://ieee-dataport.org/documents/segmentation-nuclei-histopathology-images-deep-regression-distance-map)
- [论文原文（TMI）](https://ieeexplore.ieee.org/document/8438559)
- [官方代码（DRFNS）](https://github.com/PeterJackNaylor/DRFNS)
- [Kaggle 镜像](https://www.kaggle.com/datasets/mahmudulhasantasin/tnbc-nuclei-segmentation-original-dataset)
- [扩展版（含脑切片）](https://zenodo.org/records/3552674)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{naylor2018segmentation,
  title={Segmentation of nuclei in histopathology images by deep regression of the distance map},
  author={Naylor, Peter and La{\"e}, Marick and Reyal, Fabien and Walter, Thomas},
  journal={IEEE Transactions on Medical Imaging},
  volume={38},
  number={2},
  pages={448--459},
  year={2018},
  publisher={IEEE},
  doi={10.1109/TMI.2018.2865709}
}
```

## 注意事项

1. **版本说明**：Zenodo 上存有 v1.0 和 v1.1，其中 v1.1（2019-02-27）修正了少量被误标为细胞核的像素点，建议使用最新版本。
2. **仅二值掩膜**：该数据集不含细胞核类型/分类标注，若需多类别细胞核数据请参考 Lizard、CoNSeP 或 NuCLS 数据集。
3. **小数据集**：仅 50 张图像，建议与 Kumar、MoNuSAC、CryoNuSeg 等数据集联合训练，或使用预训练模型 + 微调策略。
4. **患者级划分**：数据集划分应以患者为单位（而非图像），避免同一患者的不同子区域同时出现在训练集和测试集中。
5. **扩展数据集**：Zenodo 提供了扩展版本（含 18 张 TCGA 脑切片图像），若需跨器官泛化实验可一并使用。
