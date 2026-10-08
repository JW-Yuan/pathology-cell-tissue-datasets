# RINGS 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

RINGS（Rapid IdentificatioN of Glandular Structures）是前列腺腺体自动分割数据和相关算法，强调癌变引起的腺体形态退变，旨在获得腺体轮廓，而不是核分割。

### 相关论文与发布方

- [官方/第一方来源](https://data.mendeley.com/datasets/h8bdwrtnr5/1)
- [原论文](https://doi.org/10.1016/j.artmed.2021.102076)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2021 |
| **器官/组织或物种** | prostate |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (1500x1500) |
| **标注内容** | images+mask |
| **扫描/附加条件** | 40x |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 1,500 patches / 18,851 glands (prior compiled count; exact official train/test counts pending verification) |
| **格式/数据形态** | 前列腺 H&E 组织图像块及人工 gland 区域/轮廓 GT |
| **采集与版本** | 先前整理版本统计约 1,500 张 patch 与 18,851 个腺体，但第一方 Mendeley 页面摘要未逐项确认这两个数量，完整计数须以下载包为准。Mendeley Data 原作者记录可明确核实 gland segmentation 任务。 |

---

## 任务与标注

每一标注对象为**腺体**，原论文方法融合间质区域的分割结果来定位腺体；不含逐核类型 class_map。

### 类别与标签语义

- Gland（前列腺腺体轮廓）
- Non-gland / surrounding stroma（非腺体组织）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

若采用之前整理的 1000/500 划分，需声明具体样本列表和文献协议；公开页面的摘要没有逐条确认这一划分，因此不能把它说成已验证的官方 train/test 数量。

---

## 文件组成与读取方式

- 前列腺腺体组织 H&E 组织图像
- 原作者人工 delineated gland masks
- Mendeley 记录 h8bdwrtnr5/1 的下载文件和出处信息

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

- 将腺体标签按像素或实例标识展开，确认腺体与相邻间质之间的边界定义。

### 建模与数据泄漏风险

- 不应标为 nucleus instance segmentation；“18,851”代表 glands，不是 nuclei。

### 评估指标

Gland segmentation Dice、sensitivity/IoU；论文报告约 90.16% 的 Dice（是方法表现，不是数据集性质）。

---

## 相关资源

- [data](https://data.mendeley.com/datasets/h8bdwrtnr5/1)
- [paper](https://doi.org/10.1016/j.artmed.2021.102076)
- [download](https://prod-dcd-datasets-cache-zipfiles.s3.eu-west-1.amazonaws.com/h8bdwrtnr5-1.zip)
- [official](https://data.mendeley.com/datasets/h8bdwrtnr5/1)

---

## 引用

正确 BibTeX 请从 [论文记录](https://doi.org/10.1016/j.artmed.2021.102076) 导出；不编造作者与卷期页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：属于前列腺腺体层级，与 GlaS/CRAG 的结肠腺体图像不是同一来源。
4. **核查边界**：作者发布的前列腺腺体分割数据
