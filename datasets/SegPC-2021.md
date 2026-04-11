# SegPC-2021 数据集详情

## 数据集描述

SegPC-2021（Segmentation of Plasma Cells 2021）是一个专用于**骨髓涂片图像中浆细胞分割**的挑战赛数据集，专注于多发性骨髓瘤（Multiple Myeloma）的浆细胞分割任务，包含细胞核（Nucleus）和细胞质（Cytoplasm）两个结构的独立分割标注。

### 临床背景

多发性骨髓瘤是浆细胞（Plasma Cell）的恶性肿瘤，准确的浆细胞分割对于肿瘤负荷评估和疾病监测具有重要意义。

## 数据集基本信息

- **器官类型**：血液（Blood）— 骨髓浆细胞
- **染色方式**：Jenner-Giemsa 染色（不同于 H&E）
- **数据集大小**：775 张图像（Train: 298, Valid: 200, Test: 277）
- **图像分辨率**：2040×1536 或 1920×2560 像素
- **任务类型**：分割（两结构：细胞核 + 细胞质）

## 数据集划分

| 子集 | 数量 | 说明 |
|------|------|------|
| 训练集 | 298 | 含核 + 胞质掩码 |
| 验证集 | 200 | 含核 + 胞质掩码 |
| 测试集 | 277 | 评估用 |
| **合计** | **775** | — |

## Jenner-Giemsa 染色特点

| 结构 | 颜色（Jenner-Giemsa）| 说明 |
|------|---------------------|------|
| 细胞核 | 深紫色/蓝紫色 | 浆细胞核通常偏心分布 |
| 细胞质 | 蓝色（深浅不一）| 浆细胞质富含免疫球蛋白，深蓝 |
| 背景/RBC | 淡粉色/无色 | 红细胞（RBC）背景 |

## 标注格式

### 双结构分割掩码

```python
import numpy as np
from PIL import Image

# 加载骨髓涂片图像（大尺寸）
img = np.array(Image.open('bm_001.jpg').convert('RGB'))
# 尺寸: (2040, 1536, 3) 或 (1920, 2560, 3)

# 加载细胞核掩码（Nucleus mask）
nucleus_mask = np.array(Image.open('bm_001_nucleus.png').convert('L'))
# 0: 背景, 非零: 浆细胞核区域

# 加载细胞质掩码（Cytoplasm mask，包含整个细胞区域）
cyto_mask = np.array(Image.open('bm_001_cytoplasm.png').convert('L'))
# 0: 背景, 非零: 整个浆细胞（核 + 胞质）

# 纯胞质区域 = 细胞质掩码 - 细胞核掩码
pure_cytoplasm = ((cyto_mask > 0) & (nucleus_mask == 0)).astype(np.uint8)
```

### 文件结构

```
segpc2021/
├── x/              # 原始骨髓涂片图像
├── y/              # 分割掩码
│   ├── nucleus/    # 细胞核掩码 (PNG)
│   └── cytoplasm/  # 细胞质掩码 (PNG)
└── train.csv       # 训练集文件列表
```

## 数据特点

### 双结构分割
- 同时标注细胞核（Nucleus）和细胞质（Cytoplasm），提供完整的浆细胞形态信息
- 是骨髓细胞分析中最细粒度的结构分割任务之一

### Jenner-Giemsa 染色
- 非 H&E 染色，颜色分布与组织病理图像完全不同
- 适合研究跨染色方式的分割方法泛化能力

### 大分辨率图像
- 约 200 万像素的高分辨率图像，细胞结构清晰可见
- 每张图像通常含多个浆细胞

## 使用建议

### 数据加载与 Patch 提取

```python
import numpy as np
from PIL import Image

def extract_cell_crops(img, cyto_mask, nucleus_mask, pad=20):
    """从大图中裁剪每个浆细胞的感兴趣区域"""
    from scipy import ndimage as ndi
    
    # 找到各细胞实例（假设掩码为实例掩码）
    labeled, num_cells = ndi.label(cyto_mask > 0)
    
    crops = []
    for cell_id in range(1, num_cells + 1):
        cell_region = (labeled == cell_id)
        
        # 获取边界框
        rows = np.any(cell_region, axis=1)
        cols = np.any(cell_region, axis=0)
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        
        # 添加 padding
        rmin = max(0, rmin - pad)
        rmax = min(img.shape[0], rmax + pad)
        cmin = max(0, cmin - pad)
        cmax = min(img.shape[1], cmax + pad)
        
        crops.append({
            'image': img[rmin:rmax, cmin:cmax],
            'nucleus': nucleus_mask[rmin:rmax, cmin:cmax],
            'cytoplasm': cyto_mask[rmin:rmax, cmin:cmax],
            'cell_id': cell_id
        })
    
    return crops
```

### 评估指标

```python
# SegPC-2021 官方评估：对每个细胞的分割质量单独评估
def evaluate_cell_segmentation(pred_nucleus, pred_cytoplasm, gt_nucleus, gt_cytoplasm):
    """评估单个细胞的分割质量"""
    # 细胞核 Dice
    nucleus_dice = 2 * (pred_nucleus * gt_nucleus).sum() / \
                   (pred_nucleus.sum() + gt_nucleus.sum() + 1e-8)
    
    # 细胞质 Dice（整个细胞区域）
    cyto_dice = 2 * (pred_cytoplasm * gt_cytoplasm).sum() / \
                (pred_cytoplasm.sum() + gt_cytoplasm.sum() + 1e-8)
    
    return {
        'Nucleus_Dice': nucleus_dice,
        'Cytoplasm_Dice': cyto_dice,
        'Mean_Dice': (nucleus_dice + cyto_dice) / 2
    }
```

## 相关资源

- [Grand Challenge 官方页](https://segpc-2021.grand-challenge.org/)
- [GitHub 代码](https://github.com/dsciitism/SegPC-2021)
- [Kaggle 数据集](https://www.kaggle.com/datasets/sbilab/segpc2021dataset/data)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{segpc2021,
  title={SegPC-2021: Segmentation of multiple myeloma plasma cell in microscopic images},
  author={Gupta, Anubha and others},
  journal={IEEE ISBI 2021 Grand Challenge},
  year={2021}
}
```

## 注意事项

1. **非 H&E 染色**：Jenner-Giemsa 染色与 H&E 截然不同，专用于血液学/骨髓图像分析。
2. **双结构标注**：细胞核和细胞质是两个独立的标注层，需分别处理。
3. **图像尺寸不统一**：存在两种分辨率（2040×1536 和 1920×2560），需在 dataloader 中处理。
4. **Kaggle 下载便捷**：建议通过 Kaggle 平台下载，无需注册 Grand Challenge 账号。
