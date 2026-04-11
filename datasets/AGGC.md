# AGGC 数据集详情

## 数据集描述

AGGC（Automated Gleason Grading Challenge）2022 是一个前列腺癌自动 Gleason 分级挑战赛数据集，旨在推动计算病理学中前列腺癌自动化分析算法的发展。数据来自新加坡国立大学医院（NUH）。

### 核心任务

- **腺体分割（Gland Segmentation）**：对前列腺 H&E WSI 中的腺体进行像素级分割
- **Gleason 分级（Gleason Grading）**：对每个分割出的腺体区域进行 Gleason 分级（3、4、5 级）

## 数据集基本信息

- **器官类型**：前列腺 (Prostate)
- **染色方式**：H&E（苏木精-伊红）
- **放大倍数**：20x（子集 1、2）
- **扫描仪**：
  - 子集 1 & 2：Akoya Biosciences Scanner
  - 子集 3：多扫描仪（Multi-scanner，每个标本由多台扫描仪扫描）
- **数据来源**：新加坡国立大学医院（National University Hospital, Singapore）

## 数据集划分

| 子集 | 训练集 | 测试集 | 说明 |
|------|--------|--------|------|
| Subset 1 | 105 WSI | 45 WSI | Akoya 扫描仪 |
| Subset 2 | 37 WSI | 16 WSI | Akoya 扫描仪 |
| Subset 3 | 144 WSI | 67 WSI | 多扫描仪 |
| **合计** | **286 WSI** | **128 WSI** | — |

## 标注格式

- **二值掩码（Binary Mask）**：区分前列腺腺体与背景，每个像素标注为有效腺体区域或非腺体区域
- **Gleason 等级掩码**：对每个腺体区域标注 Gleason 等级（3、4、5）
- 标注格式为与 WSI 同尺寸的掩码图像

### Gleason 分级说明

| Gleason 等级 | 形态特征 | 预后意义 |
|-------------|---------|---------|
| 3 | 独立、分散的腺体结构，轮廓清晰 | 低侵袭性 |
| 4 | 融合腺体、筛状结构、腺体分化不良 | 中等侵袭性 |
| 5 | 单个细胞、坏死、无腺体形成 | 高侵袭性 |

**Gleason Score = Primary Grade + Secondary Grade**（如 3+4=7 为中等风险）

## 数据特点

### 多扫描仪挑战
- 子集 3 的多扫描仪设计旨在测试算法的跨域泛化能力
- 不同扫描仪的颜色响应、对比度、分辨率存在差异

### 精细化分级标注
- Gleason 分级是前列腺癌诊断和治疗决策的金标准
- 自动化 Gleason 分级具有重要临床价值，可辅助病理医生提高效率

## 使用建议

### 数据加载

```python
import openslide
import numpy as np
from PIL import Image

# 加载 WSI
wsi = openslide.OpenSlide('prostate_case.svs')

# 获取指定分辨率的图像块
level = 0  # 最高分辨率
region = wsi.read_region((x_offset, y_offset), level, (width, height))
img_array = np.array(region.convert('RGB'))

# 加载对应掩码
mask = Image.open('prostate_case_mask.png')
mask_array = np.array(mask)
# 0: background, 1: Gleason 3, 2: Gleason 4, 3: Gleason 5
```

### 评估指标

```python
# 腺体分割 - Dice 系数
def dice_coefficient(pred, gt):
    intersection = (pred & gt).sum()
    return 2 * intersection / (pred.sum() + gt.sum() + 1e-8)

# Gleason 分级 - 加权 Kappa / F1
from sklearn.metrics import cohen_kappa_score, f1_score
kappa = cohen_kappa_score(y_true, y_pred, weights='quadratic')
f1 = f1_score(y_true, y_pred, average='weighted')
```

## 相关资源

- [Grand Challenge 官方页](https://aggc22.grand-challenge.org/)
- [论文](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4172090)
- [GitHub 实现（MIC-DKFZ）](https://github.com/MIC-DKFZ/AGGC2022)
- [Zenodo 数据](https://zenodo.org/records/6389355)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{aggc2022,
  title={Automated Gleason Grading Challenge 2022},
  journal={SSRN},
  year={2022},
  url={https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4172090}
}
```

## 注意事项

1. **数据访问**：需通过 Grand Challenge 平台申请，注册后按要求下载。
2. **多扫描仪处理**：子集 3 中同一标本由多台扫描仪扫描，使用时需关注扫描仪 ID，避免数据泄露。
3. **Gleason 评分规范**：标注基于 2014 年国际泌尿病理学会（ISUP）的 Gleason 修订标准。
4. **类别不平衡**：Gleason 5 样本较少，需特别处理。
