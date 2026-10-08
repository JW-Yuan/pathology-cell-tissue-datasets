# BACH - ICIAR2018 数据集详情

> 参考 PanNuke 详情页的章节结构，严格区分官方已发布信息、当前收录的版本与尚不能核实的部分。资料核查：2026-10-08。

## 数据集描述

BACH/ICIAR 2018 乳腺癌病理图像挑战，包含显微镜图像四分类和 WSI 恶性组织区域标注两个子任务；两种样本类型不可合并统计。

### 相关论文与官方来源

- [原作者/挑战官方发布页面](https://iciar2018-challenge.grand-challenge.org/)
- [原论文或挑战论文](https://www.sciencedirect.com/science/article/abs/pii/S1361841518307941)

## 数据集基本信息（汇总）

| 项目 | 核实内容 |
|---|---|
| **发布/赛事年份** | 2018 |
| **器官/样本** | Breast |
| **染色/模态** | H&E |
| **适用任务** | classi、seg |
| **图像形态** | Patch (classi, 2048x1536) + WSI (semantic seg) |
| **原始数据与监督** | images (4 classes: normal 100, benign: 100, in situ carcinoma: 100, invasive carcinoma: 100) + 20 unlabeled + 10 labeled WSI (10 patients) |
| **扫描/其他** | Leica SCN400 |

## 核心数据量与图像格式

| 项目 | 核实内容 |
|---|---|
| **数量（注明统计单位）** | 400 |
| **图像/文件表示** | 显微图 `.tiff`：2048×1536 RGB，0.42 μm/px，图像级 4 类标签；WSI `.svs`：Leica SCN400，~0.467 μm/px；WSI 注释 `.xml`：多边形坐标和组织区域标签 |
| **采集与版本说明** | 官方数据使用许可为 CC BY-NC-ND；提供 WSI XML 解析示例，需要 OpenSlide。 |

## 任务与标注

显微镜分类的图像级标签不等于 WSI 的像素级标注；只有带标注的 WSI 具备有监督的区域标签。

## 标注类别与语义

| 项目 | 核实内容 |
|---|---|
| **显微镜图像（4 类）** | Normal（正常）、Benign（良性）、In situ carcinoma（原位癌）、Invasive carcinoma（浸润癌） |
| **WSI 病灶** | 组织标注区域类型以官方 XML 的标签字段为准 |

> 类别名称与整数 ID 的映射必须以下载数据中的 label map 或发布方代码为准；未在本页列出的类不能推定存在。

## 数据划分与评估协议

显微镜图像训练 400（每类 100），官方另有隐藏标签测试集；WSI 训练 30 张（其中 10 张带区域标注、20 张无标注），另有测试 10 张。

## 文件结构与读取方法

- 显微图 `.tiff`：2048×1536 RGB，0.42 μm/px，图像级 4 类标签
- WSI `.svs`：Leica SCN400，~0.467 μm/px
- WSI 注释 `.xml`：多边形坐标和组织区域标签

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

- 官方数据使用许可为 CC BY-NC-ND；提供 WSI XML 解析示例，需要 OpenSlide。
- 核实样本与标注的一一对应关系，并保留原始标签文件的版本号与来源信息。
- 如果提供了病例/玻片 ID，优先使用**患者或玻片级**数据划分，避免相邻 patch 泄漏。

### 建模提示

- 不能把 400 张 TIFF 分类图片标注为核实例分割；测评和下载需分清显微图与 WSI 的赛道。

### 评估指标

分类：Accuracy/macro F1；WSI 组织病灶分割：官方 IoU/Dice 协议。

## 相关资源

- [data](https://iciar2018-challenge.grand-challenge.org/Dataset/)
- [paper](https://www.sciencedirect.com/science/article/abs/pii/S1361841518307941)
- [download](https://zenodo.org/records/3632035)
- [official](https://iciar2018-challenge.grand-challenge.org/)

## 引用

正式参考文献请在 [原论文](https://www.sciencedirect.com/science/article/abs/pii/S1361841518307941) 的出版社页面导出 BibTeX，不手写未经核实的作者/期刊字段。

## 注意事项

1. **来源可信度**：ICIAR 2018挑战赛官方主页。
2. **任务边界**：不能把 400 张 TIFF 分类图片标注为核实例分割；测评和下载需分清显微图与 WSI 的赛道。
3. **数据授权**：使用前查阅官方文件的许可、注册与下载条件；源代码许可证不能替代数据许可证。
4. **可复现性**：统计以对应发布包、真实文件数、患者去重和官方测试划分为准；本页未对每个下载压缩包逐字节校验。
