# TUPAC16_aux 数据集详情

## 数据集描述

TUPAC16_aux 是 **TUmor Proliferation Assessment Challenge 2016（TUPAC16）** 挑战赛的**辅助有丝分裂检测子数据集**，专注于乳腺癌组织病理图像中**有丝分裂图（Mitotic Figures）**的检测任务。

TUPAC16 是首个在全切片图像（WSI）尺度上进行乳腺肿瘤增殖评估的大规模挑战，由 Mitko Veta 等人组织，相关论文于 2019 年发表在 Medical Image Analysis 期刊上。辅助数据集（auxiliary mitosis dataset）作为第三个子任务，专门为参与者提供有丝分裂检测训练数据，与主任务（增殖评分预测）相辅相成。

### 背景意义

有丝分裂（mitosis）计数是评估乳腺癌肿瘤增殖活性（Ki-67 分级、有丝分裂评分）的重要组织病理学指标。病理学家手工计数耗时费力且存在主观性，自动化有丝分裂检测是计算病理学的核心问题之一。

### 数据来源

所有图像来源于乳腺癌 H&E 染色组织病理切片，由 73 位患者的组织活检中选取，每例提取约 10 个高倍视野（HPF，High-Power Fields），均为 40× 放大倍数下的感兴趣区域（ROI）图像。

## 数据集基本信息

- **器官类型**：乳腺 (Breast)
- **癌症类型**：乳腺癌（Breast Cancer）
- **染色方式**：H&E（苏木精-伊红）
- **图像类型**：感兴趣区域（ROI）图像补丁
- **图像格式**：PNG
- **图像数量**：约 656 张（来自 73 位患者，约 10 个 HPF/患者）
- **放大倍数**：40×
- **任务类型**：有丝分裂图检测（目标检测/点检测）
- **标注类型**：有丝分裂中心点坐标（文本文件 / CSV）
- **论文来源**：Medical Image Analysis, Volume 54, May 2019

## 文件结构

```
TUPAC_aux/
├── Train_Imgs/                      # 训练集图像
│   ├── img_001.png                  # H&E ROI 图像（PNG 格式）
│   ├── img_002.png
│   └── ...                          # 约 500+ 张
├── Test_Imgs/                       # 测试集图像
│   ├── img_xxx.png
│   └── ...
├── mitoses/                         # 有丝分裂标注（中心点坐标）
│   ├── img_001.txt                  # 每行：Y坐标,X坐标
│   ├── img_002.txt
│   └── ...
└── README.txt
```

> **替代标签仓库**（DeepMicroscopy/TUPAC16_AlternativeLabels）提供了额外的标注格式：
> ```
> TUPAC_AL/
> ├── mitoses_ground_truth/           # 有丝分裂标注 CSV
> │   └── img_XXX.csv                 # 列：Y坐标, X坐标
> ├── nonmitoses_ground_truth/        # 硬负例（非有丝分裂）标注
> │   └── img_XXX.csv
> └── ...
> ```

## 标注格式

### 原始标注：文本文件（中心点坐标）

每张图像对应一个文本文件（或 CSV），记录有丝分裂图的中心点坐标：

```
# img_001.txt 示例（每行一个有丝分裂图）
# 格式：Y坐标,X坐标（以像素为单位）
125,340
456,789
...
```

```python
import numpy as np

def load_mitosis_annotations(txt_path):
    """加载有丝分裂中心点标注"""
    coords = []
    with open(txt_path, "r") as f:
        for line in f:
            line = line.strip()
            if line:
                y, x = map(int, line.split(","))
                coords.append((y, x))
    return np.array(coords) if coords else np.zeros((0, 2), dtype=int)

# 示例使用
coords = load_mitosis_annotations("mitoses/img_001.txt")
print(f"有丝分裂数: {len(coords)}")
print(f"前3个坐标 (y, x):\n{coords[:3]}")
```

### 替代标注：SQLite 数据库（via SlideRunner）

```python
import sqlite3

def load_from_sqlite(db_path, slide_name):
    """通过 SQLite 加载替代标签"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    query = """
        SELECT ac.x, ac.y
        FROM Annotations a
        JOIN Annotations_coordinates ac ON a.uid = ac.annoid
        WHERE a.slide = ?
    """
    cursor.execute(query, (slide_name,))
    rows = cursor.fetchall()
    conn.close()
    return rows
```

## 标注情况

### 标注统计

