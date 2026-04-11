# MIDOG 2022 数据集详情

## 数据集描述

MIDOG 2022（MItosis DOmain Generalization Challenge 2022）是 MICCAI 2022 举办的有丝分裂图（Mitotic Figure）检测挑战赛数据集，专注于**跨肿瘤类型、跨实验室、跨物种**的有丝分裂图检测域泛化（Domain Generalization）问题。

### 核心挑战

深度学习模型在有丝分裂检测任务中面临**域偏移（Domain Shift）**问题：不同肿瘤类型、不同扫描仪、不同组织制备方法会导致图像外观差异，严重影响模型跨域泛化性能。

## 数据集基本信息

- **器官类型**：多器官（训练 6 种肿瘤，测试 10 种肿瘤）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：405 例，9,501 个有丝分裂图标注
  - 测试集：含 10 种肿瘤类型（部分未见于训练集）
- **图像类型**：Patch 图像
- **任务类型**：分割/检测（Detection of Mitotic Figures）

## 肿瘤类型覆盖

### 训练集（6 种）

| 肿瘤类型 | 来源物种 | 说明 |
|---------|---------|------|
| 乳腺癌（Breast carcinoma） | 人 | 最常见，MIDOG 2021 已包含 |
| 肺癌（Lung carcinoma） | 人 | 新增 |
| 淋巴瘤（Lymphoma） | 人 | 新增 |
| 黑色素瘤（Melanoma） | 人 | 新增 |
| 犬乳腺肿瘤（Canine mammary tumor） | 犬 | 跨物种 |
| 犬肺癌（Canine lung carcinoma） | 犬 | 跨物种 |

### 测试集（10 种，包含训练中未见的类型）

训练集的 6 种 + 额外 4 种（测试时不公开，用于评估泛化能力）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 训练病例数 | 405 |
| 训练有丝分裂标注数 | 9,501 |
| 训练图像类型 | 病理 ROI Patch |

## 标注格式

### JSON 格式标注

```python
import json
import numpy as np
from PIL import Image

# 加载图像
img = np.array(Image.open('mitosis_sample.png').convert('RGB'))

# 加载有丝分裂图标注（通常为 JSON 格式，包含中心点坐标）
with open('mitosis_sample_annotations.json', 'r') as f:
    annotations = json.load(f)

# 格式示例：
# {
#   "mitotic_figures": [
#     {"x": 320, "y": 450, "label": "mitosis"},
#     ...
#   ],
#   "hard_negatives": [...]
# }

mitotic_centers = [(ann['x'], ann['y']) for ann in annotations['mitotic_figures']]
```

### SQLite/QuPath 格式

- MIDOG 系列数据集使用 QuPath 格式进行标注
- 训练数据通过 Zenodo 提供，含有对应的标注 JSON 文件

## 数据特点

### 跨域泛化设计
- 测试集包含训练集中未见过的肿瘤类型，专门评估模型泛化能力
- 跨物种（人类 + 犬类）设计进一步增加了域差异

### 有丝分裂检测挑战
- 有丝分裂图（Mitotic Figures）在 H&E 切片中极为稀少，类别极不平衡
- 与类似染色的"有丝分裂模拟物"（Mitosis-like Structures）区分困难

### 难负样本设计
- 数据集包含专门标注的**难负样本（Hard Negatives）**，即形态上与有丝分裂图相似的非有丝分裂细胞

## 使用建议

### 数据加载

```python
import json
import numpy as np
from PIL import Image

def load_midog_annotations(ann_path):
    """加载 MIDOG 标注"""
    with open(ann_path, 'r') as f:
        data = json.load(f)
    
    mitoses = []
    for ann in data.get('annotations', []):
        if ann.get('category_id') == 1:  # 1: 有丝分裂
            bbox = ann['bbox']  # [x, y, w, h] COCO 格式
            cx = bbox[0] + bbox[2] / 2
            cy = bbox[1] + bbox[3] / 2
            mitoses.append({'center': (cx, cy), 'bbox': bbox})
    
    return mitoses
```

### 评估指标

```python
# MIDOG 使用 F1 分数（基于距离阈值）
def compute_detection_f1(pred_centers, gt_centers, threshold=25):
    """
    pred_centers: list of (x, y) 预测有丝分裂中心点
    gt_centers:   list of (x, y) 真实有丝分裂中心点
    threshold:    匹配距离阈值（像素）
    """
    from scipy.spatial.distance import cdist
    
    if not pred_centers or not gt_centers:
        return 0.0
    
    dist_matrix = cdist(pred_centers, gt_centers)
    matched_gt = set()
    tp = 0
    
    for i, pred in enumerate(pred_centers):
        nearest = np.argmin(dist_matrix[i])
        if dist_matrix[i, nearest] <= threshold and nearest not in matched_gt:
            tp += 1
            matched_gt.add(nearest)
    
    fp = len(pred_centers) - tp
    fn = len(gt_centers) - tp
    
    precision = tp / (tp + fp + 1e-8)
    recall = tp / (tp + fn + 1e-8)
    f1 = 2 * precision * recall / (precision + recall + 1e-8)
    
    return f1
```

## 相关资源

- [Grand Challenge 官方页](https://midog2022.grand-challenge.org/)
- [挑战赛主页](https://midog.deepmicroscopy.org/)
- [Zenodo 训练数据](https://zenodo.org/records/6547151)
- [论文（MedIA 2024）](https://www.sciencedirect.com/science/article/pii/S136184152400080X)
- [MIDOG++ 扩展数据集（Nature Scientific Data）](https://www.nature.com/articles/s41597-023-02327-4)
- [Google Drive 下载](https://drive.google.com/drive/folders/1P73g1xg8jw_JGLJaDFQDnxwQA7ROVykA)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{midog2022,
  title={Domain generalization across tumor types, laboratories, and species -- insights from the 2022 edition of the Mitosis Domain Generalization Challenge},
  author={Aubreville, Marc and others},
  journal={Medical Image Analysis},
  year={2024}
}
```

## 注意事项

1. **跨域测试集**：测试集包含训练集中未见过的肿瘤类型，评估模型真实泛化能力。
2. **极端类别不平衡**：有丝分裂图相对于整张切片极为稀少，负样本远多于正样本。
3. **难负样本**：需特别处理有丝分裂"模拟物"（如凋亡细胞、核分裂象）的假阳性问题。
4. **MIDOG++**：2023 年发布了 MIDOG++ 扩展版本，覆盖更多肿瘤类型，适合更全面的研究。
