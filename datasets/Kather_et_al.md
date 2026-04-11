# Kather et al. 数据集详情

## 数据集描述

Kather et al. 是一个结肠癌组织病理学图像数据集，由 Jakob Nikolas Kather 等发布，用于研究**微卫星不稳定性（MSI, Microsatellite Instability）**和结肠癌组织学分类。数据集发布于 Nature Medicine（2019），已成为结直肠癌计算病理学领域的重要基准。

### 研究背景

微卫星不稳定性（MSI）是结肠癌的重要生物标志物，影响化疗和免疫检查点治疗的疗效。该数据集旨在通过深度学习从 H&E 图像中预测 MSI 状态，实现无需 PCR/IHC 的低成本 MSI 筛查。

## 数据集基本信息

- **器官类型**：结肠（Colon）— 结直肠癌
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：大规模多中心数据集（具体数量见下表）
- **任务类型**：分割（seg）+ 分类（classi）— 组织学分类 + MSI 预测

## 主要数据集版本

Kather 等发布了多个相关数据集，常见版本包括：

### NCT-CRC-HE-100K（主要版本）

| 类别 | Patch 数量 | 说明 |
|------|-----------|------|
| ADI（脂肪组织） | 10,000 | Adipose |
| BACK（背景） | 10,000 | Background |
| DEB（碎屑/坏死） | 10,000 | Debris |
| LYM（淋巴细胞聚集） | 10,000 | Lymphocytes |
| MUC（粘液） | 10,000 | Mucus |
| MUS（平滑肌）| 10,000 | Smooth muscle |
| NORM（正常黏膜） | 10,000 | Normal colon mucosa |
| STR（间质）| 10,000 | Cancer-associated stroma |
| TUM（肿瘤上皮） | 10,000 | Colorectal adenocarcinoma |
| **合计** | **100,000** | 9 类×10,000 |

### CRC-VAL-HE-7K（验证集）

- 7,180 张来自独立患者的 patch，用于验证

### TCGA-CRC-DX（MSI 预测数据集）

- 来自 TCGA 的结直肠癌 WSI
- 用于 MSI/MSS 状态预测
- 结合 Zenodo 上的 bag-level 标签使用

## 标注格式

### 目录分类（图像级标签）

- 数据以**目录分类**方式组织：每个目录名即为组织类别
- 图像为 `.jpg` 或 `.png` 格式，224×224 像素（可能因版本而异）

```python
import os
import numpy as np
from PIL import Image
from torch.utils.data import Dataset

CLASS_NAMES = ['ADI', 'BACK', 'DEB', 'LYM', 'MUC', 'MUS', 'NORM', 'STR', 'TUM']

class KatherDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.samples = []
        self.transform = transform
        
        for cls_idx, cls_name in enumerate(CLASS_NAMES):
            cls_dir = os.path.join(root_dir, cls_name)
            for fname in os.listdir(cls_dir):
                if fname.endswith(('.jpg', '.png', '.tif')):
                    self.samples.append((
                        os.path.join(cls_dir, fname),
                        cls_idx
                    ))
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label
```

## 数据特点

### 9 类组织学分类
- 涵盖结肠癌微环境中所有主要组织类型
- 每类 10,000 张（NCT-CRC-HE-100K），类别完全平衡

### MSI 预测
- 从组织学图像中预测微卫星不稳定性状态
- 具有重要临床价值：辅助免疫治疗患者筛选

### 大规模与标准化
- 10 万张标注 patch，是结直肠癌病理分类领域最大的公开数据集之一
- 固定的 224×224 patch 尺寸，可直接输入标准深度学习模型

## 使用建议

### 训练/评估流程

```python
import torch
from torchvision import transforms, models
from torch.utils.data import DataLoader

# 数据增强
transform_train = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                         std=[0.229, 0.224, 0.225])
])

# 加载数据集
train_dataset = KatherDataset('NCT-CRC-HE-100K/', transform=transform_train)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=4)

# 使用预训练 ResNet
model = models.resnet50(pretrained=True)
model.fc = torch.nn.Linear(2048, 9)  # 9 类
```

### MSI 预测流程

```python
# MSI 预测（弱监督，slide-level 标签）
# 1. 提取 WSI 中所有 patch 的特征
# 2. 汇聚（Mean Pooling / Attention-based MIL）得到 slide-level 特征
# 3. 预测 MSI/MSS 状态（二分类）
```

## 相关资源

- [Zenodo 数据下载（NCT-CRC-HE-100K）](https://zenodo.org/record/2532612#.Yt_Zdd_RZhE)
- [GitHub 代码](https://github.com/jnkather/MSIfromHE)
- [论文（Nature Medicine 2019）](https://www.nature.com/articles/s41591-019-0462-y)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{kather2019deep,
  title={Deep learning can predict microsatellite instability directly from histology in gastrointestinal cancer},
  author={Kather, Jakob Nikolas and Pearson, Alexander T and Halama, Niels and others},
  journal={Nature Medicine},
  volume={25},
  number={7},
  pages={1054--1056},
  year={2019},
  publisher={Nature Publishing Group}
}
```

## 注意事项

1. **多版本**：Kather 等发布了多个版本（NCT-CRC, CRC-VAL, TCGA-CRC），使用时明确版本号。
2. **MSI 预测需 slide-level 标签**：MSI 预测任务需要结合 TCGA 临床数据获取样本标签。
3. **数据下载**：主要数据集通过 Zenodo 下载，部分 TCGA 数据需通过 GDC 申请。
4. **颜色归一化**：不同来源的 patch 颜色差异较大，建议使用 Macenko 或 Vahadane 颜色归一化。
