# GlaS 数据集详情

## 数据集描述

GlaS（Gland Segmentation in Colon Histology Images Challenge）是 MICCAI 2015 挑战赛数据集，专用于**结直肠组织病理学图像中腺体实例分割**，是腺体分割领域最经典的基准数据集之一。

### 临床意义

腺体形态（大小、形状、腺腔结构）是判断结肠癌恶性程度（Grading）的重要依据。自动化腺体分割可辅助 Gleason 评分/恶性分级的量化分析。

## 数据集基本信息

- **器官类型**：结直肠（Colorectal）— 腺体（Gland）
- **染色方式**：H&E（苏木精-伊红）
- **数据集大小**：165 张图像（train 85 + test 80）
- **图像分辨率**：几百像素（尺寸不一，约 500~1000 px）
- **放大倍数**：20x
- **扫描仪**：Zeiss MIRAX MIDI
- **任务类型**：分类（classi）+ 分割（seg）

## 数据集划分

| 子集 | 良性（Benign） | 恶性（Malignant） | 合计 |
|------|--------------|-------------------|------|
| 训练集 | 37 | 48 | 85 |
| 测试集 A | 60（含良恶） | — | 60 |
| 测试集 B | 20（含良恶） | — | 20 |
| **合计** | — | — | **165** |

> 测试集分为 Test A（简单）和 Test B（困难），两者需分别报告结果。

## 标注格式

### 实例分割掩码

```python
import numpy as np
from PIL import Image

# 加载图像
img = np.array(Image.open('train_1.bmp').convert('RGB'))

# 加载标注（实例掩码，像素值为腺体实例 ID）
annotation = np.array(Image.open('train_1_anno.bmp'))
# 0: 背景
# 非零: 腺体实例 ID（每个腺体唯一）

# 提取所有腺体实例
gland_ids = np.unique(annotation)
gland_ids = gland_ids[gland_ids != 0]

print(f"图像包含 {len(gland_ids)} 个腺体")
for gid in gland_ids:
    gland_mask = (annotation == gid)
    area = gland_mask.sum()
    print(f"腺体 {gid}: 面积 {area} 像素")
```

### 图像级分类标签

- 每张图像同时具有**良性/恶性（Benign/Malignant）**的图像级标签
- 可用于训练或评估图像级恶性分类器

## 腺体形态学

| 形态特征 | 良性 | 恶性 |
|---------|------|------|
| 腺体结构 | 规则，轮廓圆滑 | 不规则，扭曲变形 |
| 腺腔 | 清晰可见 | 模糊或消失 |
| 边界 | 清晰 | 不清晰，浸润性 |
| 腺体大小 | 均一 | 大小不一 |

## 数据特点

### MICCAI 2015 权威基准
- 首次大规模腺体分割挑战赛，奠定了腺体分割领域的基准地位
- 大量后续工作（GAN-based、Transformer-based）在此基准上报告结果

### Test A 与 Test B 难度差异
- **Test A**：相对简单，腺体边界清晰
- **Test B**：更困难，含更多恶性、形态复杂的腺体
- 要求分别报告两个测试集的结果

### 小尺寸图像
- 几百像素的小图像，适合直接端到端训练
- 不同图像尺寸不一，数据加载时需统一处理

## 使用建议

### 数据加载

```python
import os
import numpy as np
from PIL import Image

def load_glas_dataset(root_dir, split='train'):
    """加载 GlaS 数据集"""
    img_dir = os.path.join(root_dir, split)
    samples = []
    
    for fname in sorted(os.listdir(img_dir)):
        if fname.endswith('.bmp') and 'anno' not in fname:
            img_path = os.path.join(img_dir, fname)
            anno_path = img_path.replace('.bmp', '_anno.bmp')
            
            if os.path.exists(anno_path):
                img = np.array(Image.open(img_path).convert('RGB'))
                anno = np.array(Image.open(anno_path))
                
                # 良性/恶性标签（从文件名解析）
                label = 'benign' if 'benign' in fname.lower() else 'malignant'
                
                samples.append({
                    'image': img,
                    'instance_map': anno,
                    'label': label
                })
    return samples
```

### 评估指标

```python
# GlaS 官方评估指标（对象级）
# 1. F1 分数（Object-level F1）
# 2. Ojaccard（Object-level Jaccard）

def compute_object_f1_and_jaccard(pred_inst, gt_inst):
    """
    对象级 F1 和 Jaccard 指数
    - 参见 GlaS 挑战赛官方评估代码
    - IoU > 0.5 的实例对视为 TP
    """
    pred_ids = np.unique(pred_inst)[1:]  # 去背景
    gt_ids = np.unique(gt_inst)[1:]
    
    TP, FP, FN = 0, 0, 0
    jaccard_sum = 0
    matched = set()
    
    for pred_id in pred_ids:
        pred_mask = (pred_inst == pred_id)
        best_iou = 0
        best_gt = None
        
        for gt_id in gt_ids:
            if gt_id in matched:
                continue
            gt_mask = (gt_inst == gt_id)
            intersection = (pred_mask & gt_mask).sum()
            union = (pred_mask | gt_mask).sum()
            iou = intersection / (union + 1e-8)
            if iou > best_iou:
                best_iou = iou
                best_gt = gt_id
        
        if best_iou >= 0.5:
            TP += 1
            jaccard_sum += best_iou
            matched.add(best_gt)
        else:
            FP += 1
    
    FN = len(gt_ids) - len(matched)
    
    precision = TP / (TP + FP + 1e-8)
    recall = TP / (TP + FN + 1e-8)
    F1 = 2 * precision * recall / (precision + recall + 1e-8)
    Ojaccard = jaccard_sum / (TP + FP + FN + 1e-8)
    
    return {'F1': F1, 'Ojaccard': Ojaccard}
```

## 相关资源

- [数据集下载（Warwick TIA）](https://warwick.ac.uk/fac/cross_fac/tia/data/glascontest/)
- [论文（arXiv 2016）](https://arxiv.org/pdf/1603.00275v2.pdf)
- [Kaggle 数据集](https://www.kaggle.com/datasets/sani84/glasmiccai2015-gland-segmentation)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{sirinukunwattana2017gland,
  title={Gland segmentation in colon histology images: The glas challenge contest},
  author={Sirinukunwattana, Korsuk and Pluim, Josien PW and Chen, Hao and others},
  journal={Medical Image Analysis},
  volume={35},
  pages={489--502},
  year={2017},
  publisher={Elsevier}
}
```

## 注意事项

1. **分别报告 Test A/B**：结果需在 Test A 和 Test B 上分别报告，不可合并。
2. **图像尺寸不一**：不同图像尺寸差异大，训练时需 resize 或使用全卷积网络。
3. **.bmp 格式**：图像为 BMP 格式，加载时注意颜色通道顺序。
4. **Ojaccard 与 Dice 的区别**：Ojaccard 是对象级指标，衡量每个腺体实例的分割质量，与像素级 Dice 含义不同。
