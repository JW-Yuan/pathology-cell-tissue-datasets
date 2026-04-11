# NuCLS 数据集详情

## 数据集描述

NuCLS（Nucleus Classification, Localization and Segmentation）是一个大规模乳腺癌组织病理学数据集，提供精细的细胞核**检测、分类和分割**标注，数据来源于 TCGA 的 BCSS 图像（图像与 BCSS 数据集部分重叠）。

### 特色

NuCLS 使用了众包式标注方法，标注者包括病理学家和经过训练的非专业人员，并研究了不同标注策略（单标注者、多标注者共识）对算法性能的影响。

## 数据集基本信息

- **器官类型**：乳腺（Breast）— 乳腺癌
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：约 220,000 个细胞核，来自 3,944 个 ROI，125 例患者
- **图像类型**：ROI（感兴趣区域）Patch
- **数据来源**：TCGA（与 BCSS 图像重叠）
- **任务类型**：检测（detection）+ 分类（classi）+ 分割（seg）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 患者数 | 125 |
| ROI 数量 | 3,944 |
| 细胞核总数 | ~220,000 |
| 标注类别数 | 多类（见下表）|

## 细胞核类别

NuCLS 提供了**精细分类**和**粗粒度分类**两套类别体系：

### 精细类别（11 类）

| 类别 ID | 类别名称 | 中文 |
|---------|---------|------|
| 1 | sTIL | 基质肿瘤浸润淋巴细胞 |
| 2 | tumor_nonMitotic | 肿瘤细胞（非有丝分裂）|
| 3 | tumor_mitotic | 肿瘤细胞（有丝分裂）|
| 4 | nonTIL_stromal | 非 TIL 间质细胞 |
| 5 | macrophage | 巨噬细胞 |
| 6 | dcis | 导管原位癌 |
| 7 | other_nucleus | 其他细胞核 |
| 8 | apoptotic | 凋亡细胞 |
| 9 | fibroblast | 成纤维细胞 |
| 10 | vascular_endothelium | 血管内皮细胞 |
| 11 | unlabeled | 未标注 |

### 粗粒度类别（常用 5 类合并）

| 合并类别 | 包含精细类别 |
|---------|------------|
| Tumor | tumor_nonMitotic, tumor_mitotic, dcis |
| TIL | sTIL |
| Stromal | nonTIL_stromal, fibroblast, vascular_endothelium |
| Macrophage | macrophage |
| Other/Unlabeled | apoptotic, other_nucleus, unlabeled |

## 标注格式

### CSV + 边界框 + 分割轮廓

```python
import pandas as pd
import numpy as np
from PIL import Image

# NuCLS 提供 CSV 格式标注
# 加载单标注者版本
df = pd.read_csv('single_rater/labels.csv')

# 列说明
# - roi_name: ROI 图像文件名
# - nucleus_x, nucleus_y: 细胞核中心坐标
# - x_min, y_min, x_max, y_max: 边界框坐标
# - type: 细胞核类别（精细类别名称）
# - corrected_class: 校正后类别

# 过滤特定 ROI 的标注
roi_annotations = df[df['roi_name'] == 'TCGA-OL-A66I-01Z-00-DX1.C96EB59A_ROI_1']

# 统计各类细胞核数量
class_counts = df['corrected_class'].value_counts()
print(class_counts)
```

### 数据版本

NuCLS 提供两个主要版本：

| 版本 | 特点 |
|------|------|
| Single-rater | 单标注者标注，标注量大，快速获取 |
| Multi-rater（共识） | 多标注者投票共识，标注质量更高但数量少 |

## 数据特点

### 大规模细胞核标注
- 约 22 万个细胞核，是乳腺癌领域最大规模的细胞核多类标注数据集之一

### 多任务支持
- **检测**：提供边界框坐标
- **分类**：提供精细/粗粒度类别标签
- **分割**：提供细胞核轮廓多边形（部分）

### 众包标注研究
- 研究了不同标注策略（单标注者、多标注者）对下游算法的影响
- 可用于研究标注噪声和标注者间一致性

### 与 BCSS 的关联
- 图像来源与 BCSS 部分重叠（均来自 TCGA 乳腺癌 WSI）
- 可联合使用，同时利用组织级和细胞核级信息

## 使用建议

### 数据加载

```python
import pandas as pd
import numpy as np
from PIL import Image, ImageDraw

def load_nucls_sample(roi_path, label_csv_path, roi_name):
    """加载 NuCLS ROI 图像和对应标注"""
    img = Image.open(roi_path).convert('RGB')
    
    df = pd.read_csv(label_csv_path)
    roi_df = df[df['roi_name'] == roi_name]
    
    # 绘制标注点
    draw = ImageDraw.Draw(img)
    colors = {'tumor_nonMitotic': 'red', 'sTIL': 'blue', 
              'nonTIL_stromal': 'green', 'macrophage': 'yellow'}
    
    for _, row in roi_df.iterrows():
        cls = row.get('corrected_class', row.get('type', 'other'))
        color = colors.get(cls, 'white')
        cx, cy = int(row['nucleus_x']), int(row['nucleus_y'])
        draw.ellipse([cx-3, cy-3, cx+3, cy+3], fill=color)
    
    return img, roi_df
```

### 评估指标

```python
from sklearn.metrics import f1_score, classification_report

# 分类任务评估
def evaluate_classification(y_true, y_pred, class_names):
    report = classification_report(y_true, y_pred, 
                                   target_names=class_names, 
                                   output_dict=True)
    return report

# 检测任务评估（F1 @ 距离阈值）
# 参见 Kumar 数据集的检测 F1 计算
```

## 相关资源

- [Grand Challenge 官方页](https://nucls.grand-challenge.org/)
- [论文（arXiv 2021）](https://arxiv.org/ftp/arxiv/papers/2102/2102.09099.pdf)
- [数据下载（Google Sites）](https://sites.google.com/view/nucls/single-rater)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{amgad2022nucls,
  title={NuCLS: A scalable crowdsourcing approach and dataset for nucleus classification, localization and segmentation in breast cancer},
  author={Amgad, Mohamed and Atteya, Lamees A and Hussein, Hagar and others},
  journal={GigaScience},
  volume={11},
  year={2022},
  publisher={Oxford University Press}
}
```

## 注意事项

1. **与 BCSS 的数据重叠**：图像来自同一批 TCGA 数据，联合使用时需避免训练/测试集污染。
2. **TCGA 使用协议**：数据来源于 TCGA，使用时遵守 TCGA 数据使用协议。
3. **单/多标注者版本选择**：建议研究中明确使用哪个版本，以保证结果可复现和可比较。
4. **类别不平衡**：肿瘤细胞核数量远多于其他类别，训练时需注意类别平衡策略。
