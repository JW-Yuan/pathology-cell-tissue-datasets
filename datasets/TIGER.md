# TIGER 数据集详情

## 数据集描述

TIGER（**T**umor **I**nfiltratinG lymphocytes in breast cancER）是**第一个**专注于乳腺癌 H&E 切片中肿瘤浸润淋巴细胞（TILs）**全自动化评估**的挑战性数据集，由荷兰拉德堡德大学医学中心（Radboudumc）诊断图像分析组（DIAG）联合**国际免疫肿瘤生物标志物工作组**（TIL Working Group）共同发起。

### 背景意义

TILs（Tumor-Infiltrating Lymphocytes，肿瘤浸润淋巴细胞）是乳腺癌重要的预后生物标志物，其量化评估目前主要依赖病理学家的人工判读，存在主观性强、可重复性差等问题。TIGER 挑战旨在推动 AI 自动化 TILs 评估在临床实践中的落地。

### 数据来源

| 来源机构 | 缩写 | 病例类型 | 数量 |
|---------|------|---------|------|
| The Cancer Genome Atlas | TCGA | 三阴性乳腺癌（TNBC） | 151 张 WSI |
| 荷兰 Radboud 大学医学中心 | RUMC | TNBC + Her2 阳性 | 26 张 WSI |
| 比利时 Jules Bordet 研究所 | JB | TNBC + Her2 阳性 | 18 张 WSI |

## 数据集基本信息

- **器官类型**：乳腺 (Breast)
- **癌症类型**：三阴性乳腺癌（TNBC）+ Her2 阳性乳腺癌
- **染色方式**：H&E（苏木精-伊红）
- **图像类型**：全切片图像（Whole Slide Images, WSIs）
- **图像分辨率**：约 0.5 μm/px（微米/像素）
- **图像格式**：多分辨率 TIF
- **任务类型**：TILs 检测（淋巴细胞/浆细胞点检测）+ 组织语义分割 + TILs 评分预测
- **数据许可**：CC BY-NC 4.0（TCGA 图像遵循 TCGA 原始使用条款）

## 数据集规模

### 训练数据（三个子集）

| 子集名称 | 数据量 | 内容描述 |
|---------|--------|---------|
| **WSIROIS** | 195 张 WSI | 含手动标注的兴趣区域（ROI），像素级组织分割 + 细胞检测 |
| └─ TCGA | 151 张 | TNBC，来自 TCGA-BRCA 档案 |
| └─ RUMC | 26 张 | TNBC 和 Her2+，来自 Radboud 大学医学中心 |
| └─ JB | 18 张 | TNBC 和 Her2+，来自 Jules Bordet 研究所 |
| **WSIBULK** | 93 张 WSI | 含肿瘤大体区域粗略多边形标注 |
| **WSITILS** | 82 张 WSI | 含全切片级别的 TILs 视觉评估分数（CSV） |
| **训练集合计** | **370 张 WSI** | — |

### 测试数据

| 测试集 | Leaderboard 1 | Leaderboard 2 |
|--------|---------------|---------------|
| 实验测试集 | 26 张 WSI（130 个 ROI） | 200 张 WSI |
| 最终测试集 | 38 张 WSI（149 个 ROI） | 707 张 WSI |

> 测试集对参与者不可见，仅用于最终评估。

## 文件结构

```
tiger-training/
├── wsirois/                         # WSIROIS 子集（详细标注）
│   ├── wsi/                         # 全切片图像（多分辨率 TIF）
│   ├── wsi-level-annotations/       # WSI 级标注
│   │   ├── *.tif                    # 像素级组织类别掩膜（多分辨率）
│   │   └── *.xml                    # 多边形标注（ASAP 2.0 兼容 XML）
│   └── roi-level-annotations/       # ROI 级标注
│       ├── images/                  # 裁剪后的 ROI 图像（PNG）
│       ├── masks/                   # 像素级组织类别掩膜（PNG）
│       └── annotations/             # COCO 格式 JSON（细胞点检测）
├── wsibulk/                         # WSIBULK 子集（粗略标注）
│   ├── wsi/                         # 全切片图像
│   └── annotations/                 # 肿瘤大体区域多边形标注
├── wsitils/                         # WSITILS 子集（TILs 评分）
│   ├── wsi/                         # 全切片图像
│   └── tiger-til-scores-wsitils.csv # TILs 评分文件（每张切片一个分数）
└── data-structure.txt               # 数据结构说明
```

## 标注格式

### 组织语义分割标注（7 类）

| 标签值 | 英文名称 | 中文含义 |
|-------|---------|---------|
| 0 | exclude | 排除/忽略区域 |
| 1 | invasive tumor | 浸润性肿瘤 |
| 2 | tumor-associated stroma | 肿瘤相关间质 |
| 3 | in-situ tumor | 原位肿瘤 |
| 4 | healthy glands | 健康腺体 |
| 5 | necrosis not in-situ | 非原位坏死 |
| 6 | inflamed stroma | 炎性间质 |
| 7 | rest | 其他组织 |

### 细胞检测标注

- **检测目标**：淋巴细胞（Lymphocytes）和浆细胞（Plasma cells）合并为单一类别
- **标注形式**：中心点 + 固定大小边界框（8×8 微米）
- **格式**：ASAP 2.0 兼容 XML（WSI 级）或 COCO 格式 JSON（ROI 级）

### TILs 评分

