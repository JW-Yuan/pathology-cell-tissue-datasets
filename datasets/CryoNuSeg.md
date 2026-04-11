# CryoNuSeg 数据集详情

## 数据集描述

CryoNuSeg 是一个专为**冷冻切片（Cryosection）H&E 染色图像中细胞核实例分割**设计的基准数据集，来自 TCGA，涵盖 10 种不同器官的组织，提供像素级二值分割标注。

### 研究背景

冷冻切片在术中快速病理诊断中至关重要，但其图像质量通常低于常规石蜡包埋（FFPE）切片（含冰晶伪影、组织形变等）。CryoNuSeg 是专门针对冷冻切片细胞核分割的数据集。

## 数据集基本信息

- **器官类型**：多器官（10 种）：肾上腺（Adrenal gland）、喉（Larynx）、淋巴结（Lymph nodes）、纵隔（Mediastinum）、胰腺（Pancreas）、胸膜（Pleura）、皮肤（Skin）、睾丸（Testes）、胸腺（Thymus）、甲状腺（Thyroid gland）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：30 张 patch（来自 30 张 WSI），含约 8,000 个细胞核
- **图像分辨率**：512 × 512 像素
- **放大倍数**：40x（来自 TCGA）
- **任务类型**：分割（Binary Nuclei Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 器官种类 | 10 种 |
| WSI 数量 | 30 |
| Patch 数量 | 30（每个 WSI 一张）|
| 细胞核总数 | 约 8,000 |
| 图像分辨率 | 512 × 512 px |

## 标注格式

### 像素级二值掩码 + 二值分类标签

```python
import numpy as np
from PIL import Image

# 加载图像
img = np.array(Image.open('cryo_001.png').convert('RGB'))  # (512, 512, 3)

# 加载二值掩码（细胞核 vs 背景）
binary_mask = np.array(Image.open('cryo_001_mask.png').convert('L'))
# 255 或 1: 细胞核区域
# 0: 背景

# 标准化掩码值
binary_mask = (binary_mask > 0).astype(np.uint8)
```

### 附加标签信息

- 除二值掩码外，还提供每张图像的**器官标签**（10 类）
- 可用于器官感知的分割模型训练

## 10 种器官

| 器官 | 英文 | 病理特点 |
|------|------|---------|
| 肾上腺 | Adrenal gland | 皮质细胞大，富含脂质空泡 |
| 喉 | Larynx | 鳞状上皮、黏液腺体 |
| 淋巴结 | Lymph nodes | 密集淋巴细胞 |
| 纵隔 | Mediastinum | 脂肪、胸腺残余组织 |
| 胰腺 | Pancreas | 腺泡细胞、胰岛细胞 |
| 胸膜 | Pleura | 间皮细胞、纤维组织 |
| 皮肤 | Skin | 表皮、真皮多层结构 |
| 睾丸 | Testes | 精原细胞、支持细胞 |
| 胸腺 | Thymus | 胸腺细胞密集 |
| 甲状腺 | Thyroid gland | 滤泡结构，胶体丰富 |

## 数据特点

### 冷冻切片特有挑战
- **冻结伪影**：冰晶形成造成组织撕裂，影响分割边界精度
- **组织收缩**：冷冻过程可能导致组织形变
- **厚度不均**：冷冻切片厚度控制不如石蜡切片精确

### 跨器官多样性
- 10 种器官覆盖不同组织学背景，适合测试模型泛化能力
- 每种器官仅 3 张图像（30 张 / 10 种器官），非常稀缺

### 与 FFPE 的区别
| 特性 | CryoNuSeg（冷冻） | FFPE（石蜡）|
|------|-----------------|------------|
| 图像质量 | 较低（含伪影）| 较高 |
| 处理速度 | 快（术中）| 慢（1-2 天）|
| 典型应用 | 术中快速诊断 | 常规病理诊断 |

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image

ORGANS = ['adrenal_gland', 'larynx', 'lymph_nodes', 'mediastinum', 
          'pancreas', 'pleura', 'skin', 'testes', 'thymus', 'thyroid_gland']

def load_cryonuseg(root_dir):
    dataset = []
    for organ in ORGANS:
        img_dir = os.path.join(root_dir, organ, 'images')
        mask_dir = os.path.join(root_dir, organ, 'masks')
        for fname in os.listdir(img_dir):
            if fname.endswith('.png'):
                img = np.array(Image.open(os.path.join(img_dir, fname)).convert('RGB'))
                mask_path = os.path.join(mask_dir, fname)
                mask = (np.array(Image.open(mask_path).convert('L')) > 0).astype(np.uint8)
                dataset.append({
                    'image': img,
                    'mask': mask,
                    'organ': organ
                })
    return dataset
```

### 评估指标

```python
# 二值分割指标（细胞核 vs 背景）
def compute_metrics(pred_mask, gt_mask):
    tp = ((pred_mask == 1) & (gt_mask == 1)).sum()
    fp = ((pred_mask == 1) & (gt_mask == 0)).sum()
    fn = ((pred_mask == 0) & (gt_mask == 1)).sum()
    
    dice = 2 * tp / (2 * tp + fp + fn + 1e-8)
    iou = tp / (tp + fp + fn + 1e-8)
    precision = tp / (tp + fp + 1e-8)
    recall = tp / (tp + fn + 1e-8)
    
    return {'Dice': dice, 'IoU': iou, 'Precision': precision, 'Recall': recall}
```

## 相关资源

- [Kaggle 数据集页面](https://www.kaggle.com/datasets/ipateam/segmentation-of-nuclei-in-cryosectioned-he-images)
- [GitHub 代码（CryoNuSeg）](https://github.com/masih4/CryoNuSeg)
- [论文（Computers in Biology and Medicine 2021）](https://www.sciencedirect.com/science/article/pii/S0010482521001438)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{cryonuseg2021,
  title={CryoNuSeg: A dataset for nuclei instance segmentation of cryosectioned H&E-stained histological images},
  author={Mahbod, Amirreza and Schaefer, Gerald and Dorffner, Georg and others},
  journal={Computers in Biology and Medicine},
  volume={132},
  pages={104349},
  year={2021},
  publisher={Elsevier}
}
```

## 注意事项

1. **小规模**：仅 30 张图像（每器官约 3 张），不适合大规模训练，主要用于测试和跨域评估。
2. **冷冻伪影**：模型需对冷冻伪影具备一定的鲁棒性，预训练时可考虑数据增强。
3. **仅二值标注**：不提供细胞核类别标注，仅适用于细胞核二值分割任务。
4. **跨器官评估**：10 种器官的覆盖使其成为测试跨器官泛化能力的理想数据集。
