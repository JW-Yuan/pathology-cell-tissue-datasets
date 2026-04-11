# CAMELYON16 数据集详情

## 数据集描述

CAMELYON16（Cancer Metastases in Lymph Nodes Challenge 2016）是首届大规模淋巴结乳腺癌转移检测挑战赛数据集，旨在评估数字病理切片中乳腺癌淋巴结转移自动检测算法的性能。由荷兰 Radboud 大学医学中心（RUMC）和乌得勒支大学医学中心（UMCU）联合提供数据。

### 核心目标

- **肿瘤检测（Detection）**：在淋巴结 WSI 中定位并标注转移病灶区域
- **WSI 级分类（Slide-Level Classification）**：判断 WSI 是否含有转移病灶（正常 vs. 转移）

## 数据集基本信息

- **器官类型**：淋巴结（Lymph Node）— 乳腺癌前哨淋巴结
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：270 张 WSI（160 正常 + 110 含转移）
  - 测试集：130 张 WSI
- **分析级别**：切片级分析（Slide-Level Analysis）
- **任务类型**：分类（classi）+ 分割（seg）

## 数据集划分

| 子集 | 正常 WSI | 含转移 WSI | 合计 |
|------|---------|------------|------|
| 训练集 | 160 | 110 | 270 |
| 测试集 | — | — | 130 |
| **合计** | — | — | **400** |

## 标注格式

### 像素级二值掩码（仅针对含转移 WSI）

- 转移区域提供**像素级标注掩码**（.tif 格式），标注由病理学家手工完成
- 正常 WSI 无像素级标注（整张切片为阴性）

### 转移类型

| 转移类型 | 说明 | 临床意义 |
|---------|------|---------|
| Macro-metastasis（宏观转移） | 转移灶面积 > 2mm | 需要辅助治疗 |
| Micro-metastasis（微转移） | 转移灶面积 0.2–2mm | 临床意义争议中 |
| Isolated Tumor Cells (ITC) | 单个或小簇癌细胞 < 0.2mm | 通常不计入 N stage |

## 数据特点

### 大规模 WSI 数据集
- 400 张 WSI，是当时最大规模的病理切片公开数据集之一
- 来自两家医院的数据，具有一定的域间差异

### 挑战难点
- 微转移和 ITC（孤立肿瘤细胞）检测难度大，极易漏诊
- WSI 分辨率极高（约 1–10 万 × 1–10 万像素），计算资源需求大
- 需平衡计算效率与检测精度

### 临床重要性
- 淋巴结转移状态是乳腺癌分期和治疗决策的关键因素
- 自动化检测可减少病理医生工作量，提高微小转移的检出率

## 使用建议

### 数据加载

```python
import openslide
import numpy as np
from PIL import Image

# 加载 WSI
wsi = openslide.OpenSlide('tumor_001.tif')

# 获取 WSI 缩略图用于可视化
thumbnail = wsi.get_thumbnail((1000, 1000))

# 加载转移区域掩码
mask_wsi = openslide.OpenSlide('tumor_001_mask.tif')

# 读取高分辨率区域
level = 0
tile = wsi.read_region((x, y), level, (256, 256))
mask_tile = mask_wsi.read_region((x, y), level, (256, 256))

tile_array = np.array(tile.convert('RGB'))
mask_array = np.array(mask_tile.convert('L'))
binary_mask = (mask_array > 0).astype(np.uint8)
```

### 基于滑动窗口的 Patch 分类流程

```python
# 典型的 CAMELYON16 处理流程
def extract_tissue_patches(wsi_path, patch_size=256, stride=128):
    """从 WSI 中提取含有组织的 patch"""
    wsi = openslide.OpenSlide(wsi_path)
    # 1. 在低分辨率获取组织掩码（Otsu 阈值分割）
    thumbnail = np.array(wsi.get_thumbnail((2000, 2000)).convert('L'))
    tissue_mask = thumbnail < 200  # 简单阈值，实际需要优化
    # 2. 在组织区域内滑动提取 patch
    # ... (具体实现参考官方 baseline)
    return patches, coordinates
```

### 评估指标

```python
# FROC（Free-Response ROC）曲线 - 主要评估指标
# 计算在不同假阳性率下的灵敏度
# 官方评估代码：github.com/computationalpathologygroup/CAMELYON16

# AUC（ROC 曲线下面积）
from sklearn.metrics import roc_auc_score
auc = roc_auc_score(y_true, y_scores)
```

## 相关资源

- [Grand Challenge 官方页](https://camelyon16.grand-challenge.org/)
- [论文（JAMA 2017）](https://jamanetwork.com/journals/jama/article-abstract/2665774)
- [百度网盘下载](https://pan.baidu.com/s/1UW_HLXXjjw5hUvBIUYPgbA)
- [AWS 公开数据集](https://registry.opendata.aws/camelyon/)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{bejnordi2017diagnostic,
  title={Diagnostic assessment of deep learning algorithms for detection of lymph node metastases in women with breast cancer},
  author={Bejnordi, Babak Ehteshami and Veta, Mitko and van Diest, Paul Johannes and others},
  journal={JAMA},
  volume={318},
  number={22},
  pages={2199--2210},
  year={2017},
  publisher={American Medical Association}
}
```

## 注意事项

1. **文件格式**：WSI 为 `.tif` 格式，需使用 `openslide` 或 `tifffile` 读取。
2. **存储需求**：单张 WSI 可达数 GB，完整数据集存储需求较大。
3. **FROC 评估**：官方评估使用 FROC 曲线，需要位置级别的预测，而非仅切片级分类。
4. **CAMELYON17 升级版**：如需患者级别分析，可使用 CAMELYON17（500 张 WSI，100 例患者）。
