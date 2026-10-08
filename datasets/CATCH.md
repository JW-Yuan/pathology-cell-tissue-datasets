# CATCH 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

CATCH（Pan-tumor CAnine cuTaneous Cancer Histology）是**犬**皮肤肿瘤 WSI 数据集，用于组织结构和肿瘤区域分割及分类，不能标记为人类皮肤癌。

### 相关论文与发布方

- [官方/第一方来源](https://doi.org/10.7937/TCIA.2M93-FX66)
- [原论文](https://www.nature.com/articles/s41597-022-01692-w)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2022 |
| **器官/组织或物种** | Skin (Canine) 犬类的，非人类 |
| **染色及模态** | H&E |
| **具体任务** | seg、classi |
| **图像单元与尺寸** | wsi |
| **标注内容** | images + contours (JSON) |
| **扫描/附加条件** | 40x Aperio ScanScope CS2 (Leica) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 350 wsi, 12.424 polygon annotations (13 classes) |
| **格式/数据形态** | 多尺度 H&E WSI + ROI/轮廓多边形（JSON 等表示） |
| **采集与版本** | 350 张犬皮肤 WSI，12,424 个多边形标注，13 个组织/病变类别。 |

---

## 任务与标注

区域多边形属于组织/肿瘤区域语义，不是逐核实例图；使用时从 contour 构建 ROI 语义 mask。

### 类别与标签语义

- 13 个组织/肿瘤类别：完整名称和 ID 依 TCIA 原始 annotation taxonomy 为准
- 犬皮肤肿瘤类别与正常皮肤组织分开编码；不直接借用人的肿瘤分级体系

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

官方数据按照犬皮肤来源样本发布；模型训练/测试需按病例或切片划分，多边形数量不是 WSI 数。

---

## 文件组成与读取方式

- TCIA CATCH WSI 下载集合
- 对应区域注释多边形文件
- 数据说明及论文的类别列表

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

- 选择统一像素尺寸后把多边形投影到目标 pyramid level；别把标注绝对坐标当作裁剪图局部坐标。

### 建模与数据泄漏风险

- 物种必须明确为犬（canine）；不能把不同犬 WSI 与多扫描版本视为独立来源。

### 评估指标

组织区域 IoU/Dice、多类语义分割与原论文分类评价。

---

## 相关资源

- [data](https://www.cancerimagingarchive.net/collection/catch/)
- [paper](https://www.nature.com/articles/s41597-022-01692-w)
- [download](https://www.cancerimagingarchive.net/collection/catch/)
- [official](https://doi.org/10.7937/TCIA.2M93-FX66)

---

## 引用

引用请从 [原论文或出版社页面](https://www.nature.com/articles/s41597-022-01692-w) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：Multi-Scanner SCC 是 CATCH 中 SCC 子集在多台扫描仪上的再采集。
4. **核查边界**：TCIA CATCH发布 DOI；犬类皮肤肿瘤
