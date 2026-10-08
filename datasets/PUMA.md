# PUMA 数据集详情

> 参考 PanNuke 详情页的章节结构，严格区分官方已发布信息、当前收录的版本与尚不能核实的部分。资料核查：2026-10-08。

## 数据集描述

黑色素瘤 H&E 组织学多尺度数据，围绕细胞核实例/类别和组织区域同时提供人工标注。核心问题是黑色素瘤细胞与其他间质或免疫细胞的形态混淆，以及肿瘤浸润淋巴细胞的位置关系。

### 相关论文与官方来源

- [原作者/挑战官方发布页面](https://zenodo.org/records/15050523)
- [原论文或挑战论文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf011/8024182)

## 数据集基本信息（汇总）

| 项目 | 核实内容 |
|---|---|
| **发布/赛事年份** | 2025 |
| **器官/样本** | Melanoma |
| **染色/模态** | H&E |
| **适用任务** | seg |
| **图像形态** | patch(1024x1024) context(5120x5120) |
| **原始数据与监督** | images + nuclei and tissue annotations + context image |
| **扫描/其他** | 40x - Nanozoomer XR C12000–21/–22 |

## 核心数据量与图像格式

| 项目 | 核实内容 |
|---|---|
| **数量（注明统计单位）** | Zenodo training v5: 206 ROIs (primary: 103, metastatic: 103), 97,429 nuclei (10 classes: tumor 58.93%, lymphocyte 22.21%, histiocyte 7.36%, stroma 3.96%, epithelium 2.27%, apoptotic 1.90%, vascular endothelium 1.75%, melanophage 0.71%, plasma cell 0.53%, neutrophil 0.38%) |
| **图像/文件表示** | 01_training_dataset_tif_ROIs.zip：1024×1024 ROI 的 TIFF 图像；01_training_dataset_tif_context_ROIs.zip：5120×5120 context TIFF；01_training_dataset_geojson_nuclei.zip：核的 GeoJSON 多边形/类别；01_training_dataset_geojson_tissue.zip：组织区域 GeoJSON |
| **采集与版本说明** | 论文采样 40×（约 0.23 μm/px），训练公开数据约 97,429 个核实例；各发布版本的 ROI 数与许可曾变化。 |

## 任务与标注

核和组织分别采用多边形 GeoJSON 注释；不要将多边形实例当作单纯语义像素 mask，需栅格化并保留实例 ID。

## 标注类别与语义

| 项目 | 核实内容 |
|---|---|
| **核（10 类）** | Tumor、Stroma、Vascular endothelium、Histiocyte、Melanophage、Lymphocyte、Plasma cell、Neutrophil、Apoptotic cell、Epithelium |
| **组织** | Tumor、Stroma、Epidermis、Necrosis、Blood vessel；背景另计 |

> 类别名称与整数 ID 的映射必须以下载数据中的 label map 或发布方代码为准；未在本页列出的类不能推定存在。

## 数据划分与评估协议

Zenodo v5 公开训练部分为 206 个 ROI（103 primary、103 metastatic）；完整论文/挑战总体 310 ROI，额外测试集不等于可公开获取的训练标注。

## 文件结构与读取方法

- 01_training_dataset_tif_ROIs.zip：1024×1024 ROI 的 TIFF 图像
- 01_training_dataset_tif_context_ROIs.zip：5120×5120 context TIFF
- 01_training_dataset_geojson_nuclei.zip：核的 GeoJSON 多边形/类别
- 01_training_dataset_geojson_tissue.zip：组织区域 GeoJSON

这些是有来源依据的**文件组成**，不是未经下载验证的精确文件树。不同 release 和镜像可能调整压缩包名或子目录；先检查实际压缩包/路径：

```python
from pathlib import Path
root = Path('DATASET_ROOT')  # 替换为已下载并解压的数据目录
for p in sorted(root.rglob('*')):
    if p.is_file():
        print(p.relative_to(root), p.suffix)
```

## 使用建议（简要）

### 加载与预处理

- 论文采样 40×（约 0.23 μm/px），训练公开数据约 97,429 个核实例；各发布版本的 ROI 数与许可曾变化。
- 核实样本与标注的一一对应关系，并保留原始标签文件的版本号与来源信息。
- 如果提供了病例/玻片 ID，优先使用**患者或玻片级**数据划分，避免相邻 patch 泄漏。

### 建模提示

- 同一 ROI 还配有 context ROI，必须同源匹配；切勿将 test 集数值并入公开训练集统计。

### 评估指标

核实例 PQ/mPQ 与分类 F1；组织分割 mIoU、Dice；具体排名应使用官方挑战评价协议。

## 相关资源

- [data](https://zenodo.org/records/15050523)
- [paper](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf011/8024182)
- [download](https://zenodo.org/records/15050523)
- [official](https://zenodo.org/records/15050523)

## 引用

正式参考文献请在 [原论文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf011/8024182) 的出版社页面导出 BibTeX，不手写未经核实的作者/期刊字段。

## 注意事项

1. **来源可信度**：Zenodo v5 (2025) training package reports 206 annotated ROIs; the 2025 GigaScience article describes a broader 310-ROI dataset. Do not conflate the full study with this training release.。
2. **任务边界**：同一 ROI 还配有 context ROI，必须同源匹配；切勿将 test 集数值并入公开训练集统计。
3. **数据授权**：使用前查阅官方文件的许可、注册与下载条件；源代码许可证不能替代数据许可证。
4. **可复现性**：统计以对应发布包、真实文件数、患者去重和官方测试划分为准；本页未对每个下载压缩包逐字节校验。
