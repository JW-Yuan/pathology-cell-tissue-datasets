# CAMELYON17 数据集详情

## 数据集描述

CAMELYON17（Cancer Metastases in Lymph Nodes Challenge 2017）是 CAMELYON16 的升级版挑战赛数据集，将任务从单张 WSI 的转移检测提升到**患者级别**的淋巴结转移状态分类。数据来自荷兰五家医疗机构。

### 与 CAMELYON16 的区别

| 特性 | CAMELYON16 | CAMELYON17 |
|------|-----------|-----------|
| 分析粒度 | 切片级（Slide） | 患者级（Patient） |
| 数据量 | 400 张 WSI | 1000 张 WSI（500 train + 500 test） |
| 机构数 | 2 | 5 |
| 核心任务 | 转移区域检测 | pN 分期预测 |

## 数据集基本信息

- **器官类型**：淋巴结（Lymph Node）— 乳腺癌前哨淋巴结转移
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：500 张 WSI（100 例患者，每例 5 张）
  - 测试集：500 张 WSI（100 例患者，每例 5 张）
- **分析级别**：患者级分析（Patient-Level Analysis）
- **任务类型**：分类（classi）+ 分割（seg）

## 数据集划分

| 子集 | 患者数 | WSI 数/患者 | WSI 总数 |
|------|--------|------------|---------|
| 训练集 | 100 | 5 | 500 |
| 测试集 | 100 | 5 | 500 |
| **合计** | **200** | — | **1000** |

每位患者有 5 张前哨淋巴结 WSI，对应 5 个淋巴结。

## 标注格式

### 训练集标注（两级）

**1. 切片级标注（Slide-Level）**

| 标签 | 含义 |
|------|------|
| negative | 无转移 |
| itc | 孤立肿瘤细胞（< 0.2mm） |
| micro | 微转移（0.2–2mm） |
| macro | 宏观转移（> 2mm） |

**2. 像素级掩码（Pixel-Level，部分切片）**

- 仅 macro 和 micro 类型的 WSI 提供像素级分割掩码
- itc 类型提供点标注

### 患者级 pN 分期（核心预测目标）

| pN 分期 | 含义 |
|---------|------|
| pN0 | 所有淋巴结阴性 |
| pN0(i+) | 仅含 ITC |
| pN1mi | 微转移（0.2–2mm） |
| pN1 | 1–3 个淋巴结宏观转移 |
| pN2 | 4–9 个淋巴结宏观转移 |

## 数据特点

### 多机构数据
- 来自荷兰 5 家医疗机构，域间差异显著
- 适合测试跨机构泛化能力

### 患者级别分析挑战
- 需要聚合同一患者 5 张 WSI 的信息进行综合判断
- 模拟真实临床工作流程

### 分层难度
- ITC（孤立肿瘤细胞）检测是最大挑战
- 假阴性（漏诊转移）比假阳性（过诊断）的临床危害更大

## 使用建议

### 数据组织结构

```
camelyon17/
├── training/
│   ├── centre_0/
│   │   ├── patient_000_node_0.tif
│   │   ├── patient_000_node_1.tif
│   │   ...
│   │   └── patient_000_node_4.tif
│   ├── centre_1/
│   ...
│   └── stage_labels.csv  # 患者级 pN 分期标签
└── testing/
    └── ...
```

### 数据加载

```python
import pandas as pd
import openslide
import os

# 加载患者级别标签
labels_df = pd.read_csv('stage_labels.csv')
# 列: patient, stage (pN0, pN0(i+), pN1mi, pN1, pN2)

# 加载单张 WSI
def load_wsi_tiles(wsi_path, tile_size=256, level=1):
    wsi = openslide.OpenSlide(wsi_path)
    w, h = wsi.level_dimensions[level]
    tiles = []
    for y in range(0, h - tile_size, tile_size):
        for x in range(0, w - tile_size, tile_size):
            tile = wsi.read_region(
                (x * wsi.level_downsamples[level],
                 y * wsi.level_downsamples[level]),
                level, (tile_size, tile_size)
            )
            tiles.append(np.array(tile.convert('RGB')))
    return tiles
```

### 典型处理流程

```python
# CAMELYON17 两阶段流程
# Stage 1: 切片级转移检测（复用 CAMELYON16 的思路）
# Stage 2: 患者级 pN 分期（聚合 5 张 WSI 的预测结果）

def predict_patient_stage(slide_predictions):
    """
    slide_predictions: list of (slide_label, confidence) for 5 slides
    Returns: patient pN stage
    """
    macro_count = sum(1 for label, _ in slide_predictions if label == 'macro')
    micro_count = sum(1 for label, _ in slide_predictions if label == 'micro')
    itc_count = sum(1 for label, _ in slide_predictions if label == 'itc')
    
    if macro_count >= 4:
        return 'pN2'
    elif macro_count >= 1:
        return 'pN1'
    elif micro_count >= 1:
        return 'pN1mi'
    elif itc_count >= 1:
        return 'pN0(i+)'
    else:
        return 'pN0'
```

## 相关资源

- [Grand Challenge 官方页](https://camelyon17.grand-challenge.org/)
- [论文（IEEE TMI 2018）](https://ieeexplore.ieee.org/document/8447230)
- [百度网盘下载](https://pan.baidu.com/s/1mIzSewImtEisclPtTHGSyw)
- [AWS 公开数据集](https://registry.opendata.aws/camelyon/)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{bandi2018detection,
  title={From detection of individual metastases to classification of lymph node status at the patient level: The CAMELYON17 challenge},
  author={Bandi, Peter and Geessink, Oscar and Manson, Quirine and others},
  journal={IEEE Transactions on Medical Imaging},
  volume={38},
  number={2},
  pages={550--560},
  year={2018},
  publisher={IEEE}
}
```

## 注意事项

1. **多机构差异**：5 个医疗机构的图像在颜色、对比度方面差异明显，建议进行颜色归一化。
2. **患者级评估**：最终评估以患者 pN 分期为准，需将 5 张 WSI 的结果进行聚合。
3. **ITC 处理**：ITC 仅提供点标注而非像素掩码，处理方式与 macro/micro 不同。
4. **训练集标注完整性**：并非所有训练 WSI 都有像素级掩码，部分仅有切片级标签。