| 统计项 | 数值 |
|-------|-----|
| 图像数量 | ~656 张 |
| 患者数量 | 73 位 |
| 每患者 HPF 数 | ~10 个 |
| 放大倍数 | 40× |
| 标注类型 | 有丝分裂中心点坐标 |
| 最佳 F1 成绩 | 0.652（挑战赛最优） |
| 对比 AMIDA13 | AMIDA13 最优为 0.612 |

> **注意**：有丝分裂图标注存在**弱监督性**（weakly-labeled nature），不同病理学家的标注一致性有限，替代标签（Alternative Labels）研究表明原始标签的可重复性约为 0.69 kappa 分数。

## 数据特点

### 任务难度

- **类别不平衡**：有丝分裂图在组织切片中极为稀少（~1–2 per HPF），负样本远多于正样本
- **形态多样**：有丝分裂各阶段（前期、中期、后期、末期）形态差异显著，且与类有丝分裂体（mitosis-like bodies）外观相近
- **病理学家差异**：标注者间一致性（Inter-rater agreement）约 0.61–0.71（Cohen's kappa），标注质量有限

### 数据集关系

| 数据集 | 与 TUPAC16_aux 关系 |
|--------|-------------------|
| AMIDA13 | 前驱挑战，任务定义相似，TUPAC16 参考其设计 |
| MIDOG 2021/2022 | 后续扩展挑战，MIDOG 使用 TUPAC16 图像并提供增强标注 |
| DeepMicroscopy 替代标签 | 对 TUPAC16 原始标注进行重新审核，提供质量更高的标注 |

### 与主数据集的关系

TUPAC16_aux 是 TUPAC16 主任务（WSI 增殖评分预测）的**辅助子任务数据集**：

```
TUPAC16 挑战
├── 主数据集：821 张 WSI（500 训练 + 321 测试）
│   ├── Task 1: 有丝分裂评分预测（κ=0.567 最优）
│   └── Task 2: PAM50 增殖评分（r=0.617 最优）
└── 辅助数据集（TUPAC16_aux）：~656 张 ROI 图像
    └── Task 3: 有丝分裂检测（F1=0.652 最优）
```

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
from pathlib import Path

def load_tupac16_aux(data_root):
    """加载 TUPAC16 辅助数据集"""
    data_root = Path(data_root)
    samples = []
    
    img_dir   = data_root / "Train_Imgs"
    annot_dir = data_root / "mitoses"
    
    for img_path in sorted(img_dir.glob("*.png")):
        annot_path = annot_dir / (img_path.stem + ".txt")
        
        img    = np.array(Image.open(img_path))
        coords = []
        
        if annot_path.exists():
            with open(annot_path) as f:
                for line in f:
                    line = line.strip()
                    if line:
                        y, x = map(int, line.split(","))
                        coords.append((y, x))
        
        samples.append({
            "image": img,
            "mitoses": np.array(coords) if coords else np.zeros((0, 2), dtype=int),
            "name": img_path.stem
        })
    
    return samples

dataset = load_tupac16_aux("TUPAC_aux")
mitosis_counts = [len(s["mitoses"]) for s in dataset]
print(f"共 {len(dataset)} 张图像")
print(f"平均每张有丝分裂数: {np.mean(mitosis_counts):.2f}")
print(f"最多: {max(mitosis_counts)}, 最少: {min(mitosis_counts)}")
```

### 检测结果格式与评估

```python
from collections import defaultdict

def compute_f1_mitosis(pred_coords, gt_coords, radius=25):
    """
    计算有丝分裂检测的 F1 分数
    - pred_coords: 预测的有丝分裂中心点列表，格式 [(y, x), ...]
    - gt_coords:   真实标注列表，格式 [(y, x), ...]
    - radius:      匹配半径（像素），通常为 25px（约为 1/4 细胞大小）
    """
    from scipy.spatial.distance import cdist
    
    if len(gt_coords) == 0 and len(pred_coords) == 0:
        return 1.0, 1.0, 1.0  # precision, recall, f1
    if len(gt_coords) == 0:
        return 0.0, 1.0, 0.0
    if len(pred_coords) == 0:
        return 1.0, 0.0, 0.0
    
    pred_arr = np.array(pred_coords)
    gt_arr   = np.array(gt_coords)
    
    # 计算所有预测与真实点之间的距离
    dists = cdist(pred_arr, gt_arr)
    
    # 贪心匹配（每个预测只能匹配一个真实点）
    matched_gt = set()
    tp = 0
    
    for i, pred in enumerate(pred_arr):
        min_dist_idx = np.argmin(dists[i])
        if dists[i, min_dist_idx] <= radius and min_dist_idx not in matched_gt:
            tp += 1
            matched_gt.add(min_dist_idx)
    
    precision = tp / len(pred_coords) if pred_coords else 0
    recall    = tp / len(gt_coords)   if gt_coords  else 0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    return precision, recall, f1
