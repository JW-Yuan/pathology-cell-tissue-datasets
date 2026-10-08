# TUPAC16 - aux 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

TUPAC16（2016）辅助有丝分裂检测数据来自乳腺癌 H&E 病理；不同于 TUPAC16 主赛题的肿瘤增殖评分 WSI 数据，其辅助集提供可定位的有丝分裂阳性点。

### 相关论文与发布方

- [官方/第一方来源](https://tupac.grand-challenge.org/)
- 原始论文与官方比赛信息以官方页面为准


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2016 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | detection |
| **图像单元与尺寸** | patch |
| **标注内容** | Breast histology image fields + mitotic figure coordinate annotations (CSV) |
| **扫描/附加条件** | 40x (from TCGA) Leica SCN400 |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 73 patients, 656 high-power fields/patch images (2016 mitosis detection auxiliary task) |
| **格式/数据形态** | 73 位患者、656 个高倍视野（HPF）；可见有丝分裂中心位置 CSV 坐标，来源多个扫描中心 |
| **采集与版本** | 40× 扫描；原挑战涉及 73 例乳腺癌病例，不能只写 73 images。部分病例来自更早期 AMIDA13，图像在转换/拼接版本中组织不同。 |

---

## 任务与标注

原始有丝分裂 GT 是位置点，而不是逐个 mitosis 的边界/像素实例 mask；非有丝分裂 hard-negative 另见替代标注仓库。

### 类别与标签语义

- Mitotic figure：有丝分裂阳性细胞（位置点）
- Hard negative / Non-mitosis：辅助训练负类（依据原作者/替代标签集）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

辅助图像涵盖 73 个患者的 656 个 HPF，主赛道有独立 WSI train/test；不可把两套样本数互换。

---

## 文件组成与读取方式

- H&E 乳腺高倍图像/原挑战 patch
- 原始 `mitoses_ground_truth` CSV（行中 y,x 中心坐标）
- 可选作者重标版本与 SQLite 注释（第三方/原作者后续标注）

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

- 读取 CSV 里的坐标时注意顺序为 `(y, x)`；若转换成 `(x, y)` 的通用检测框，必须显式交换。

### 建模与数据泄漏风险

- 不存在官方通用核实例分割 GT；使用扩展标签集应明确不同专家或版本造成的差异。

### 评估指标

有丝分裂检测 Precision/Recall/F1（官方中心匹配阈值）；主赛道 tumor proliferation score 是不同目标。

---

## 相关资源

- [data](https://tupac.grand-challenge.org/)
- [download](https://tupac.grand-challenge.org/Dataset/)
- [official](https://tupac.grand-challenge.org/)

---

## 引用

尚无足以填入完整 BibTeX 的可靠出版元数据，引用须以官方赛题论文记录为准。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：73 病例中一部分与 AMIDA13 挑战来源存在延续。
4. **核查边界**：TUPAC16官方挑战赛；aux子集为有丝分裂检测
