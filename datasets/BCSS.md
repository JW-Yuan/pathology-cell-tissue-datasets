# BCSS 数据集详情

## 数据集描述

BCSS（Breast Cancer Semantic Segmentation）是一个大规模乳腺癌组织学图像语义分割数据集，包含来自 TCGA（The Cancer Genome Atlas）的 151 张 WSI 中超过 20,000 个区域的组织区域分割标注。

### 标注来源

标注由**病理学家、病理学住院医师和医学生**通过数字病理档案系统协作完成，采用众包式标注方法，具有较高的标注覆盖率和多样性。

## 数据集基本信息

- **器官类型**：乳腺 (Breast)
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：151 张 WSI；超过 20,000 个 patch 标注
- **图像分辨率**：Patch 大小可变
- **数据来源**：TCGA（The Cancer Genome Atlas）
- **任务类型**：语义分割（Semantic Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| WSI 总数 | 151 |
| 标注区域总数 | >20,000 |
| 覆盖患者数 | 来自 TCGA 多个患者 |
| 标注分辨率 | 0.25 MPP（微米/像素） |

## 标注格式

### 组织类型类别（21 类，细粒度）

BCSS 提供精细的组织区域分割，共 21 个类别，包括但不限于：

| 类别 ID | 类别名称 | 中文说明 |
|---------|---------|---------|
| 0 | outside_roi | ROI 外区域 |
| 1 | tumor | 肿瘤区域 |
| 2 | stroma | 间质 |
| 3 | lymphocytic_infiltrate | 淋巴细胞浸润 |
| 4 | necrosis_or_debris | 坏死或碎屑 |
| 5 | glandular_secretions | 腺体分泌物 |
| 6 | blood | 血液 |
| 7 | exclude | 排除区域 |
| 8 | metaplasia_NOS | 化生 |
| 9 | fat | 脂肪 |
| 10 | plasma_cells | 浆细胞 |
| 11 | other_immune_infiltrate | 其他免疫细胞浸润 |
| 12 | mucoid_material | 黏液样物质 |
| 13 | normal_acinus_or_duct | 正常腺泡/导管 |
| 14 | lymphatics | 淋巴管 |
| 15 | undetermined | 不确定 |
| 16 | nerve | 神经 |
| 17 | skin_adnexa | 皮肤附属器 |
| 18 | blood_vessel | 血管 |
| 19 | angioinvasion | 血管侵犯 |
| 20 | dcis | 导管原位癌 |
| 21 | other | 其他 |

> **注**：实际使用中常合并为更少的大类（如 5 类：tumor、stroma、lymphocytic infiltrate、necrosis、others）

## 数据特点

### 大规模众包标注
- 标注者来自不同经验层次，反映真实临床标注多样性
- 标注区域密集，覆盖多种组织学特征

### TCGA 来源
- 数据来源标准化，与大量现有研究数据可关联分析
- 附带完整的临床信息（通过 TCGA 获取）

### 细粒度类别
- 21 个细粒度类别提供丰富的组织学标注信息
- 可根据研究需要合并为粗粒度类别

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image

# 数据目录结构
# bcss/
# ├── images/      # RGB 图像 (.png)
# └── masks/       # 语义分割掩码 (.png)

def load_bcss_pair(image_path, mask_path):
    img = Image.open(image_path).convert('RGB')
    mask = Image.open(mask_path)
    return np.array(img), np.array(mask)

# 合并为粗粒度 5 类（常用设置）
COARSE_MAPPING = {
    0: 0,   # outside_roi -> background
    1: 1,   # tumor
    2: 2,   # stroma
    3: 3,   # lymphocytic infiltrate
    4: 4,   # necrosis
    # 其他 -> 5 (others)
}

def coarsen_mask(fine_mask, mapping, num_coarse=6):
    coarse_mask = np.full_like(fine_mask, 5)  # default: others
    for fine_id, coarse_id in mapping.items():
        coarse_mask[fine_mask == fine_id] = coarse_id
    return coarse_mask
```

### 评估指标

```python
import numpy as np

def compute_iou(pred, gt, num_classes):
    ious = []
    for c in range(num_classes):
        pred_c = (pred == c)
        gt_c = (gt == c)
        intersection = (pred_c & gt_c).sum()
        union = (pred_c | gt_c).sum()
        if union > 0:
            ious.append(intersection / union)
    return np.mean(ious)  # mIoU
```

## 相关资源

- [Grand Challenge 官方页](https://bcsegmentation.grand-challenge.org/)
- [GitHub 代码与数据](https://github.com/PathologyDataScience/BCSS)
- [论文（Bioinformatics 2019）](https://academic.oup.com/bioinformatics/article/35/18/3461/5307750)
- [Google Drive 下载](https://drive.google.com/drive/folders/1zqbdkQF8i5cEmZOGmbdQm-EP8dRYtvss)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{amgad2019structured,
  title={Structured crowdsourcing enables convolutional segmentation of histology images},
  author={Amgad, Mohamed and Elfandy, Habiba and Hussein, Hagar and others},
  journal={Bioinformatics},
  volume={35},
  number={18},
  pages={3461--3467},
  year={2019},
  publisher={Oxford University Press}
}
```

## 注意事项

1. **TCGA 使用协议**：数据来源于 TCGA，使用时需遵守 TCGA 数据使用协议（dbGaP）。
2. **类别选择**：根据具体研究任务合理合并细粒度类别，21 类直接使用会带来严重的类别不平衡问题。
3. **下载方式**：可通过 GitHub 提供的链接在 0.25 MPP 分辨率下下载完整数据集。
4. **与 NuCLS 的关联**：BCSS 的 WSI 图像与 NuCLS 数据集部分重叠，可联合使用。
