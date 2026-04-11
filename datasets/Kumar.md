# Kumar 数据集详情

## 数据集描述

Kumar 数据集（也称为 MoNuSeg 的前身或 Kumar et al. 数据集）是一个多器官 H&E 组织病理学图像中**细胞核实例分割**的基准数据集，由 Kumar 等在 IEEE TMI（2017）发表。该数据集首次提出了跨器官细胞核分割的评估框架。

### 数据来源

图像来源于 **TCGA（The Cancer Genome Atlas）**，涵盖 8 种器官的 H&E 染色 WSI 切片，采用 40x 放大倍数扫描。

## 数据集基本信息

- **器官类型**：多器官（8 种）：乳腺、肝脏、肾脏、前列腺、膀胱、结肠、脑、胃
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：16 张图像（13,372 个细胞核）
  - 测试集（相同器官）：8 张图像（4,130 个细胞核）
  - 测试集（不同器官）：6 张图像（4,121 个细胞核）
- **图像分辨率**：1000 × 1000 像素
- **放大倍数**：40x（TCGA）
- **任务类型**：分割（seg）+ 分类（classi）

## 数据集划分

| 子集 | 图像数 | 细胞核数 | 说明 |
|------|--------|---------|------|
| 训练集 | 16 | 13,372 | 来自 8 种器官（每种 2 张）|
| 测试集（相同器官） | 8 | 4,130 | 与训练集相同器官 |
| 测试集（不同器官） | 6 | 4,121 | 与训练集**不同**器官（跨器官泛化）|

## 涉及器官（8 种）

| 器官 | 英文 | 典型细胞核特征 |
|------|------|--------------|
| 乳腺 | Breast | 上皮、间质多样 |
| 肝脏 | Liver | 肝细胞大、圆 |
| 肾脏 | Kidney | 肾小管、肾小球 |
| 前列腺 | Prostate | 腺体细胞密集 |
| 膀胱 | Bladder | 移行上皮 |
| 结肠 | Colon | 腺体上皮 |
| 脑 | Brain | 胶质细胞、神经元 |
| 胃 | Stomach | 胃腺体上皮 |

## 标注格式

### XML 格式标注

```python
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageDraw

def load_kumar_annotation(xml_path, image_size=(1000, 1000)):
    """从 XML 标注文件加载细胞核多边形"""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    nuclei_polygons = []
    
    for region in root.iter('Region'):
        vertices = []
        for vertex in region.iter('Vertex'):
            x = float(vertex.get('X'))
            y = float(vertex.get('Y'))
            vertices.append((x, y))
        if len(vertices) > 2:
            nuclei_polygons.append(vertices)
    
    # 将多边形转换为实例分割掩码
    mask = Image.new('I', image_size, 0)
    draw = ImageDraw.Draw(mask)
    
    for i, poly in enumerate(nuclei_polygons):
        draw.polygon(poly, fill=i + 1)
    
    return nuclei_polygons, np.array(mask)

# 使用示例
polygons, inst_mask = load_kumar_annotation('TCGA-18-5592_1.xml')
```

### 文件结构

```
kumar/
├── train/
│   ├── images/    # (*.tif) 1000x1000 图像
│   └── annotations/ # (*.xml) 细胞核多边形标注
├── test_same_organ/
│   ├── images/
│   └── annotations/
└── test_diff_organ/
    ├── images/
    └── annotations/
```

## 数据特点

### 跨器官泛化测试
- 专门设计了"**不同器官**"测试集，用于评估模型的跨器官泛化能力
- 是最早系统评估细胞核分割跨域泛化性能的数据集之一

### 多器官覆盖
- 8 种不同器官，覆盖了细胞核形态的多种变化（大小、圆度、聚集程度等）

### AJI 指标贡献
- 论文提出了 **AJI（Aggregated Jaccard Index）** 指标，成为细胞核分割评估的标准指标

## 使用建议

### AJI（Aggregated Jaccard Index）计算

```python
import numpy as np

def compute_aji(pred_inst, gt_inst):
    """
    Aggregated Jaccard Index (AJI)
    Kumar et al. IEEE TMI 2017 中提出
    
    Args:
        pred_inst: (H, W) 预测实例掩码（0=背景，1..N=实例ID）
        gt_inst:   (H, W) 真实实例掩码
    Returns:
        aji: AJI 分数 (0~1)
    """
    gt_ids = np.unique(gt_inst)[1:]  # 去除背景
    pred_ids = np.unique(pred_inst)[1:]
    
    if len(gt_ids) == 0:
        return 1.0 if len(pred_ids) == 0 else 0.0
    
    # 贪心匹配：每个 GT 实例匹配最大 IoU 的 Pred 实例
    total_intersection = 0
    total_union = 0
    matched_pred = set()
    
    for gt_id in gt_ids:
        gt_mask = (gt_inst == gt_id)
        best_iou = 0
        best_pred_id = None
        best_intersection = 0
        best_union = 0
        
        for pred_id in pred_ids:
            if pred_id in matched_pred:
                continue
            pred_mask = (pred_inst == pred_id)
            intersection = (gt_mask & pred_mask).sum()
            union = (gt_mask | pred_mask).sum()
            iou = intersection / (union + 1e-8)
            
            if iou > best_iou:
                best_iou = iou
                best_pred_id = pred_id
                best_intersection = intersection
                best_union = union
        
        total_intersection += best_intersection
        if best_pred_id is not None:
            total_union += best_union
            matched_pred.add(best_pred_id)
        else:
            total_union += gt_mask.sum()
    
    # 未匹配的预测实例计入分母（FP）
    for pred_id in pred_ids:
        if pred_id not in matched_pred:
            total_union += (pred_inst == pred_id).sum()
    
    aji = total_intersection / (total_union + 1e-8)
    return aji
```

## 相关资源

- [Google Drive 数据下载](https://drive.google.com/drive/folders/1bI3RyshWej9c4YoRW-_q7lh7FOFDFUrJ)
- [论文（IEEE TMI 2017）](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=7872382)
- [备用下载链接](https://drive.google.com/drive/folders/1SZMgB9ztnPWWlChWxNPLYDHBVCTdenu4)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{kumar2017dataset,
  title={A dataset and a technique for generalized nuclear segmentation for computational pathology},
  author={Kumar, Neeraj and Verma, Ruchika and Sharma, Sanuj and others},
  journal={IEEE Transactions on Medical Imaging},
  volume={36},
  number={7},
  pages={1550--1560},
  year={2017},
  publisher={IEEE}
}
```

## 注意事项

1. **XML 标注格式**：标注为 XML 多边形格式，使用前需转换为实例掩码（见上方代码）。
2. **AJI 指标**：使用 AJI 评估时，请使用与 MoNuSeg 挑战赛一致的标准实现。
3. **TCGA 来源**：图像来自 TCGA，使用时需遵守 TCGA 数据使用协议（dbGaP）。
4. **与 MoNuSeg 的关系**：MoNuSeg 2018 数据集在 Kumar 数据集基础上扩展，两者图像部分重叠。
