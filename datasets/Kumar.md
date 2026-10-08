# Kumar 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Kumar 等 2017 发表的跨组织细胞核实例分割数据与技术，采自 TCGA 多器官 H&E 图像。与 MoNuSeg 2018 常用训练核图像/同源基准有密切联系。

### 相关论文与发布方

- [关联 MoNuSeg 挑战官方页面（不是 Kumar 2017 原始镜像认证）](https://monuseg.grand-challenge.org/Data/)
- [原论文](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=7872382)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2017 |
| **器官/组织或物种** | Multiple (7 organs) |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (1000x1000) |
| **标注内容** | images + nuclei seg + label |
| **扫描/附加条件** | 40x (TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 16 (13.372 nuclei), test same organ (4.130 nuclei): 8, test diff organ (4.121 nuclei): 6 |
| **格式/数据形态** | 30 张 1000×1000 H&E 图像、核边界实例真值 |
| **采集与版本** | 7 种器官：Breast、Liver、Kidney、Prostate、Bladder、Colon、Stomach；传统训练/测试安排为 16 train + 14 testing（8 同域+6 跨域）。 |

---

## 任务与标注

逐核实例轮廓/二值分割，不包含所有核的临床表型语义类型标注。

### 类别与标签语义

- Nucleus/Background
- Organ 类型是原图来源信息，不是单核分类标签

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

常见协议 16 train、8 same-organ test、6 different-organ test；并非所有 MoNuSeg 后续挑战划分都等于这项原论文划分。

---

## 文件组成与读取方式

- TCGA H&E 裁剪图像
- 核实例轮廓/掩膜标签，实际文件组织视 Kumar 原始/镜像版本

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

- 在 train/test 中按原始图像来源进行划分，实例 ID 需要唯一；不得凭 mask 假设有核型分类。

### 建模与数据泄漏风险

- 原先引用的 MoNuSeg 页面是关联挑战第一方入口，Kumar 2017 原始发布和后续 MoNuSeg 的 44 张竞赛数据需分别核对。

### 评估指标

AJI、Dice、核实例 PQ；应使用原论文 same-organ 与 cross-organ 方案。

---

## 相关资源

- [data](https://drive.google.com/drive/folders/1bI3RyshWej9c4YoRW-_q7lh7FOFDFUrJ)
- [paper](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=7872382)
- [download](https://drive.google.com/drive/folders/1SZMgB9ztnPWWlChWxNPLYDHBVCTdenu4)
- [official](https://monuseg.grand-challenge.org/Data/)

---

## 引用

请从 [出版社/原论文](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=7872382) 导出 BibTeX；不编写未经证实的作者或卷号。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 MoNuSeg 训练样本关联；不要把 Kumar 与 MoNuSeg 视为完全独立外部验证。
4. **核查边界**：原作者Kumar文献由MoNuSeg官方页引用；数据链接仍需按版本匹配
