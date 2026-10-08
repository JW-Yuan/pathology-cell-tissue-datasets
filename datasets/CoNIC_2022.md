# CoNIC 2022 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

CoNIC 2022 是结肠细胞核识别与计数挑战，采用 Lizard 相关图像和标签，设置两类评测：核实例分割+分类，以及按类别回归核数量。

### 相关论文与发布方

- [官方/第一方来源](https://github.com/TissueImageAnalytics/CoNIC)
- [原论文](https://arxiv.org/pdf/2111.14485.pdf)
- [官方代码/原作者仓库](https://github.com/TissueImageAnalytics/CoNIC)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2022 |
| **器官/组织或物种** | Colon |
| **染色及模态** | H&E |
| **具体任务** | seg、classi、counting |
| **图像单元与尺寸** | patch (256x256) |
| **标注内容** | H&E patches + per-pixel instance/class masks (official arrays include NumPy representations) + class-wise counting targets |
| **扫描/附加条件** | 20x(from lizard 切片而来) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 4981 patch with 431.913 nuclei of 6 types |
| **格式/数据形态** | 256×256 H&E RGB patch + NumPy `.npy` 标注数组；标准评测的实例/类别输出形状 N×256×256×2 |
| **采集与版本** | 训练/公开版本约 4,981 个 patch 与 431,913 个已注释核。来自 Lizard 语义标注，不能当作独立的新病理患者。 |

---

## 任务与标注

核 ID mask 保存每像素所属实例，类别类型 mask 保存六种核类型；第二个赛道仅使用六维核数量，可不输出精细轮廓。

### 类别与标签语义

- Neutrophil（中性粒细胞）
- Epithelial（上皮细胞）
- Lymphocyte（淋巴细胞）
- Plasma（浆细胞）
- Eosinophil（嗜酸性粒细胞）
- Connective（结缔组织细胞）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

使用 challenge 原始训练/隐藏测试划分。`.npy` 标注通道 0 常代表 instance ID，通道 1 表示类型编码；精确编码从组织者示例读取。

---

## 文件组成与读取方式

- 训练图像 NumPy 数组
- 实例 ID + 类别编号的两通道 NumPy 标签数组
- 按核类型汇总的 counting 目标及评估代码

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

- 使用 `np.load` 检查 `.npy` shape 与每像素的实例/类别 ID；不要照抄某些第三方教程中 PNG 单掩膜的布局。

### 建模与数据泄漏风险

- 有细胞核“计数回归”（counting），不是 image registration；与 Lizard 重叠，跨数据集结果不能当外部验证。

### 评估指标

任务1：mPQ⁺（multi-class panoptic quality）；任务2：按类别 R²（multi-class coefficient of determination）。

---

## 相关资源

- [data](https://conic-challenge.grand-challenge.org/)
- [github](https://github.com/TissueImageAnalytics/CoNIC)
- [paper](https://arxiv.org/pdf/2111.14485.pdf)
- [download](https://drive.google.com/drive/folders/1il9jG7uA4-ebQ_lNmXbbF2eOK9uNwheb)
- [official](https://github.com/TissueImageAnalytics/CoNIC)

---

## 引用

引用请从 [原论文或出版社页面](https://arxiv.org/pdf/2111.14485.pdf) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：Lizard 与 CoNIC 样本图像/标签有实质性重叠。
4. **核查边界**：组织者发布代码；CoNIC与Lizard来源有重叠
