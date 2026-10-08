# AGGC 数据集详情

> 参考 PanNuke 详情页的章节结构，严格区分官方已发布信息、当前收录的版本与尚不能核实的部分。资料核查：2026-10-08。

## 数据集描述

Automated Gleason Grading Challenge 2022，以手术切除和穿刺活检前列腺组织为对象，对 Gleason 3/4/5 与非肿瘤组织区域建立分割和分级评测。

### 相关论文与官方来源

- [原作者/挑战官方发布页面](https://aggc22.grand-challenge.org/AGGC22/)
- [原论文或挑战论文](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4172090)

## 数据集基本信息（汇总）

| 项目 | 核实内容 |
|---|---|
| **发布/赛事年份** | 2022 |
| **器官/样本** | prostate |
| **染色/模态** | H&E |
| **适用任务** | seg、gleason grading |
| **图像形态** | wsi |
| **原始数据与监督** | images + binary masks |
| **扫描/其他** | 20x - Subset1 and Subset2: Akoya Biosciences Scanner, Subset3: each specimen is scanned by multiple scanners |

## 核心数据量与图像格式

| 项目 | 核实内容 |
|---|---|
| **数量（注明统计单位）** | Subset 1: train 105, test 45; Subset2: train 37, test 16; Subset3: train 144, test 67 |
| **图像/文件表示** | TIFF WSI（主办方统一近 20× 缩放）；每张训练图配最多五个二值 TIFF masks（G3/G4/G5/Normal/Stroma），实际类别缺席则对应 mask 可缺失 |
| **采集与版本说明** | 官方 2026-09-18 更新扫描仪像素尺寸；例如 Akoya ~0.500553 μm/px、Philips 0.5、Zeiss ~0.44。 |

## 任务与标注

区域掩膜可能**相互重叠**（不同 Gleason pattern 混合），不能默默当成互斥语义标签直接 argmax。

## 标注类别与语义

| 项目 | 核实内容 |
|---|---|
| **区域类别（五种）** | Normal、Stroma、Gleason Pattern 3（G3）、4（G4）、5（G5） |

> 类别名称与整数 ID 的映射必须以下载数据中的 label map 或发布方代码为准；未在本页列出的类不能推定存在。

## 数据划分与评估协议

Subset1（全组织切片）105 train + 45 test；Subset2（活检）37+16；Subset3（全片多扫描仪）144+67 是扫描图像数，同一玻片可能有多份扫描。

## 文件结构与读取方法

- TIFF WSI（主办方统一近 20× 缩放）
- 每张训练图配最多五个二值 TIFF masks（G3/G4/G5/Normal/Stroma），实际类别缺席则对应 mask 可缺失

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

- 官方 2026-09-18 更新扫描仪像素尺寸；例如 Akoya ~0.500553 μm/px、Philips 0.5、Zeiss ~0.44。
- 核实样本与标注的一一对应关系，并保留原始标签文件的版本号与来源信息。
- 如果提供了病例/玻片 ID，优先使用**患者或玻片级**数据划分，避免相邻 patch 泄漏。

### 建模提示

- Sub3 多扫描仪图非独立病例，训练测试切勿按扫描文件随机划分；数据 CC BY-NC-SA 4.0，下载可能需登记。

### 评估指标

组织 Gleason pattern 区域分割（Dice 等）及官方 Gleason grading 指标；多扫描仪域泛化。

## 相关资源

- [data](https://aggc22.grand-challenge.org/AGGC22/)
- [paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4172090)
- [official](https://aggc22.grand-challenge.org/AGGC22/)

## 引用

正式参考文献请在 [原论文](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4172090) 的出版社页面导出 BibTeX，不手写未经核实的作者/期刊字段。

## 注意事项

1. **来源可信度**：官方挑战赛；部分页面访问可能受限。
2. **任务边界**：Sub3 多扫描仪图非独立病例，训练测试切勿按扫描文件随机划分；数据 CC BY-NC-SA 4.0，下载可能需登记。
3. **数据授权**：使用前查阅官方文件的许可、注册与下载条件；源代码许可证不能替代数据许可证。
4. **可复现性**：统计以对应发布包、真实文件数、患者去重和官方测试划分为准；本页未对每个下载压缩包逐字节校验。
