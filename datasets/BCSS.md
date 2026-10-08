# BCSS 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Breast Cancer Semantic Segmentation（BCSS）以 TCGA 乳腺癌全切片为源，由病理相关专业人员协作进行组织区域多类标注，侧重组织语义分割、肿瘤微环境分析而不是单细胞实例分割。

### 相关论文与发布方

- [官方/第一方来源](https://github.com/PathologyDataScience/BCSS)
- [原论文](https://academic.oup.com/bioinformatics/article/35/18/3461/5307750)
- [官方代码/原作者仓库](https://github.com/PathologyDataScience/BCSS?tab=readme-ov-file#usage)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2019 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch |
| **标注内容** | patch + segmentation mask |
| **扫描/附加条件** | (TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 151 TCGA WSIs; approximately 20,000 annotated tissue regions (not 20,000 independently released patches) |
| **格式/数据形态** | TCGA 原始 WSI + 从 WSI 切出的组织 ROI 与 PNG 像素级语义掩膜 |
| **采集与版本** | 151 张来源 WSI，约 20,000 个手工描绘组织区域；22 类区域标注的计数单位是标注，不是 20,000 张独立图像。 |

---

## 任务与标注

官方发布 repo 用 PNG 的像素值编码组织语义，配套 `meta/gtruth_codes.tsv` 才能解释类别 ID。文件名还能反推出源 WSI 和 patch 位置，需要下载原始 TCGA 图像以恢复 RGB。

### 类别与标签语义

- 多类组织标注（22 类）——详见 gtruth_codes.tsv 官方类别对照表
- 常见肿瘤/间质/炎性区域/坏死等只是部分标签，不能凭示例压缩完整标签集

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

图像对应 TCGA 来源 WSI，未确认每个镜像都提供官方固定训练/验证/测试分割；评测时按患者切分，并避免将同一 WSI 的不同 ROI 分入不同集合。

---

## 文件组成与读取方式

- `meta/gtruth_codes.tsv`：组织语义编码
- PNG ground-truth mask：每像素类别编号
- TCGA 图像标识/空间位置：从文件名追溯来源 WSI

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

- 先加载 mask 并对照 `gtruth_codes.tsv` 转为语义类别，再在 TCGA 获取对应 RGB ROI。

### 建模与数据泄漏风险

- BCSS 与 TIGER 的部分 TCGA 标注存在衍生/重用关系；不要当成两个完全独立的病例集。

### 评估指标

像素级 mIoU、按类别 Dice；类别不平衡时记录各类结果，不用实例 PQ 误算为细胞分割。

---

## 相关资源

- [data](https://bcsegmentation.grand-challenge.org/)
- [paper](https://academic.oup.com/bioinformatics/article/35/18/3461/5307750)
- [github](https://github.com/PathologyDataScience/BCSS?tab=readme-ov-file#usage)
- [download](https://drive.google.com/drive/folders/1zqbdkQF8i5cEmZOGmbdQm-EP8dRYtvss)
- [official](https://github.com/PathologyDataScience/BCSS)

---

## 引用

引用请从 [原论文或出版社页面](https://academic.oup.com/bioinformatics/article/35/18/3461/5307750) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：TIGER 部分 WSIROIS/TCGA 数据从 BCSS、NuCLS 适配，可能重叠。
4. **核查边界**：原作者BCSS发布仓库
