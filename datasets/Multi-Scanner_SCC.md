# Multi-Scanner SCC 数据集详情

## 数据集描述

Multi-Scanner SCC（Multi-Scanner Squamous Cell Carcinoma）是一个专用于研究**多扫描仪域偏移（Domain Shift）**的犬类皮肤鳞状细胞癌组织病理学数据集，同一批组织标本通过 5 台不同扫描仪扫描，用于 WSI 配准与分割的跨扫描仪泛化研究。

### 发布机构

由德国埃尔朗根-纽伦堡大学（FAU Erlangen-Nürnberg）计算机科学系模式识别实验室发布，与 CATCH 数据集出自同一团队，发表于 2023 年。

## 数据集基本信息

- **器官类型**：皮肤（犬类，Canine Skin）— 鳞状细胞癌（Squamous Cell Carcinoma）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：44 个标本 × 5 台扫描仪 = **220 张 WSI**
- **扫描仪数量**：5 台不同扫描仪
- **任务类型**：配准（Registration）+ 分割（Segmentation）
- **数据获取**：Zenodo 公开下载

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 组织标本数 | 44 |
| 每标本扫描仪数 | 5 |
| WSI 总数 | 220 |
| 注释类型 | 多边形（JSON）|

## 5 台扫描仪

| 扫描仪 | 厂商/型号（参考） | 主要差异 |
|--------|----------------|---------|
| Scanner 1 | — | 颜色、分辨率参考基准 |
| Scanner 2 | — | 颜色响应差异 |
| Scanner 3 | — | 对比度差异 |
| Scanner 4 | — | 分辨率/放大倍数差异 |
| Scanner 5 | — | 综合差异 |

> 具体扫描仪型号及参数以 Zenodo 数据描述为准。

## 标注格式

### 多边形标注（JSON 格式）

```python
import json
import numpy as np
from shapely.geometry import Polygon
from PIL import Image, ImageDraw

# 加载 JSON 标注
with open('sample_001_annotations.json', 'r') as f:
    annotations = json.load(f)

# 解析多边形
for ann in annotations:
    label = ann['label']           # 组织类别（如 tumor, epidermis 等）
    polygon_pts = ann['polygon']   # [[x1,y1], [x2,y2], ...]
    
    poly = Polygon(polygon_pts)
    area = poly.area
    print(f"标签: {label}, 面积: {area:.0f} 像素²")
```

### 标注类别

参照 CATCH 数据集的组织类别体系（包含肿瘤区域和皮肤正常组织类别）。

## 数据集特点

### 跨扫描仪域偏移研究
- **核心价值**：同一组织标本由 5 台扫描仪扫描，提供了控制变量的跨扫描仪比较
- 可用于研究扫描仪域偏移对分割和配准算法的影响

### 配准任务
- 5 台扫描仪扫描同一标本，不同扫描仪的图像间存在轻微形变差异
- 适合研究 WSI 配准算法

### 犬类皮肤鳞状细胞癌
- 鳞状细胞癌（SCC）是人类和犬类皮肤中常见的恶性肿瘤之一
- 与 CATCH 数据集共享相似的组织学背景

## 使用建议

### 多扫描仪数据对齐

```python
import openslide
import numpy as np
from PIL import Image

def load_multi_scanner_pair(specimen_id, scanner1_path, scanner2_path, 
                            patch_size=512, level=1):
    """
    加载同一标本不同扫描仪的图像对
    用于配准研究
    """
    wsi1 = openslide.OpenSlide(scanner1_path)
    wsi2 = openslide.OpenSlide(scanner2_path)
    
    # 获取缩略图（用于粗配准估计）
    thumb1 = wsi1.get_thumbnail((1000, 1000))
    thumb2 = wsi2.get_thumbnail((1000, 1000))
    
    return {
        'scanner1': {'wsi': wsi1, 'thumbnail': np.array(thumb1)},
        'scanner2': {'wsi': wsi2, 'thumbnail': np.array(thumb2)},
        'specimen_id': specimen_id
    }
```

### 域适应实验设计

```python
# 典型实验设计：
# - 源域（Source Domain）：Scanner 1 的标注数据
# - 目标域（Target Domain）：其余 4 台扫描仪的未标注数据
# - 评估：在目标域上的分割性能

# 颜色归一化预处理（重要！）
def macenko_normalize(img, reference_img):
    """Macenko 颜色归一化"""
    # 参见 staintools 库实现
    pass

# 或使用 Reinhard 颜色归一化
def reinhard_normalize(img, target_mean, target_std):
    """Reinhard 颜色归一化"""
    pass
```

## 相关资源

- [Zenodo 数据下载](https://zenodo.org/records/7418555)
- [论文](https://link.springer.com/chapter/10.1007/978-3-658-41657-7_46)
- [CATCH 相关数据集](https://www.cancerimagingarchive.net/collection/catch/)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@inproceedings{multi_scanner_scc2023,
  title={Multi-Scanner Canine Cutaneous Squamous Cell Carcinoma Histopathology Dataset},
  author={Wilm, Frauke and others},
  booktitle={Bildverarbeitung für die Medizin 2023},
  year={2023},
  publisher={Springer}
}
```

## 注意事项

1. **物种差异**：数据为犬类病理，不直接用于人类诊断，但组织学模式有参考价值。
2. **扫描仪信息**：使用前查阅 Zenodo 页面的详细扫描仪参数。
3. **配准难度**：同一标本的不同扫描图像存在非线性形变，简单的刚性配准可能不够。
4. **与 CATCH 联合使用**：本数据集与 CATCH 同出一处，建议联合研究跨肿瘤类型和跨扫描仪的泛化问题。
