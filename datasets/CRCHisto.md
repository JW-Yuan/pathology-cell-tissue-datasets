# CRCHisto 数据集详情

## 数据集描述

CRCHisto（Colorectal Cancer Histology Dataset，也称 CRC Labeled Nuclei）是一个用于**结肠癌组织病理图像中细胞核实例分割与分类**的数据集，由英国华威大学（UHCW）发布（2016）。

## 数据集基本信息

- **器官类型**：结肠（Colon）— 结肠癌（Colorectal Cancer）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 100 张图像（10 张 WSI，9 例患者）
  - 29,756 个细胞核（点标注 + 类别）
- **图像分辨率**：500 × 500 像素
- **放大倍数**：20x
- **扫描仪**：Omnyx VL120（UHCW）
- **任务类型**：分割（seg）+ 分类（classi）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| WSI 数量 | 10（来自 9 例患者） |
| 图像 Patch 数 | 100 |
| 标注细胞核数 | 29,756 |
| 图像分辨率 | 500 × 500 px |

## 细胞核类别

CRCHisto 提供**细胞核类别点标注**，类别体系根据发布版本有所不同：

| 类别 | 英文 | 说明 |
|------|------|------|
| 1 | Epithelial | 上皮细胞核 |
| 2 | Inflammatory | 炎症细胞核（含淋巴细胞）|
| 3 | Fibroblast/Connective | 纤维母细胞/结缔组织细胞核 |
| 4 | Other | 其他 |

> **注意**：CRCHisto 的类别体系与后续 CoNSeP 等数据集略有不同，使用前请查阅官方文档确认类别定义。

## 标注格式

### 点标注（Point Annotation）

- 标注形式：**点标注（Point Label）**，即为每个细胞核标注一个中心点坐标及类别
- 不提供像素级轮廓/掩码（与 CoNSeP 等不同）
- 格式通常为 `.mat` 或 `.csv` 文件

```python
import scipy.io as sio
import numpy as np

# 加载标注
mat = sio.loadmat('labels_001.mat')

# 常见字段：
# - inst_centroid: (N, 2) 细胞核中心坐标 (x, y)
# - inst_type:     (N, 1) 细胞核类别 ID（1-4）

centroids = mat['inst_centroid']  # (N, 2)
types = mat['inst_type'].flatten()  # (N,)

print(f"共 {len(centroids)} 个细胞核")
for cls in range(1, 5):
    count = (types == cls).sum()
    print(f"类别 {cls}: {count} 个细胞核")
```

### 文件结构（参考）

```
crchisto/
├── Images/     # (*.png) 500x500 病理图像
└── Labels/     # (*.mat) 点标注文件
```

## 数据特点

### 点标注而非掩码
- 仅提供细胞核中心点和类别，不含像素级轮廓
- 适合用于**细胞核检测（Detection）**和密度图估计任务
- 若需用于分割任务，需从点生成 Voronoi 图或近似圆形掩码

### 结肠癌特异性
- 专注于结肠癌组织，与 Kumar 等多器官数据集互补
- 20x 分辨率覆盖了典型的结肠癌组织学特征

### 较大规模
- 29,756 个标注细胞核，规模适中
- 来自 10 张 WSI，样本来源多样

## 使用建议

### 从点标注生成近似分割掩码

```python
import numpy as np
from scipy.ndimage import distance_transform_edt

def points_to_voronoi_masks(centroids, types, image_size, num_classes=4):
    """
    从点标注生成 Voronoi 分割近似掩码
    每个像素分配给最近的细胞核中心点
    """
    H, W = image_size
    y_grid, x_grid = np.mgrid[0:H, 0:W]
    
    mask = np.zeros((H, W), dtype=np.int32)
    type_mask = np.zeros((H, W), dtype=np.int32)
    
    # 计算每个像素到所有细胞核中心的距离
    min_dist = np.full((H, W), np.inf)
    
    for i, (cx, cy) in enumerate(centroids):
        dist = np.sqrt((x_grid - cx)**2 + (y_grid - cy)**2)
        update = dist < min_dist
        min_dist = np.where(update, dist, min_dist)
        mask = np.where(update & (dist < 15), i + 1, mask)  # 15px 半径
        type_mask = np.where(update & (dist < 15), types[i], type_mask)
    
    return mask, type_mask
```

### 评估指标

```python
# 检测任务评估（F1 @ 不同距离阈值）
def detection_f1(pred_centroids, gt_centroids, threshold=12):
    """
    pred_centroids: (M, 2) 预测中心点
    gt_centroids:   (N, 2) 真实中心点
    threshold: 匹配距离阈值（像素）
    """
    from scipy.spatial.distance import cdist
    if len(pred_centroids) == 0 or len(gt_centroids) == 0:
        return 0.0
    
    dist_matrix = cdist(pred_centroids, gt_centroids)
    matched_gt = set()
    tp = 0
    
    for i in range(len(pred_centroids)):
        nearest_gt = np.argmin(dist_matrix[i])
        if dist_matrix[i, nearest_gt] <= threshold and nearest_gt not in matched_gt:
            tp += 1
            matched_gt.add(nearest_gt)
    
    precision = tp / len(pred_centroids)
    recall = tp / len(gt_centroids)
    f1 = 2 * precision * recall / (precision + recall + 1e-8)
    return f1
```

## 相关资源

- [数据集下载（Warwick TIA）](https://warwick.ac.uk/fac/cross_fac/tia/data/crchistolabelednucleihe/)
- [论文（IEEE ISBI 2016）](https://ieeexplore.ieee.org/document/7399414)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@inproceedings{sirinukunwattana2016locality,
  title={Locality sensitive deep learning for detection and classification of nuclei in routine colon cancer histology images},
  author={Sirinukunwattana, Korsuk and Raza, Shan E Ahmed and Tsang, Yee-Wah and Snead, David and Cree, Ian and Rajpoot, Nasir},
  booktitle={IEEE Transactions on Medical Imaging},
  year={2016}
}
```

## 注意事项

1. **点标注限制**：无像素级轮廓标注，直接用于分割任务时需额外处理（如 Voronoi 分割）。
2. **类别定义**：不同论文引用 CRCHisto 时使用的类别可能有合并/调整，以原始数据集官方说明为准。
3. **历史数据集**：2016 年发布，较早，数据量和质量与后续数据集（如 CoNSeP）有差距，适合历史基准对比。
