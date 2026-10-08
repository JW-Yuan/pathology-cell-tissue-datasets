# ADP 数据集详情

> 参考 PanNuke 详情页的章节结构，严格区分官方已发布信息、当前收录的版本与尚不能核实的部分。资料核查：2026-10-08。

## 数据集描述

Atlas of Digital Pathology：多组织类型的数字病理图像块与层次化组织学标签库，强调多标签、层级分类而非细胞核分割。

### 相关论文与官方来源

- [原作者/挑战官方发布页面](https://www.dsp.utoronto.ca/projects/ADP/)
- [原论文或挑战论文](https://openaccess.thecvf.com/content_CVPR_2019/papers/Hosseini_Atlas_of_Digital_Pathology_A_Generalized_Hierarchical_Histological_Tissue_Type-Annotated_CVPR_2019_paper.pdf)
- [项目源码或组织者仓库](https://github.com/mahdihosseini/ADP)

## 数据集基本信息（汇总）

| 项目 | 核实内容 |
|---|---|
| **发布/赛事年份** | 2019 |
| **器官/样本** | multiple |
| **染色/模态** | multiple (most H&E) |
| **适用任务** | multi-label (3) classification (hierarchy) |
| **图像形态** | patch (1088x1088) |
| **原始数据与监督** | images + 57 hierarchical HTTs (histological tissue type) |
| **扫描/其他** | 40x - Huron TissueScope LE1.2 WSI |

## 核心数据量与图像格式

| 项目 | 核实内容 |
|---|---|
| **数量（注明统计单位）** | Train: 14,134; Valid: 1,767; Test: 1,767 patches from 100 WSIs |
| **图像/文件表示** | WSI 提取的 RGB patches；组织学层级标签与类别对应表；具体 CSV/图像目录须按 ADP 数据包检查 |
| **采集与版本说明** | 数据源包括多样组织学类型和多种染色，主要为 H&E；扫描于 Huron TissueScope LE 1.2（原仓库记录）。 |

## 任务与标注

图像级多标签 HTT，不是像素级组织轮廓；处理时须保持三个层级之间的父子约束。

## 标注类别与语义

| 项目 | 核实内容 |
|---|---|
| **HTT（Histological Tissue Type）** | 57 个层级组织类型；按三级 taxonomy 组织 |
| **监督形式** | 多标签存在性/层次标签；不是为每个细胞核提供 ID 或实例 mask |

> 类别名称与整数 ID 的映射必须以下载数据中的 label map 或发布方代码为准；未在本页列出的类不能推定存在。

## 数据划分与评估协议

从 100 张 WSI 提取 17,668 张 1088×1088 patches；Train 14,134、Validation 1,767、Test 1,767。

## 文件结构与读取方法

- WSI 提取的 RGB patches
- 组织学层级标签与类别对应表；具体 CSV/图像目录须按 ADP 数据包检查

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

- 数据源包括多样组织学类型和多种染色，主要为 H&E；扫描于 Huron TissueScope LE 1.2（原仓库记录）。
- 核实样本与标注的一一对应关系，并保留原始标签文件的版本号与来源信息。
- 如果提供了病例/玻片 ID，优先使用**患者或玻片级**数据划分，避免相邻 patch 泄漏。

### 建模提示

- 层级分类既有父类也有子类，不能把 57 标签视为彼此完全互斥的单一 softmax 分类。

### 评估指标

micro/macro F1、mAP、多标签 AUROC；分层统计类别性能。

## 相关资源

- [data](https://www.dsp.utoronto.ca/projects/ADP/)
- [github](https://github.com/mahdihosseini/ADP)
- [paper](https://openaccess.thecvf.com/content_CVPR_2019/papers/Hosseini_Atlas_of_Digital_Pathology_A_Generalized_Hierarchical_Histological_Tissue_Type-Annotated_CVPR_2019_paper.pdf)
- [official](https://www.dsp.utoronto.ca/projects/ADP/)

## 引用

正式参考文献请在 [原论文](https://openaccess.thecvf.com/content_CVPR_2019/papers/Hosseini_Atlas_of_Digital_Pathology_A_Generalized_Hierarchical_Histological_Tissue_Type-Annotated_CVPR_2019_paper.pdf) 的出版社页面导出 BibTeX，不手写未经核实的作者/期刊字段。

## 注意事项

1. **来源可信度**：多标签组织病理分类官方主页。
2. **任务边界**：层级分类既有父类也有子类，不能把 57 标签视为彼此完全互斥的单一 softmax 分类。
3. **数据授权**：使用前查阅官方文件的许可、注册与下载条件；源代码许可证不能替代数据许可证。
4. **可复现性**：统计以对应发布包、真实文件数、患者去重和官方测试划分为准；本页未对每个下载压缩包逐字节校验。
