# MoNuSAC 2020 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

MoNuSAC 2020 多器官细胞核分割与分类挑战，来自 TCGA 的乳腺、肾、肺和前列腺 H&E 图像，拥有四类核轮廓级实例 GT。

### 相关论文与发布方

- [官方/第一方来源](https://monusac-2020.grand-challenge.org/)
- [原论文](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9446924)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2020 |
| **器官/组织或物种** | multiple (Lung, Prostate, Kidney, Breast) |
| **染色及模态** | H&E |
| **具体任务** | seg、classi |
| **图像单元与尺寸** | patch (81x113 to 1422x2162) |
| **标注内容** | images + mask |
| **扫描/附加条件** | 40x (TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 31.411 nuclei from 209 images |
| **格式/数据形态** | 高倍组织 ROI（分辨率不统一）+ 核实例多边形/XML 和由其转换的分类 instance masks |
| **采集与版本** | 公开训练 209 张图片、31,411 个核；后续测试含额外 101 张图和隐藏/公开程度不同的核标注，不应只用 209 概括整个赛题。 |

---

## 任务与标注

对四种核表型分割实例；ambiguous 或 difficult 区域在不同测试发布版本的处理方式可能不同，统计须明示。

### 类别与标签语义

- Epithelial（上皮）
- Lymphocyte（淋巴）
- Macrophage（巨噬）
- Neutrophil（中性粒）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

训练 209 张，测试 101 张（标签发布范围应按实际版本判断）；不可把训练核总数 31,411 当作全数据集总数。

---

## 文件组成与读取方式

- TCGA H&E 裁剪图像
- 核类别/核边界标注（XML / 栅格化 mask，格式按原发布版本）

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

- 依据 nucleus class 和 polygon ID 转换实例/类别 mask，保留 ambiguous 的忽略定义。

### 建模与数据泄漏风险

- 四类细胞核而非四个器官标签；不同图像大小不能直接强制 reshape；部分数据来自 TCGA。

### 评估指标

官方多类 PQ（mPQ）、分类 F1 和 nucleus instance segmentation 指标。

---

## 相关资源

- [data](https://monusac-2020.grand-challenge.org/)
- [paper](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9446924)
- [download](https://drive.google.com/file/d/1lxMZaAPSpEHLSxGA9KKMt_r-4S8dwLhq/view)
- [official](https://monusac-2020.grand-challenge.org/)

---

## 引用

请从 [出版社/原论文](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9446924) 导出 BibTeX；不编写未经证实的作者或卷号。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与其他 TCGA 源 nuclei benchmarks 可能源 WSI 重合，需按 TCGA ID 核对。
4. **核查边界**：MoNuSAC官方挑战赛
