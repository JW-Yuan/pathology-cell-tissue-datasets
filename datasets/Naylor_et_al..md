# Naylor et al. 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Naylor 等人提供 50 张三阴性乳腺癌 H&E 核分割图像（原始简称 TNBC）。本条是与 TNBC 同一数据源的作者名称别名，不是额外 50 张独立图像。

### 相关论文与发布方

- [官方/第一方来源](https://zenodo.org/records/2579118)
- [原论文](https://ieeexplore.ieee.org/document/8438559)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2018 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | Patch (512x512) |
| **标注内容** | images (4.022 nuclei, 11 patients) + masks |
| **扫描/附加条件** | 40x |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 50 |
| **格式/数据形态** | 50 张 512×512 H&E 图像及核分割掩膜，来源于 11 位 TNBC 患者 |
| **采集与版本** | 原作者 Zenodo 2579118（有版本更新）；通常在 40× 扫描图像上提取高细胞密度 ROI。 |

---

## 任务与标注

核像素分割监督，不包括经验证的逐核细胞表型分类标签；实例级处理时要核查所下载版本的 mask 编码，而不是把任意二值掩膜自动认定为实例 GT。

### 类别与标签语义

- Nucleus foreground（细胞核）
- Background（非核）；不提供肿瘤/淋巴/间质等独立核类型 class_map

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

共有 11 位患者、50 张图；具体 train/val/test 不是数据的固有随机划分，应按患者独立分组，并注明采用的文献协议。

---

## 文件组成与读取方式

- 原始 512×512 RGB image
- 对应核二值/实例分割 mask（以下载档实际格式为准）
- Zenodo 记录中的版本和许可元数据

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

- 对原始 mask 检查前景、背景值与是否逐实例编码；区分论文变换后的 distance map 和原生核真值。

### 建模与数据泄漏风险

- 与 TNBC 完全同源，不能把 Naylor 当外部测试集；按患者划分以防泄漏。

### 评估指标

核分割 Dice/IoU、AJI/PQ（前提是有可靠实例标签）。

---

## 相关资源

- [data](https://zenodo.org/record/2579118#.Yt5FWt_RaUk)
- [paper](https://ieeexplore.ieee.org/document/8438559)
- [download](https://zenodo.org/records/2579118#.Yt5FWt_RaUk)
- [official](https://zenodo.org/records/2579118)

---

## 引用

请从 [原论文/出版社](https://ieeexplore.ieee.org/document/8438559) 导出 BibTeX，不能使用非真实示例作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 TNBC 是完全相同的源数据条目，建议使用 canonical_name=TNBC。
4. **核查边界**：TNBC同源的原作者Zenodo数据；建议作为别名
