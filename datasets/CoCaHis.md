# CoCaHis 数据集详情

## 数据集描述

CoCaHis（Colon Cancer Histopathological Dataset）是一个用于结肠癌术中计算机辅助诊断的组织病理学数据集，包含 82 张结肠癌冷冻切片 H&E 染色图像及多标注者像素级分割掩码。

### 临床背景

数据集专为**术中冷冻切片**（Intraoperative Frozen Section）分析设计，服务于结直肠手术中的实时切缘诊断。患者均为**肝转移性结肠癌**（Metastatic Colon Cancer），数据来自克罗地亚鲁杰尔·博斯科维奇研究所（IRB Zagreb）。

## 数据集基本信息

- **器官类型**：结肠（转移性结肠癌，Colon - Metastatic Colon Cancer）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：82 张图像（19 例患者）
- **图像分辨率**：1037 × 1388 像素（patch 大小）
- **标注类型**：多标注者像素级分割掩码（肿瘤区域 vs. 非肿瘤区域）
- **任务类型**：分割（Semantic Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 患者数 | 19 |
| 图像总数 | 82 |
| 图像分辨率 | 1037 × 1388 px |
| 标注者数量 | 多个（含资深病理学家） |

## 标注格式

### 多标注者设计

- 每张图像由**多名标注者**独立进行像素级分割标注
- 标注者包括：病理学医生、住院医生和经过训练的医学生
- 提供各标注者原始标注及**融合后的共识掩码（Consensus Mask）**

### 标注类别

| 类别 | 像素值 | 说明 |
|------|--------|------|
| 背景/非肿瘤 | 0 | 正常组织、间质等 |
| 肿瘤 | 1 | 结肠癌肿瘤细胞区域 |

### 文件格式

- 图像：`.png` 或 `.jpg` 格式，RGB 三通道
- 掩码：二值 `.png` 掩码（肿瘤区域 = 1，背景 = 0）
- 多标注者掩码以单独文件存储

## 数据集特点

### 术中冷冻切片
- 冷冻切片质量通常低于石蜡包埋切片（FFPE）
- 存在冷冻伪影（冰晶效应）、组织收缩等质量问题
- 反映真实临床手术场景中的图像质量挑战

### 多标注者标注差异
- 数据集提供了研究**标注者间差异**（Inter-observer Variability）的机会
- 适合研究如何融合多标注者意见（Consensus Annotation）

### 转移性结肠癌
- 患者均为肝转移性结肠癌，代表晚期疾病状态
- 肿瘤形态可能与原发灶有所不同（转移灶形态）

## 使用建议

### 数据加载

```python
import os
import h5py
import numpy as np
from PIL import Image

# CoCaHis 可能提供 HDF5 格式
with h5py.File('CoCaHis.hdf5', 'r') as f:
    # 探索数据集结构
    print(list(f.keys()))  # 查看顶层键
    
    # 加载图像和标注
    images = f['images'][:]  # (N, H, W, 3)
    masks_annotator1 = f['annotations/annotator1'][:]  # (N, H, W)
    masks_annotator2 = f['annotations/annotator2'][:]
    consensus_masks = f['annotations/consensus'][:]

# 或加载单张图像
img = Image.open('image_001.png').convert('RGB')
mask = Image.open('mask_001.png').convert('L')
img_array = np.array(img)    # (1037, 1388, 3)
mask_array = np.array(mask)  # (1037, 1388) 二值掩码
```

### 多标注者融合策略

```python
import numpy as np

def fuse_annotations(annotations, strategy='majority'):
    """
    annotations: list of binary masks from different annotators
    strategy: 'majority' (多数投票), 'intersection' (交集), 'union' (并集)
    """
    stacked = np.stack(annotations, axis=0)  # (num_annotators, H, W)
    
    if strategy == 'majority':
        return (stacked.sum(axis=0) >= len(annotations) / 2).astype(np.uint8)
    elif strategy == 'intersection':
        return (stacked.sum(axis=0) == len(annotations)).astype(np.uint8)
    elif strategy == 'union':
        return (stacked.sum(axis=0) > 0).astype(np.uint8)
```

### 评估指标

```python
# 二值分割评估
def evaluate_binary_seg(pred, gt):
    tp = ((pred == 1) & (gt == 1)).sum()
    fp = ((pred == 1) & (gt == 0)).sum()
    fn = ((pred == 0) & (gt == 1)).sum()
    tn = ((pred == 0) & (gt == 0)).sum()
    
    dice = 2 * tp / (2 * tp + fp + fn + 1e-8)
    iou = tp / (tp + fp + fn + 1e-8)
    sensitivity = tp / (tp + fn + 1e-8)
    specificity = tn / (tn + fp + 1e-8)
    
    return {'Dice': dice, 'IoU': iou, 'Sensitivity': sensitivity, 'Specificity': specificity}
```

## 相关资源

- [官方数据集页面](https://cocahis.irb.hr/)
- [论文（Biomedical Signal Processing and Control, 2021）](https://www.sciencedirect.com/science/article/abs/pii/S1746809420305085)
- [HDF5 数据下载](http://cocahis.irb.hr/wp-content/uploads/2020/12/CoCaHis.hdf5)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{cocahis2021,
  title={A dataset and a methodology for intraoperative computer-aided diagnosis of a tumor in colorectal surgery},
  author={Gupta, Luka and others},
  journal={Biomedical Signal Processing and Control},
  volume={62},
  pages={102098},
  year={2021},
  publisher={Elsevier}
}
```

## 注意事项

1. **冷冻切片质量**：图像质量低于常规 FFPE 切片，含冻结伪影，模型需有一定鲁棒性。
2. **数据规模小**：仅 82 张图像，适合作为验证集或迁移学习目标域。
3. **多标注者差异**：建议研究标注一致性，选择合适的共识策略。
4. **HDF5 格式**：官方提供 HDF5 格式数据，加载时需使用 h5py 库。
