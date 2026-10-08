# Gelasca et al. 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

UCSB Bio-Segmentation 公共资源中的乳腺癌组织学图像与像素级标注，常在核检测/前景分割研究中按 Gelasca 等早期工作引用。

### 相关论文与发布方

- [官方/第一方来源](https://bioimage.ucsb.edu/research/bio-segmentation)
- 正式论文/年份详情以第一方数据主页为准


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2009 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | classi、seg |
| **图像单元与尺寸** | Patch (896x768; 768x512) |
| **标注内容** | images (malignant/benignant, 1.895 nuclei) + masks |
| **扫描/附加条件** | 以官方扫描信息为准 |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 58 H&E breast-cancer images on UCSB official distribution page |
| **格式/数据形态** | `.tiff` H&E 图像与对应 mask；部分图像 896×768，部分 768×512 |
| **采集与版本** | UCSB 官方汇总表写 58 张乳腺癌图片；同页正文约 50 张，旧论文子集可能不同，必须区分官方列表与使用子集。 |

---

## 任务与标注

图像可带良/恶性属性及区域/核前景掩膜；是否具有实例 ID 和全部细胞型分类，必须从实际下载包验证。

### 类别与标签语义

- Breast cancer image status：Benign / Malignant
- Cell or nucleus foreground mask（具体语义以官方 mask 说明为准）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

公开 UCSB 图片统计口径 58 张，而部分研究选择 50 张；官网未提供可验证的统一 train/test 划分。

---

## 文件组成与读取方式

- H&E TIFF breast cancer images
- 关联的标注 TIFF/mask（需逐张匹配）

> 此处描述发布包实际提供的文件类型与目录线索；未下载核对的完整文件树不作为“官方目录”展示。

### 文件核验示例

```python
from pathlib import Path

root = Path("DATASET_ROOT")  # 下载并解压后替换成实际路径
for p in sorted(root.rglob("*")):
    if p.is_file():
        print(p.relative_to(root), p.suffix)
```

对目录和标注文件进行核验后，再建立患者/图像/标注文件之间的映射，记录数量、尺寸及未知标签。

---

## 使用建议（简要）

### 加载与预处理

- 先查看 TIFF 的 bit-depth 和 mask 实际唯一值，再确定是前景、实例还是多类别标签。

### 建模与数据泄漏风险

- 不要把 UCSB 页面另一条 50 张猫视网膜细胞核影像或荧光数据混入乳腺癌数据。

### 评估指标

二值检测或分割 Precision/F1、Dice；若只有前景掩膜则无核类型分类真值。

---

## 相关资源

- [data](https://bioimage.ucsb.edu/research/bio-segmentation)
- [official](https://bioimage.ucsb.edu/research/bio-segmentation)

---

## 引用

正式引文须从作者/挑战赛页面确认，暂不虚构 BibTeX。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：原始单一 UCSB breast cancer 图像集合，不能与核分割数据集无依据地合并。
4. **核查边界**：UCSB官方数据页；乳腺癌图像58张
