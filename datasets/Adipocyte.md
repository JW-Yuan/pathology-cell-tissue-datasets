# Adipocyte 数据集详情

## 数据集描述

Adipocyte 是来自人类皮下脂肪组织的细胞检测数据集，由 GTEx（基因型与组织表达）联盟提供，用于验证 Count-Ception（全卷积计数网络）等细胞计数与检测方法。

### 数据来源

图像来自 **GTEx（Genotype Tissue Expression Consortium）** 项目，采集人类皮下脂肪组织 H&E 染色切片图像，感兴趣区域（ROI）由专家手工框选。

## 数据集基本信息

- **器官类型**：皮肤（脂肪组织，Skin/Adipose）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：200 个 ROI（感兴趣区域图像块）
- **图像分辨率**：120×150 像素（patch 大小）
- **放大倍数**：40x
- **数据来源**：GTEx Consortium

## 任务类型

- **细胞检测（Cell Detection）**：给定图像，预测每个脂肪细胞（adipocyte）的中心位置及细胞数量

## 标注格式

- **点标注（Point Annotation）**：每个细胞标注一个中心点坐标
- 标注格式通常为 `.csv` 或 `.mat` 文件，记录每幅图像中所有细胞的 (x, y) 坐标

### 标注统计

| 统计项 | 数值 |
|--------|------|
| 图像总数 | 200 张 ROI |
| 图像尺寸 | 120 × 150 px |
| 平均每图细胞数 | 约 17–20 个 |
| 标注类型 | 中心点坐标 |

## 数据特点

### 脂肪细胞形态特征
- 脂肪细胞（Adipocyte）体积大、呈圆形或多边形，由薄膜围绕脂滴构成
- 细胞内部呈现大空泡（脂滴）区域，细胞核被推向边缘
- H&E 染色下，脂滴不着色（空白），细胞核呈蓝紫色

### 技术挑战
- 相邻细胞边界不清晰，存在粘连（touching cells）
- 细胞大小相对均一，但形状不规则
- 细胞密度较高，重叠或遮挡少见

## 使用建议

### 数据加载

```python
import os
from PIL import Image
import numpy as np

# 加载图像
img = Image.open('adipocyte_images/image_001.png')
img_array = np.array(img)  # (120, 150, 3)

# 加载标注（假设为 CSV 格式）
import pandas as pd
annotations = pd.read_csv('adipocyte_annotations/image_001.csv')
# 列格式: x, y (中心点坐标)
```

### Count-Ception 方法示例

```python
# Count-Ception 使用扩张密度图（redundant counting map）进行细胞计数
# 参考原始论文实现：https://github.com/ieee8023/countception

# 核心思想：每个细胞中心在 L×L 的感受野内都产生贡献，
# 通过全卷积网络预测每个像素的局部计数期望，
# 再通过均值聚合得到全图细胞总数

def create_count_map(centers, image_size, L=32):
    """
    centers: list of (x, y) center coordinates
    L: counting frame size
    """
    count_map = np.zeros(image_size[:2], dtype=np.float32)
    for (x, y) in centers:
        for dx in range(-L//2, L//2):
            for dy in range(-L//2, L//2):
                px, py = int(x + dx), int(y + dy)
                if 0 <= px < image_size[1] and 0 <= py < image_size[0]:
                    count_map[py, px] += 1
    return count_map / (L * L)
```

### 评估指标

- **MAE（Mean Absolute Error）**：平均绝对误差，统计预测细胞数与真实细胞数之差
- **RMSE（Root Mean Square Error）**：均方根误差
- **Detection F1**：基于距离阈值的检测精度

## 相关资源

- [GitHub - Count-Ception 数据与代码](https://github.com/ieee8023/countception)
- [论文（arXiv 2017）](https://arxiv.org/abs/1703.08710)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{cohen2017count,
  title={Count-ception: Counting by fully convolutional redundant counting},
  author={Cohen, Joseph Paul and Boucher, Genevieve and Glastonbury, Craig A and Lo, Henry Z and Bengio, Yoshua},
  booktitle={Proceedings of the IEEE international conference on computer vision workshops},
  year={2017}
}
```

## 注意事项

1. **数据获取**：数据通过 GitHub 仓库 `ieee8023/countception` 获取，请遵守 GTEx 数据使用协议。
2. **图像尺寸小**：120×150 px 的 patch 尺寸较小，模型感受野设计需注意。
3. **数据量有限**：仅 200 张图像，适合作为基准测试，不适合大规模训练。
4. **标注密度**：点标注方式不提供细胞边界信息，仅适用于检测与计数任务。
