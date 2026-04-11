# CATCH 数据集详情

## 数据集描述

CATCH（Pan-tumor CAnine cuTaneous Cancer Histology）是一个大规模的**犬类皮肤肿瘤**组织病理学数据集，提供 350 张全切片图像（WSI）及 12,424 个多边形标注（13 个组织学类别）。数据集由德国埃尔朗根-纽伦堡大学（FAU Erlangen-Nürnberg）计算机科学系模式识别实验室发布，论文发表于 Nature Scientific Data（2022）。

> **重要提示**：本数据集为**动物（犬类）病理**，不直接用于人类疾病诊断，但其组织学模式与人类皮肤肿瘤存在相似性，可用于算法迁移学习研究。

## 数据集基本信息

- **器官类型**：皮肤（犬类，Canine）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：350 张 WSI，12,424 个多边形标注（13 类）
- **放大倍数**：40x — Aperio ScanScope CS2（Leica）
- **任务类型**：分割（seg）+ 分类（classi）
- **数据来源**：TCIA（The Cancer Imaging Archive）

## 肿瘤类型（7 类）

| 肿瘤类型 | 缩写 | 说明 |
|---------|------|------|
| Mast Cell Tumor | MCT | 肥大细胞瘤（最常见） |
| Melanoma | MEL | 黑色素瘤 |
| Plasmacytoma | PLA | 浆细胞瘤 |
| Soft Tissue Sarcoma | STS | 软组织肉瘤 |
| Squamous Cell Carcinoma | SCC | 鳞状细胞癌 |
| Trichoblastoma | TRI | 毛母细胞瘤 |
| Histiocytoma | HIS | 组织细胞瘤 |

## 标注格式

### 多边形标注（Polygon Annotation）

- 标注格式：JSON（多边形顶点坐标 + 类别标签）
- **13 个组织学类别**：
  - 7 种肿瘤类型（对应上表）
  - 6 种非肿瘤组织：表皮（Epidermis）、真皮（Dermis）、皮下脂肪（Subcutis）、炎症（Inflammation）、血管（Blood Vessel）、表皮/真皮附属器（Skin Adnexae）

### 标注统计

| 类别 | 标注数量（约） |
|------|--------------|
| 肿瘤区域（7 类合计） | ~6,000 |
| 非肿瘤组织（6 类合计） | ~6,424 |
| **合计** | **12,424** |

## 数据特点

### 大规模多肿瘤类型覆盖
- 覆盖 7 种不同的犬类皮肤肿瘤类型
- 包含肿瘤间质、炎症浸润等微环境信息

### 犬-人类跨物种迁移潜力
- 犬类皮肤肿瘤与人类皮肤肿瘤存在形态学相似性
- 可作为迁移学习的源域（Source Domain）

### 丰富的背景组织标注
- 不仅标注肿瘤，还标注皮肤各层非肿瘤组织
- 适合上下文感知的分割模型训练

## 使用建议

### 数据加载

```python
import json
import openslide
import numpy as np
from shapely.geometry import Polygon

# 加载 WSI
wsi = openslide.OpenSlide('MCT_sample.svs')

# 加载 JSON 标注
with open('MCT_sample_annotations.json', 'r') as f:
    annotations = json.load(f)

# 解析多边形标注
for annotation in annotations:
    label = annotation['label']       # 类别名称
    polygon_pts = annotation['polygon']  # [[x1,y1], [x2,y2], ...]
    poly = Polygon(polygon_pts)
    
    # 转换为掩码
    x_min, y_min, x_max, y_max = [int(v) for v in poly.bounds]
    region = wsi.read_region((x_min, y_min), 0, (x_max-x_min, y_max-y_min))
    region_array = np.array(region.convert('RGB'))
```

### 创建像素级掩码

```python
from PIL import Image, ImageDraw

def create_mask(wsi_dims, annotations, class_to_id):
    """从多边形标注创建像素级掩码"""
    mask = Image.new('L', wsi_dims, 0)
    draw = ImageDraw.Draw(mask)
    
    for ann in annotations:
        class_id = class_to_id.get(ann['label'], 0)
        poly_pts = [tuple(pt) for pt in ann['polygon']]
        draw.polygon(poly_pts, fill=class_id)
    
    return np.array(mask)
```

### 评估指标

```python
import numpy as np

def compute_jaccard_per_class(pred, gt, num_classes):
    """计算每类 Jaccard 系数（IoU）"""
    jaccards = {}
    class_names = ['MCT', 'MEL', 'PLA', 'STS', 'SCC', 'TRI', 'HIS',
                   'Epidermis', 'Dermis', 'Subcutis', 'Inflammation', 'BloodVessel', 'Adnexae']
    for c in range(1, num_classes + 1):
        pred_c = (pred == c)
        gt_c = (gt == c)
        intersection = (pred_c & gt_c).sum()
        union = (pred_c | gt_c).sum()
        jaccards[class_names[c-1]] = intersection / (union + 1e-8)
    return jaccards
```

## 相关资源

- [TCIA 数据页面](https://www.cancerimagingarchive.net/collection/catch/)
- [论文（Nature Scientific Data 2022）](https://www.nature.com/articles/s41597-022-01692-w)
- [arXiv 版本](https://arxiv.org/abs/2201.11446)
- [TCIA Wiki](https://wiki.cancerimagingarchive.net/pages/viewpage.action?pageId=101941773)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{wilm2022catch,
  title={Pan-tumor CAnine cuTaneous Cancer Histology (CATCH) dataset},
  author={Wilm, Frauke and Fragoso, Marco and Marzahl, Christian and others},
  journal={Scientific Data},
  volume={9},
  pages={588},
  year={2022},
  publisher={Nature Publishing Group}
}
```

## 注意事项

1. **物种差异**：数据为犬类病理，不可直接用于人类疾病诊断，迁移学习时需谨慎。
2. **许可证**：数据遵循 Creative Commons Attribution 4.0 许可证。
3. **多边形格式**：标注为 JSON 多边形，使用前需转换为像素级掩码。
4. **与 Multi-Scanner SCC 的关联**：CATCH 同机构发布了 Multi-Scanner SCC 数据集，两者可联合研究扫描仪域偏移问题。
