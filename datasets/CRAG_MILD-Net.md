# CRAG - MILD-Net 数据集详情

## 数据集描述

CRAG（Colon gRAnd Gland segmentation dataset）是一个专门用于**结肠腺体实例分割**的数据集，随 MILD-Net（Minimal Information Loss Dilated Network）论文一同发布（2019）。数据集由英国华威大学 TIA（Tissue Image Analysis）中心提供。

### 临床背景

结肠腺体（Gland）的分割对于结肠癌的分级（Grading）和预后评估具有重要意义。CRAG 数据集支持从组织级别量化腺体形态特征。

## 数据集基本信息

- **器官类型**：结肠（Colon）— 结肠腺癌（Colorectal Adenocarcinoma）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：173 张
  - 验证集：40 张
  - 共 213 张图像
- **图像分辨率**：约 1500×1500 像素（尺寸可变）
- **放大倍数**：20x
- **任务类型**：分割（Gland Instance Segmentation）

## 数据集规模

| 子集 | 图像数 | 说明 |
|------|--------|------|
| 训练集 | 173 | 含腺体实例标注 |
| 验证集 | 40 | 含腺体实例标注 |
| **合计** | **213** | — |

## 标注格式

### 像素级实例掩码

- 每张图像对应一个**实例分割掩码**（PNG 格式）
- 掩码像素值为腺体实例 ID（0 为背景，非零值为各腺体实例的唯一 ID）

```python
import numpy as np
from PIL import Image

# 加载图像
img = np.array(Image.open('train/Images/image_001.png').convert('RGB'))

# 加载腺体实例掩码
mask = np.array(Image.open('train/Annotation/image_001.png'))
# 0: 背景，非零: 腺体实例 ID

# 获取所有腺体实例
gland_ids = np.unique(mask)
gland_ids = gland_ids[gland_ids != 0]
print(f"图像中腺体数量: {len(gland_ids)}")

# 提取单个腺体的掩码
for gland_id in gland_ids:
    single_gland_mask = (mask == gland_id).astype(np.uint8)
```

### 文件目录结构

```
crag/
├── train/
│   ├── Images/      # 训练图像 (.png)
│   └── Annotation/  # 实例掩码 (.png)
└── valid/
    ├── Images/      # 验证图像 (.png)
    └── Annotation/  # 实例掩码 (.png)
```

## 腺体形态特征

CRAG 数据集覆盖了从分化良好（Well-differentiated）到分化低下（Poorly-differentiated）的多种腺体形态：

| 分化程度 | 形态特征 |
|---------|---------|
| 分化良好 | 腺体结构规则，轮廓清晰，腺腔明显 |
| 中度分化 | 腺体形态不规则，部分融合 |
| 分化低下 | 腺体结构破坏，难以辨认腔结构 |

## 数据特点

### MILD-Net 配套数据集
- 与 MILD-Net 方法共同发布，是腺体分割领域的重要基准
- 与 GlaS 数据集并列为腺体分割的两大标准测试集

### 大分辨率 Patch
- 约 1500×1500 px 的大尺寸图像，包含更多腺体上下文信息
- 相比 GlaS（几百像素），CRAG 图像内腺体更多，挑战更大

### 多样性
- 涵盖不同分化程度的腺体，形态多样

## 使用建议

### 与 GlaS 数据集的对比

| 特性 | GlaS | CRAG |
|------|------|------|
| 图像数 | 165 | 213 |
| 分辨率 | 几百像素 | ~1500px |
| 每图腺体数 | 5–15 个 | 更多 |
| 来源 | Zeiss MIRAX MIDI | Warwick TIA |

### 数据加载与预处理

```python
import numpy as np
from PIL import Image
import glob

def load_crag_dataset(split='train', root='crag/'):
    img_paths = sorted(glob.glob(f'{root}{split}/Images/*.png'))
    ann_paths = sorted(glob.glob(f'{root}{split}/Annotation/*.png'))
    
    dataset = []
    for img_p, ann_p in zip(img_paths, ann_paths):
        img = np.array(Image.open(img_p).convert('RGB'))
        ann = np.array(Image.open(ann_p))  # 实例 ID 掩码
        binary = (ann > 0).astype(np.uint8)  # 二值前景掩码
        dataset.append({'image': img, 'instance_map': ann, 'binary_mask': binary})
    return dataset
```

### 评估指标

```python
# 腺体分割常用 CRAG 评估指标（与 GlaS 一致）
# 1. F1 分数（对象级别）
# 2. Ojaccard（对象级 Jaccard）

def object_f1(pred_inst, gt_inst):
    """
    对象级 F1 分数
    - 预测实例与真实实例之间进行最大 IoU 匹配
    - TP: IoU > 0.5 的匹配对
    """
    pass  # 参见 GlaS/CRAG 官方评估代码
```

## 相关资源

- [数据集下载（Warwick TIA）](https://warwick.ac.uk/fac/cross_fac/tia/data/mildnet/)
- [论文（MedIA 2019）](https://www.sciencedirect.com/science/article/abs/pii/S1361841518306030?via%3Dihub)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{graham2019mild,
  title={MILD-Net: Minimal information loss dilated network for gland instance segmentation in colon histology images},
  author={Graham, Simon and Chen, Hao and Gamper, Jevgenij and Dou, Qi and Heng, Pheng-Ann and Snead, David and Tsang, Yee Wah and Rajpoot, Nasir},
  journal={Medical Image Analysis},
  volume={52},
  pages={199--211},
  year={2019},
  publisher={Elsevier}
}
```

## 注意事项

1. **大尺寸图像**：约 1500×1500 px 的图像需要足够的显存，训练时建议裁剪为 512×512 或 768×768 的 patch。
2. **实例掩码格式**：掩码图像像素值为实例 ID（非二值），直接作为语义掩码使用时需转换。
3. **与 GlaS 联合**：CRAG 和 GlaS 常作为腺体分割的互补基准，建议同时报告。
4. **数据访问**：通过 Warwick TIA 官方页面申请下载。
