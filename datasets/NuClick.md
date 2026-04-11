# NuClick 数据集详情

## 数据集描述

NuClick 是一个包含**IHC（免疫组化）图像中淋巴细胞分割**标注的数据集，作为 NuClick 交互式分割框架（2020）的配套发布数据，由英国华警大学 TIA 中心提供。

### NuClick 框架背景

NuClick 是一种基于**用户点击/涂写交互**的深度学习分割框架，用户只需在细胞核内点击一下，系统即可输出精确的分割掩码。本数据集作为 NuClick 框架的应用示例发布，同时也是 LYON19 挑战赛第一名方法的训练数据之一。

## 数据集基本信息

- **器官类型**：淋巴细胞（Lymphocyte）— 来自多种肿瘤微环境
- **染色方式**：IHC（免疫组化）— 淋巴细胞标志物染色
- **数据集大小**：
  - 训练集：671 张
  - 验证集：200 张
- **图像分辨率**：256 × 256 像素（patch 大小）
- **任务类型**：分割（Lymphocyte Instance Segmentation）

## 数据集规模

| 子集 | 数量 |
|------|------|
| 训练集 | 671 |
| 验证集 | 200 |
| **合计** | **871** |

## 标注格式

### 实例分割掩码

```python
import numpy as np
from PIL import Image

# 加载 IHC 淋巴细胞图像
img = np.array(Image.open('lymph_001.png').convert('RGB'))  # (256, 256, 3)

# 加载分割掩码（实例 ID 掩码或二值掩码）
mask = np.array(Image.open('lymph_001_mask.png').convert('L'))

# 提取独立实例
from scipy import ndimage as ndi
labeled_mask, num_instances = ndi.label(mask > 0)
print(f"图像中淋巴细胞数量: {num_instances}")
```

### NuClick 交互式格式

NuClick 训练时还使用**引导信号图（Guiding Signals）**：
- **包含信号（Inclusion Map）**：用户点击位置的高斯热图
- **排除信号（Exclusion Map）**：相邻细胞/背景的抑制信号

```python
import numpy as np
from scipy.ndimage import gaussian_filter

def create_guidance_maps(click_points, image_size, sigma=5):
    """
    创建 NuClick 引导图
    click_points: list of (x, y) 点击坐标
    """
    inclusion_map = np.zeros(image_size[:2])
    for (x, y) in click_points:
        if 0 <= y < image_size[0] and 0 <= x < image_size[1]:
            inclusion_map[y, x] = 1.0
    inclusion_map = gaussian_filter(inclusion_map, sigma=sigma)
    return inclusion_map
```

## 数据特点

### IHC 图像特点
- IHC 染色下，淋巴细胞标志物（如 CD3、CD8、CD20）使特定淋巴细胞群呈棕色/红色
- 与 H&E 图像不同，IHC 颜色分布更加特定化
- 背景组织呈蓝色（苏木精衬染）

### 交互式分割
- 数据集为 NuClick 交互式分割框架设计
- 可用于研究**少量点击驱动的实例分割**方法

### LYON19 挑战赛关联
- 在 LYON19（淋巴细胞检测挑战赛）中，基于 NuClick 生成的掩码训练的模型取得第一名
- 数据集质量得到竞赛验证

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image
import glob

def load_nuclick_dataset(root_dir, split='train'):
    """加载 NuClick 数据集"""
    img_dir = os.path.join(root_dir, split, 'images')
    mask_dir = os.path.join(root_dir, split, 'masks')
    
    img_paths = sorted(glob.glob(os.path.join(img_dir, '*.png')))
    
    dataset = []
    for img_path in img_paths:
        fname = os.path.basename(img_path)
        mask_path = os.path.join(mask_dir, fname)
        
        if os.path.exists(mask_path):
            img = np.array(Image.open(img_path).convert('RGB'))
            mask = np.array(Image.open(mask_path).convert('L'))
            dataset.append({'image': img, 'mask': (mask > 0).astype(np.uint8)})
    
    return dataset
```

### 颜色分离（IHC 专用）

```python
from skimage.color import separate_stains, hdx_from_rgb

def separate_ihc_channels(img):
    """
    分离 IHC 图像的 Hematoxylin 和 DAB（DAB = 免疫组化棕色信号）通道
    """
    img_float = img.astype(np.float32) / 255.0
    img_float = np.clip(img_float, 1e-6, 1)
    
    # 使用 H-DAB 颜色反混合矩阵
    stains = separate_stains(img_float, hdx_from_rgb)
    hematoxylin = stains[:, :, 0]  # 蓝色核染色
    dab = stains[:, :, 1]          # 棕色 IHC 信号
    
    return hematoxylin, dab
```

## 相关资源

- [数据集下载（Warwick TIA）](https://warwick.ac.uk/fac/cross_fac/tia/data/nuclick/)
- [论文（arXiv 2020）](https://arxiv.org/pdf/2005.14511.pdf)
- [数据直接下载（血液学数据）](https://warwick.ac.uk/fac/cross_fac/tia/data/nuclick/hemato_data.zip)
- [GitHub 代码](https://github.com/navidstuv/NuClick)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{koohbanani2020nuclick,
  title={NuClick: A deep learning framework for interactive segmentation of microscopic images},
  author={Koohbanani, Navid Alemi and Unnikrishnan, Balachandran and Khan, Navid Ahsan and Khurram, Syed Ali and Rajpoot, Nasir},
  journal={Medical Image Analysis},
  volume={65},
  pages={101771},
  year={2020},
  publisher={Elsevier}
}
```

## 注意事项

1. **IHC 预处理**：IHC 图像与 H&E 图像颜色分布不同，建议使用 H-DAB 颜色分离或专用的 IHC 颜色归一化。
2. **NuClick 框架依赖**：若复现 NuClick 方法，需同时准备引导信号图（点击位置的高斯热图）。
3. **数据下载格式**：官方提供两种数据集：IHC 淋巴细胞（本文件）和血液涂片白细胞，下载时注意选择。
4. **小规模验证集**：200 张验证集较小，实验结果可能波动较大，需多次实验取均值。