```

### 数据增强（针对有丝分裂检测）

```python
import albumentations as A

# 针对类别极度不平衡的数据增强策略
transform = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, p=0.4),
    # 模拟不同扫描仪和染色差异
    A.HueSaturationValue(hue_shift_limit=15, sat_shift_limit=15, p=0.3),
    # 局部形变增强泛化性
    A.ElasticTransform(alpha=50, sigma=5, p=0.2),
], keypoint_params=A.KeypointParams(format="yx", remove_invisible=True))
```

### 推荐模型

| 方法类型 | 模型 | 说明 |
|---------|------|------|
| 检测 | RetinaNet | TUPAC16 常用基线，替代标签仓库使用此架构 |
| 检测 | Faster R-CNN | 双阶段检测，精度较高 |
| 检测 | YOLO v8/v11 | 速度快，适合大规模推断 |
| 分类 | CNN + 滑动窗口 | 传统两阶段方法（先候选，后分类） |
| 端到端 | CenterNet/FCOS | anchor-free，适合点检测场景 |

### 评估指标

| 指标 | 说明 | 典型值 |
|------|------|-------|
| F1-score（IoU=0.5） | 主要评估指标，设定匹配半径 | 最优 0.652 |
| Precision | 预测精确率 | — |
| Recall | 预测召回率 | — |
| FROC（Free-Response ROC） | 自由响应 ROC 曲线 | — |

## 相关资源

- [TUPAC16 官方挑战网站](http://tupac.tue-image.nl/)（原站，部分页面可能已失效）
- [论文原文（MedIA 2019）](https://doi.org/10.1016/j.media.2019.02.012)
- [arXiv 预印本](https://arxiv.org/abs/1807.08284)
- [替代标签仓库（DeepMicroscopy）](https://github.com/DeepMicroscopy/TUPAC16_AlternativeLabels)
- [MIDOG 2022 数据集](https://midog2022.grand-challenge.org/)（扩展挑战，使用 TUPAC16 图像）
- [HuggingFace 数据集镜像](https://huggingface.co/datasets/RobberMJ/tupac)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{veta2019predicting,
  title={Predicting breast tumor proliferation from whole-slide images: The TUPAC16 challenge},
  author={Veta, Mitko and Heng, Yujing J and Stathonikos, Nikolas and Bejnordi, Babak Ehteshami and Beca, Francisco and Wollmann, Thomas and Rohr, Karl and Shah, Manan A and Wang, Dayong and Bhargava, Rohit and others},
  journal={Medical Image Analysis},
  volume={54},
  pages={111--121},
  year={2019},
  publisher={Elsevier},
  doi={10.1016/j.media.2019.02.012}
}
```

若使用了替代标签，请同时引用：

```bibtex
@inproceedings{bertram2020pathologist,
  title={Are pathologist-defined labels reproducible? Comparison of the TUPAC16 mitotic figure dataset with an alternative set of labels},
  author={Bertram, Christof A and Veta, Mitko and Marzahl, Christian and Stathonikos, Nikolas and Maier, Andreas and Klopfleisch, Robert and Aubreville, Marc},
  booktitle={Interpretability of Machine Intelligence in Medical Image Computing and Multimodal Learning for Clinical Decision Support},
  pages={204--213},
  year={2020},
  organization={Springer}
}
```

## 注意事项

1. **弱监督标注**：原始标注由病理学家人工完成，标注者间一致性约为 kappa ≈ 0.69，建议结合替代标签（DeepMicroscopy 版本）以获得更高质量的监督信号。
2. **类别极度不平衡**：有丝分裂图极为稀少，训练时需使用焦点损失（Focal Loss）、过采样或难负样本挖掘（Hard Negative Mining）等策略。
3. **数据集规模**：~656 张 ROI 图像，规模有限，建议与 MIDOG 2021/2022、AMIDA13 等数据集联合训练。
4. **放大倍数固定**：所有图像均为 40× 倍率，跨放大倍数泛化能力未经验证，跨域检测时需注意分辨率匹配。
5. **与主任务关系**：若同时进行 WSI 级增殖评分预测，需注意主数据集（821 张 WSI）与辅助数据集（~656 张 ROI）的图像来源可能存在重叠。
6. **官方网站状态**：TUPAC16 挑战官网（tupac.tue-image.nl）部分资源可能已失效，建议通过 HuggingFace 镜像或替代标签仓库获取数据。
