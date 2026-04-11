# CPM-17 数据集详情

## 数据集描述

CPM-17（Cell Position Map Dataset with 17）是一个用于**细胞核实例分割与分类**的基准数据集，包含 64 张来自多种器官（以脑组织为主）的组织病理学图像，共 7,570 个细胞核实例。论文发表于 2019 年（PMC6454006）。

### 数据来源

图像来源于 **TCGA（The Cancer Genome Atlas）**，涵盖**脑组织**及多种器官，包含 20x 和 40x 放大倍数的 H&E 染色切片。

## 数据集基本信息

- **器官类型**：脑（Brain，以及多种其他器官）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：
  - 训练集：32 张图像
  - 测试集：32 张图像
  - 共含 7,570 个细胞核实例
- **图像分辨率**：500×500 至 600×600 像素
- **放大倍数**：20x 和 40x（TCGA 扫描）
- **任务类型**：分割（seg）+ 分类（classi）

## 数据集规模

| 子集 | 图像数 | 细胞核数（约） |
|------|--------|--------------|
| 训练集 | 32 | ~4,000 |
| 测试集 | 32 | ~3,570 |
| **合计** | **64** | **7,570** |

## 标注格式

### MATLAB `.mat` 文件

```python
import scipy.io as sio
import numpy as np

mat = sio.loadmat('image_001.mat')

# 常见字段：
# - inst_map:      (H, W) 实例 ID 掩码，0 为背景
# - type_map:      (H, W) 类别掩码（整数，对应细胞核类型）
# - inst_centroid: (N, 2) 每个实例的中心坐标 (x, y)
# - inst_type:     (N, 1) 每个实例的类别标签

# 获取实例数量
instance_ids = np.unique(mat['inst_map'])
instance_ids = instance_ids[instance_ids > 0]
num_instances = len(instance_ids)
print(f"图像中共有 {num_instances} 个细胞核实例")
```

### 文件目录结构（参考格式）

```
cpm17/
├── train/
│   ├── Images/    # (*.png) 训练图像
│   └── Labels/    # (*.mat) 实例 + 类别标注
└── test/
    ├── Images/    # (*.png) 测试图像
    └── Labels/    # (*.mat) 实例 + 类别标注
```

## 数据特点

### 与 CPM-15 的关系
- CPM-17 是 CPM-15 的扩展版本（更多图像，更多细胞核）
- 两者来源相同，标注体系一致，通常一起报告性能

### 中等规模
- 64 张图像、7,570 个细胞核，规模适中
- 适合作为测试/验证集进行跨数据集评估

### 多器官覆盖
- 虽以脑组织为主，但也包含其他器官图像
- 多放大倍数（20x/40x）增加了数据多样性

## 使用建议

### 数据加载

```python
import scipy.io as sio
import numpy as np
from PIL import Image
import glob

def load_dataset(split='train', root_dir='cpm17/'):
    img_paths = sorted(glob.glob(f'{root_dir}/{split}/Images/*.png'))
    label_paths = sorted(glob.glob(f'{root_dir}/{split}/Labels/*.mat'))
    
    samples = []
    for img_p, lbl_p in zip(img_paths, label_paths):
        img = np.array(Image.open(img_p).convert('RGB'))
        mat = sio.loadmat(lbl_p)
        inst_map = mat['inst_map']
        samples.append({'image': img, 'inst_map': inst_map})
    
    return samples
```

### 评估指标

```python
# CPM-17 常用评估指标（与 Kumar 数据集一致）
# 1. Dice（二值分割掩码 Dice）
# 2. AJI（Aggregated Jaccard Index）

def binary_dice(pred, gt):
    """二值 Dice 系数"""
    pred_b = (pred > 0).astype(np.bool_)
    gt_b = (gt > 0).astype(np.bool_)
    intersection = (pred_b & gt_b).sum()
    return 2 * intersection / (pred_b.sum() + gt_b.sum() + 1e-8)

def compute_aji(pred_inst, gt_inst):
    """
    Aggregated Jaccard Index (AJI)
    衡量预测与真实实例的整体 Jaccard 相似度
    参考 Kumar et al. IEEE TMI 2017 中的定义
    """
    # 详见 Kumar 数据集官方评估代码
    pass
```

## 相关资源

- [Google Drive 数据下载](https://drive.google.com/drive/folders/1sJ4nmkif6j4s2FOGj8j6i_Ye7z9w0TfA)
- [论文（PMC）](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6454006/)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{vu2019methods,
  title={Methods for segmentation and classification of digital microscopy tissue images},
  author={Vu, Quoc Dang and Graham, Simon and Kurc, Tahsin and others},
  journal={Frontiers in Bioengineering and Biotechnology},
  volume={7},
  pages={53},
  year={2019},
  publisher={Frontiers}
}
```

## 注意事项

1. **分辨率范围**：500×500 至 600×600 px，尺寸接近但不完全一致，数据加载时需统一或灵活处理。
2. **20x/40x 混合**：不同放大倍数的图像细胞核外观有差异，训练时可考虑分别处理。
3. **小规模**：32 张训练图像较少，通常用于跨数据集泛化测试，不建议单独用于大规模训练。
4. **AJI 指标**：请使用标准 AJI 实现（如 Kumar 数据集代码），不同实现可能导致结果不可比。
