# MIDOG 2022 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

MIDOG 2022（MItosis DOmain Generalization）侧重跨肿瘤、实验室、物种和扫描仪域的**有丝分裂目标检测**，输入 H&E 数字组织图像，输出有丝分裂位置。

### 相关论文与发布方

- [官方/第一方来源](https://midog2022.grand-challenge.org/midog2022/)
- 论文与数据下载请参考第一方数据入口


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2022 |
| **器官/组织或物种** | multiple (6 for train 10 for test) |
| **染色及模态** | H&E |
| **具体任务** | detection |
| **图像单元与尺寸** | Patch |
| **标注内容** | H&E image regions + mitotic figure detection annotations (locations; not masks) |
| **扫描/附加条件** | 以官方扫描信息为准 |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 405 cases, 9501 mitotic annotation |
| **格式/数据形态** | 组织 H&E TIFF/图像区块 + 标注 mitotic figures/hard negatives 的检测坐标 |
| **采集与版本** | 官方训练版本约 405 个 ROI/cases、9,501 个 mitotic annotations 和 11,051 个难负例；跨多个肿瘤和物种域。 |

---

## 任务与标注

有丝分裂与 hard negative 为检测标签（中心点或候选框类表示），不是每个细胞核或组织区域的实例像素掩膜。

### 类别与标签语义

- Mitotic figure（有丝分裂细胞）
- Hard negative（近似核形但非有丝分裂；通常辅助训练）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

405 个图像区域覆盖多种域；其中部分 domain 的公开标注可能隐藏/不同阶段开放，详情以官方 download 页面为准。

---

## 文件组成与读取方式

- WSI 导出的 TIFF/ROI 图像
- 有丝分裂与 hard-negative 标注文件
- 官方入门 notebook 与域信息

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

- 读取检测标签的图像坐标，统一不同扫描倍率与比例，在滑窗预测时回映射到原图。

### 建模与数据泄漏风险

- 任务应为 mitosis detection，不能被错误写为核或细胞分割；训练域和隐藏域不能无差别混作有标签数据。

### 评估指标

Mitosis detection F1、官方距离匹配阈值的 precision/recall 与跨域泛化。

---

## 相关资源

- [data](https://midog2022.grand-challenge.org/)
- [download](https://drive.google.com/drive/folders/1P73g1xg8jw_JGLJaDFQDnxwQA7ROVykA)
- [official](https://midog2022.grand-challenge.org/midog2022/)

---

## 引用

须从第一方挑战页检索正式引文；缺少文献元数据时暂不编造。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与早期 MIDOG 2021 和 MIDOG++ 可能存在延续域/病例重合，需核实。
4. **核查边界**：官方MIDOG挑战赛；任务为有丝分裂检测
