# TNBC 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

TNBC 是 Naylor 等人开发的三阴性乳腺癌 H&E 细胞核分割数据，聚焦密集核/接触核边界，通常用于核分割模型的外部实验。

### 相关论文与发布方

- [官方/第一方来源](https://zenodo.org/records/2579118)
- [原论文](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=8438559)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2019 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (512x512) |
| **标注内容** | 50 breast H&E images + nuclei segmentation masks (no nuclear phenotype class labels) |
| **扫描/附加条件** | 40x - Philips Ultra Fast Scanner (Curie Inst.) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 50 images, 4022 cells (11 patients) |
| **格式/数据形态** | 50 张 RGB 512×512 H&E patch + 对应核前景/实例标注，11 位患者 |
| **采集与版本** | 40× Philips Ultra Fast Scanner；原作者 Zenodo 数据最初在 2018 发表，后续修订版可能更新少量 GT。 |

---

## 任务与标注

提供细胞核区域分割；不提供经过验证的肿瘤/淋巴/上皮等核类别标签，不适用于多核表型分类评估。

### 类别与标签语义

- Nucleus：核前景
- Background：其他区域；根据下载文件核对 mask 是否区分每个实例 ID

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

50 张图来自 11 名 TNBC 患者，使用患者级 train/test split；常见随机划分或论文规定划分需单独注明。

---

## 文件组成与读取方式

- 原始 512×512 H&E 图像
- 同患者同部位的核 segmentation mask
- Naylor 论文及 Zenodo 版本说明

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

- 核查实际 mask 类型、二值取值以及实例分离规则；必要时对相邻核用距离变换+分水岭，但这是模型后处理。

### 建模与数据泄漏风险

- Naylor et al. 不是另外一个新数据集，不能与 TNBC 做相互外测；不能把分割 mask 当核类型标签。

### 评估指标

核 Dice/IoU、AJI、PQ（需要可靠实例 GT）。

---

## 相关资源

- [data](https://drive.google.com/drive/folders/1taB8boGyycjV4X1a2vCIAV9fwMxFSS41)
- [paper](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=8438559)
- [official](https://zenodo.org/records/2579118)

---

## 引用

正确 BibTeX 请从 [论文记录](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=8438559) 导出；不编造作者与卷期页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 Naylor et al. 项目条目完全同源。
4. **核查边界**：原作者TNBC发布；与Naylor同源