- **格式**：CSV 文件，每张切片一行，包含 WSI 文件名和对应的 TILs 百分比分数（0–100）
- **标注依据**：国际 TIL 工作组 2014 年推荐标准（Salgado et al.）

## 数据特点

### 多中心、多机构数据

整合了来自 TCGA 公共档案与两个欧洲顶级医疗中心（RUMC、JB）的数据，增强了模型的跨机构泛化能力。

### 三级任务层次

数据集同时支持三个粒度层次的任务：
1. **细胞级**：点检测（淋巴细胞/浆细胞定位）
2. **组织级**：7类语义分割（肿瘤区域识别）
3. **切片级**：TILs 评分回归（最终临床评估指标）

### 多格式标注协同

- WSI 级标注：多分辨率 TIF 掩膜 + ASAP XML 多边形
- ROI 级标注：PNG 掩膜 + COCO JSON

### 临床意义导向

挑战核心目标不仅是计算机视觉性能，更强调 **AI 生成的 TIL 评分与患者预后的相关性**（独立预后价值验证）。

## 使用建议

### 数据加载

```python
import openslide
import json
import pandas as pd
from pathlib import Path
import xml.etree.ElementTree as ET

# 1. 加载全切片图像（WSI）
wsi_path = "tiger-training/wsirois/wsi/TCGA-A1-A0SK-01Z-00-DX1.tif"
slide = openslide.OpenSlide(wsi_path)
# 获取 WSI 基本信息
print(f"WSI 尺寸: {slide.dimensions}")
print(f"可用分辨率层数: {slide.level_count}")

# 2. 加载 ROI 级标注（COCO JSON）
with open("tiger-training/wsirois/roi-level-annotations/annotations/sample.json") as f:
    coco_data = json.load(f)

# 获取细胞检测标注
annotations = coco_data["annotations"]
for ann in annotations[:3]:
    print(f"Bbox: {ann['bbox']}, Category: {ann['category_id']}")

# 3. 加载 TILs 评分（WSITILS 子集）
til_scores = pd.read_csv(
    "tiger-training/wsitils/tiger-til-scores-wsitils.csv"
)
print(til_scores.head())

# 4. 加载 ROI 级组织分割掩膜（PNG）
from PIL import Image
import numpy as np

mask = np.array(Image.open("path/to/roi_mask.png"))
# 类别映射
class_map = {
    0: "exclude", 1: "invasive_tumor", 2: "tumor_stroma",
    3: "insitu_tumor", 4: "healthy_glands", 5: "necrosis",
    6: "inflamed_stroma", 7: "rest"
}
unique_labels = np.unique(mask)
print("存在的类别:", [class_map[l] for l in unique_labels if l in class_map])
```

### 数据下载

```bash
# 通过 AWS CLI 下载（无需 AWS 账户）
aws s3 cp s3://tiger-training/ /path/to/destination/ --recursive --no-sign-request
```

### 模型推荐

1. **TILs 检测**：适合 FCOS、CenterNet 等 anchor-free 检测器（因为边界框大小固定）
2. **组织分割**：推荐 SegFormer、HoVer-Net、HoverNext 等多类分割模型
3. **端到端 TIL 评分**：基于 MIL（Multiple Instance Learning）的弱监督方法

### 评估指标

| 任务 | 评估指标 | 说明 |
|------|---------|------|
| 细胞检测 | F1-score（IoU=0.5） | 淋巴细胞/浆细胞点检测性能 |
| 组织分割 | Dice coefficient | 各组织类别分割性能 |
| TIL 评分（L1） | Spearman 相关系数 | 与病理学家评分的相关性 |
| TIL 评分（L2） | C-index（一致性指数） | 与患者生存预后的相关性 |

## 相关资源

- [官方挑战网站](https://tiger.grand-challenge.org/)
- [数据下载页面](https://tiger.grand-challenge.org/Data/)
- [AWS 开放数据](https://registry.opendata.aws/tiger/)
- [官方代码](https://tiger.grand-challenge.org/Code/)
- [国际 TIL 工作组](https://www.tilsinbreastcancer.org/)
- [论文 TIAger](https://arxiv.org/abs/2206.11943)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{tiger_challenge,
  title={TIGER: Tumor-Infiltrating Lymphocyte Scoring in Breast Cancer},
  author={Studer, Linda and others},
  journal={Grand Challenge},
  year={2022},
  url={https://tiger.grand-challenge.org/}
}
```

## 注意事项

1. **数据许可**：RUMC 和 JB 图像及所有标注采用 CC BY-NC 4.0 协议（**仅限非商业用途**）；TCGA 图像遵循 TCGA 原始使用条款，请单独核实。
2. **测试集不可见**：最终测试集和评估仅在官方挑战平台进行，无法本地复现。
3. **标注一致性**：细胞标注来自多位病理学家，标注指南基于 TIL 工作组 2014 年国际标准。
4. **评分标准**：挑战以"TIL 评分的预后价值"为主要终点，而非传统 mAP/Dice 等纯视觉指标，评估时需注意任务定义差异。
5. **多分辨率处理**：WSI 以约 0.5 μm/px 分辨率存储，读取时建议使用 `openslide` 并合理选择分辨率层（level）以平衡计算资源。
6. **TCGA 数据重叠**：TCGA 子集与 BCSS、NuCLS 数据集有重叠，使用时注意去重以避免训练/测试泄漏。
