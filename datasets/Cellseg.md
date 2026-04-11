# Cellseg 数据集详情

## 数据集描述

Cellseg（NeurIPS 2022 Cell Segmentation Challenge）是 NeurIPS 2022 举办的细胞分割挑战赛数据集，正式名称为"**多模态高分辨率显微图像中的弱监督细胞分割**"（Weakly Supervised Cell Segmentation in Multi-modality High-Resolution Microscopy Images）。数据集覆盖多种成像模态和细胞类型，旨在推动通用细胞分割算法的发展。

### 核心目标

- 开发可跨**不同成像模态**（荧光、相差、明视野、H&E 等）泛化的细胞分割算法
- 支持**弱监督**（点标注、边界框）和**半监督**学习场景

## 数据集基本信息

- **器官类型**：多器官、多细胞类型
- **染色/成像方式**：多模态（荧光、相差、明视野、H&E 等）
- **数据集大小**：大规模，包含有标注和无标注的显微图像（WSI 级别，标注有限）
- **任务类型**：分割（seg）

## 成像模态覆盖

| 模态类型 | 说明 | 示例细胞类型 |
|---------|------|------------|
| 荧光显微（Fluorescence） | DAPI、GFP 等荧光标记 | 培养细胞、组织细胞 |
| 相差显微（Phase Contrast） | 无染色，利用折射率差成像 | 活细胞 |
| 明视野（Brightfield） | H&E 染色病理图像 | 组织病理细胞 |
| DIC（微分干涉差） | 梯度增强成像 | 培养细胞 |
| 透射电镜（TEM） | 超高分辨率 | 亚细胞结构 |

## 数据集划分

| 子集 | 类型 | 说明 |
|------|------|------|
| 训练集（有标注） | 多模态 labeled patches | 来自多个机构的有标注图像 |
| 训练集（无标注） | 大量 unlabeled patches | 用于半监督/自监督学习 |
| 验证集 | 多模态 labeled patches | 用于方法评估 |

> 有标注图像为**有限**数量，大量图像**仅提供无标注原图**（弱监督/半监督挑战）。

## 标注格式

- **实例分割掩码**：每个细胞实例标注独立 ID（实例分割）
- **标注稀疏性**：部分图像仅有少量专家标注，其余图像无标注
- 文件格式：`.png` 掩码（实例 ID 编码）或 `.json` 格式

### 数据集统计（挑战赛阶段）

| 统计项 | 数值 |
|--------|------|
| 有标注图像 | 约 1000+ |
| 无标注图像 | 数千张（多模态） |
| 成像模态数 | 约 9 种 |

## 数据特点

### 多模态挑战
- 不同成像模态下细胞的视觉外观差异巨大
- 要求算法具备强泛化能力（Domain Generalization）

### 弱监督设定
- 有标注样本有限，大量无标注样本
- 适合研究半监督、弱监督、自监督学习方法

### 多样性
- 来自全球多家机构的数据
- 涵盖组织细胞、培养细胞、标记细胞和无标记细胞等多种类型

## 使用建议

### 数据加载

```python
import os
from PIL import Image
import numpy as np

# 加载图像与掩码
def load_cellseg_pair(image_path, mask_path):
    img = Image.open(image_path).convert('RGB')
    mask = Image.open(mask_path)  # 实例 ID 掩码
    return np.array(img), np.array(mask)

# 从实例掩码提取实例
def extract_instances(instance_mask):
    """提取所有细胞实例"""
    instance_ids = np.unique(instance_mask)
    instance_ids = instance_ids[instance_ids != 0]  # 去除背景
    instances = []
    for inst_id in instance_ids:
        inst_mask = (instance_mask == inst_id).astype(np.uint8)
        instances.append({'id': inst_id, 'mask': inst_mask})
    return instances
```

### 评估指标

```python
# F1 分数（基于 IoU 阈值）
def compute_f1(pred_masks, gt_masks, iou_threshold=0.5):
    """
    pred_masks: list of binary masks for predicted instances
    gt_masks: list of binary masks for ground truth instances
    """
    tp, fp, fn = 0, 0, 0
    matched_gt = set()
    
    for pred in pred_masks:
        best_iou = 0
        best_gt_idx = -1
        for gt_idx, gt in enumerate(gt_masks):
            if gt_idx in matched_gt:
                continue
            intersection = (pred & gt).sum()
            union = (pred | gt).sum()
            iou = intersection / (union + 1e-8)
            if iou > best_iou:
                best_iou = iou
                best_gt_idx = gt_idx
        if best_iou >= iou_threshold:
            tp += 1
            matched_gt.add(best_gt_idx)
        else:
            fp += 1
    
    fn = len(gt_masks) - len(matched_gt)
    precision = tp / (tp + fp + 1e-8)
    recall = tp / (tp + fn + 1e-8)
    f1 = 2 * precision * recall / (precision + recall + 1e-8)
    return f1, precision, recall
```

## 相关资源

- [Grand Challenge 官方页](https://neurips22-cellseg.grand-challenge.org/)
- [论文（PMLR 2022）](https://proceedings.mlr.press/v212/lee23b.html)
- [GitHub 代码](https://github.com/JunMa11/NeurIPS-CellSeg)
- [百度网盘下载](https://pan.baidu.com/s/1lUK7dOR1MhVlaZ-iyOOhhA?pwd=2022#list/path=%2F)
- [挑战赛网站](https://uni-cellseg.github.io/)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@inproceedings{neurips2022cellseg,
  title={The Multi-modality Cell Segmentation Challenge: Towards Universal Solutions},
  author={Ma, Jun and Xie, Ronald and Ayyadhury, Shamini and others},
  booktitle={NeurIPS 2022 Competition Track},
  year={2022}
}
```

## 注意事项

1. **数据访问**：训练数据通过 Grand Challenge 平台注册后下载，需填写注册表。
2. **弱监督设定**：挑战赛鼓励不过度依赖有标注数据的方法，请关注数据量限制规则。
3. **多模态预处理**：不同模态图像需不同的颜色归一化策略，不宜直接混合训练。
4. **评估标准**：官方使用 F1 分数（IoU 阈值 0.5）作为主要评估指标。
