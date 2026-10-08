# ANORAK 数据集详情

> 参考 PanNuke 详情页的章节结构，严格区分官方已发布信息、当前收录的版本与尚不能核实的部分。资料核查：2026-10-08。

## 数据集描述

本条目描述本地整理的 92 张肺组织 H&E 图像及独立人工多边形细胞注释，和 Nature Cancer 2023 的 ANORAK 肺腺癌组织学分级模型同名，但不是该论文发布的同一标签任务。

### 相关论文与官方来源

- [相关 Nature Cancer 论文（并非本地自标注标签发布页）](https://www.nature.com/articles/s43018-023-00694-w)
- [原论文或挑战论文](https://www.nature.com/articles/s43018-023-00694-w)

## 数据集基本信息（汇总）

| 项目 | 核实内容 |
|---|---|
| **发布/赛事年份** | 2023 |
| **器官/样本** | Lung |
| **染色/模态** | H&E |
| **适用任务** | seg、classi |
| **图像形态** | variable-size RGB tiles |
| **原始数据与监督** | images from literature/public sources (jpg/png) + self-annotated cell_anno (LabelMe JSON: polygon + label per instance) |
| **扫描/其他** | 20x; 92 images; cite image sources; self-annotated cell_anno; layout: image/ + cell_anno/ |

## 核心数据量与图像格式

| 项目 | 核实内容 |
|---|---|
| **数量（注明统计单位）** | 92 images (W 477–2000 px, H 536–2000 px, 62 distinct sizes); 92 cell JSON; 130,150 nuclei (7 classes: tumor 39.53%, lymphocyte 21.48%, stroma 18.86%, RBC 15.24%, macrophage 2.87%, karyorrhexis 1.98%, epithelial 0.04%) |
| **图像/文件表示** | image/{stem}.jpg 或 .png：宽 477–2000、高 536–2000 的 RGB 图像；cell_anno/{stem}.json：LabelMe 风格 `shapes` 列表，每个对象含 `label` 与像素 `points` |
| **采集与版本说明** | 本地样本统计：总 130,150 个自标注实例；各类别计数须在获得原始 JSON 后重新核对，不能由论文反推。 |

## 任务与标注

每一个 `shapes[]` 是一个细胞实例，多边形 vertices 需要自行闭合生成实例 mask；以上 JSON 是本项目自标注，不是 Nature Cancer 论文的原始真值。

## 标注类别与语义

| 项目 | 核实内容 |
|---|---|
| **本地自标注（7 类）** | Tumor Cell、Lymphocyte Cell、Stroma Cell、Red Blood Cell、Macrophage Cell、Karyorrhexis Cell、Epithelial cell |

> 类别名称与整数 ID 的映射必须以下载数据中的 label map 或发布方代码为准；未在本页列出的类不能推定存在。

## 数据划分与评估协议

92 张 JPG/PNG（32 JPG、60 PNG）与 92 个 JSON 同 stem 对齐；未获得可核验的官方 train/val/test 划分。

## 文件结构与读取方法

- image/{stem}.jpg 或 .png：宽 477–2000、高 536–2000 的 RGB 图像
- cell_anno/{stem}.json：LabelMe 风格 `shapes` 列表，每个对象含 `label` 与像素 `points`

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

- 本地样本统计：总 130,150 个自标注实例；各类别计数须在获得原始 JSON 后重新核对，不能由论文反推。
- 核实样本与标注的一一对应关系，并保留原始标签文件的版本号与来源信息。
- 如果提供了病例/玻片 ID，优先使用**患者或玻片级**数据划分，避免相邻 patch 泄漏。

### 建模提示

- 图像原始出处、授权、患者级去重、20×倍率与人工标签审核流程尚未有可验证的外部逐图证据；不能对外宣传为 ANORAK 官方公开细胞核分割 benchmark。

### 评估指标

若用户自建划分，需患者/图像来源隔离；用核实例 PQ 和各类 F1，并声明标注归属。

## 相关资源

- [paper](https://www.nature.com/articles/s43018-023-00694-w)
- [data](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899116/)
- [official](https://www.nature.com/articles/s43018-023-00694-w)
- [original_paper_data](https://zenodo.org/records/10016027)

## 引用

正式参考文献请在 [原论文](https://www.nature.com/articles/s43018-023-00694-w) 的出版社页面导出 BibTeX，不手写未经核实的作者/期刊字段。

## 注意事项

1. **来源可信度**：官方论文对应原始ANORAK；仓库的细胞JSON是自标注版本，不能混同。
2. **任务边界**：图像原始出处、授权、患者级去重、20×倍率与人工标签审核流程尚未有可验证的外部逐图证据；不能对外宣传为 ANORAK 官方公开细胞核分割 benchmark。
3. **数据授权**：使用前查阅官方文件的许可、注册与下载条件；源代码许可证不能替代数据许可证。
4. **可复现性**：统计以对应发布包、真实文件数、患者去重和官方测试划分为准；本页未对每个下载压缩包逐字节校验。
