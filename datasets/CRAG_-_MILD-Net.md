# CRAG - MILD-Net 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Colorectal Adenocarcinoma Gland（CRAG）是结直肠腺体实例/区域分割基准，常与 MILD-Net 腺体分割论文关联；不是细胞核轮廓数据。

### 相关论文与发布方

- [官方/第一方来源](https://warwick.ac.uk/fac/cross_fac/tia/data/mildnet/)
- [原论文](https://www.sciencedirect.com/science/article/abs/pii/S1361841518306030?via%3Dihub)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2019 |
| **器官/组织或物种** | Colon |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (around 1500x1500) |
| **标注内容** | image + segmentation |
| **扫描/附加条件** | 20x |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 173, Test: 40 |
| **格式/数据形态** | H&E 组织显微视野与专家勾画的 gland regions；图像大小多在 ~1500×1500 |
| **采集与版本** | 数据源为结肠癌腺体，典型 20×，具有明显腺体尺度变化、变形和实例接触。 |

---

## 任务与标注

每一个 gland 是组织结构单元，标注为 gland 区域或实例；不含精细逐核类别监督。

### 类别与标签语义

- Gland（腺体或腺上皮结构）
- Background/Non-gland（非腺体）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

173 张训练图像，40 张**测试**图像（不是验证集）。

---

## 文件组成与读取方式

- 显微 H&E 图片
- 腺体轮廓/掩膜 ground truth，文件扩展及细节以作者下载包为准

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

- 根据 gland 标注建立语义/实例 mask；不要将 GlaS 的标注直接迁移作为独立 ground truth。

### 建模与数据泄漏风险

- 临床与计算定义是腺体分割，不能标成 nuclei instance segmentation；按原作者 split 比较性能。

### 评估指标

Gland object-level F1、Dice、Hausdorff distance 等腺体分割指标。

---

## 相关资源

- [data](https://warwick.ac.uk/fac/cross_fac/tia/data/mildnet/)
- [paper](https://www.sciencedirect.com/science/article/abs/pii/S1361841518306030?via%3Dihub)
- [official](https://warwick.ac.uk/fac/cross_fac/tia/data/mildnet/)

---

## 引用

正式引文请从 [原论文](https://www.sciencedirect.com/science/article/abs/pii/S1361841518306030?via%3Dihub) 获取并导出 BibTeX，不猜测完整作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：Lizard 等整合数据可能包含 CRAG 来源图像，跨数据集需防泄漏。
4. **核查边界**：Warwick作者数据页；CRAG腺体分割
