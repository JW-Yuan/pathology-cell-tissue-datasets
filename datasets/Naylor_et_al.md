# Naylor et al. 数据集详情

## 数据集描述

Naylor et al. 数据集是一个专用于**乳腺癌 H&E 图像中细胞核实例分割**的基准数据集，随 Naylor 等人（2018）的研究工作一起发布于 IEEE TMI。数据来自法国 Curie 研究所的三阴性乳腺癌（TNBC）患者，与 TNBC 数据集密切相关。

> **注意**：Naylor et al. 数据集与 TNBC 数据集高度相关（来源相同），后者是其扩充/更新版本。

## 数据集基本信息

- **器官类型**：乳腺（Breast）— 三阴性乳腺癌（TNBC, Triple Negative Breast Cancer）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：50 张图像，包含 4,022 个细胞核（来自 11 例患者）
- **图像分辨率**：512 × 512 像素
- **放大倍数**：40x
- **扫描仪**：Philips Ultra Fast Scanner（Curie Institute）
- **任务类型**：分割（Nuclei Instance Segmentation）

## 数据集规模

| 统计项 | 数量 |
|--------|------|
| 患者数 | 11 |
| 图像总数 | 50 |
| 细胞核总数 | 4,022 |
| 图像分辨率 | 512 × 512 px |

## 标注格式

### 像素级细胞核掩码

```python
import numpy as np
from PIL import Image
import scipy.io as sio

# 加载图像
img = np.array(Image.open('TNBC_001.png').convert('RGB'))  # (512, 512, 3)

# 加载标注掩码（通常为 .mat 或 .png 格式）
# 方式1: .mat 格式
mat = sio.loadmat('TNBC_001_mask.mat')
inst_mask = mat['inst_map']  # (512, 512) 实例 ID 掩码

# 方式2: .png 格式（二值或实例）
mask = np.array(Image.open('TNBC_001_mask.png').convert('L'))
binary_mask = (mask > 0).astype(np.uint8)
```

## 数据特点

### 三阴性乳腺癌（TNBC）
- TNBC 是乳腺癌中最具侵袭性的亚型，ER-/PR-/HER2- 阴性
- 预后最差，但免疫治疗反应较好
- 肿瘤浸润淋巴细胞（TIL）密度是重要的预后标志

### 高分辨率精细标注
- 512×512 px 的高分辨率 patch
- 40x 放大倍数下细胞核细节清晰

### 与 TNBC 数据集的关系
- 数据来自相同来源（Curie Institute，Naylor 课题组）
- TNBC 数据集（标注在 Zenodo）是 Naylor et al. 的公开扩充版

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
import glob

def load_naylor_dataset(root_dir):
    """加载 Naylor et al. 数据集"""
    img_paths = sorted(glob.glob(os.path.join(root_dir, '*.png')))
    # 过滤掩码文件（假设掩码文件名包含 '_mask'）
    img_paths = [p for p in img_paths if '_mask' not in p]
    
    samples = []
    for img_path in img_paths:
        mask_path = img_path.replace('.png', '_mask.png')
        if os.path.exists(mask_path):
            img = np.array(Image.open(img_path).convert('RGB'))
            mask = np.array(Image.open(mask_path).convert('L'))
            samples.append({'image': img, 'mask': mask})
    
    return samples
```

### 评估指标

```python
# 细胞核分割常用指标
def evaluate_nuclei_seg(pred_inst, gt_inst):
    """
    评估实例分割结果
    """
    metrics = {}
    
    # 1. 二值 Dice（前景 vs 背景）
    pred_binary = (pred_inst > 0).astype(np.float32)
    gt_binary = (gt_inst > 0).astype(np.float32)
    tp = (pred_binary * gt_binary).sum()
    metrics['Dice'] = 2 * tp / (pred_binary.sum() + gt_binary.sum() + 1e-8)
    
    # 2. AJI（Aggregated Jaccard Index）
    # 参见 Kumar 数据集 AJI 计算代码
    
    return metrics
```

## 相关资源

- [Zenodo 数据下载](https://zenodo.org/record/2579118#.Yt5FWt_RaUk)
- [论文（IEEE TMI 2018）](https://ieeexplore.ieee.org/document/8438559)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{naylor2018segmentation,
  title={Segmentation of nuclei in histopathology images by deep regression of the distance map},
  author={Naylor, Peter and La{\'{e}}, Marick and Reyal, Fabien and Walter, Thomas},
  journal={IEEE Transactions on Medical Imaging},
  volume={38},
  number={2},
  pages={448--459},
  year={2018},
  publisher={IEEE}
}
```

## 注意事项

1. **与 TNBC 的关系**：本数据集来源与 TNBC 数据集相同，若两者均使用需注意数据重叠问题。
2. **下载方式**：通过 Zenodo 链接（records/2579118）下载完整数据集。
3. **距离图（Distance Map）**：原论文使用距离图回归方法进行分割，标注中可能包含距离图数据。
4. **小规模**：50 张图像，适合作为测试集或与其他数据集合并使用。
