# NuClick 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

NuClick 是交互式核分割框架，使用用户点击/线条作为提示预测核轮廓；发布了 IHC 组织中的淋巴细胞分割数据，也提供白细胞显微图数据。当前记录主要指 IHC lymphocyte 子集。

### 相关论文与发布方

- [官方/第一方来源](https://github.com/navidstuv/NuClick)
- [原论文](https://arxiv.org/pdf/2005.14511.pdf)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2020 |
| **器官/组织或物种** | Multiple tissues (IHC lymphocyte dataset) |
| **染色及模态** | IHC |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (256x256) |
| **标注内容** | images + mask |
| **扫描/附加条件** | 以官方扫描信息为准 |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 671, Valid: 200 |
| **格式/数据形态** | IHC 染色 ROI 256×256 RGB + 细胞核实例/语义分割 masks，训练示例包含交互点击监督 |
| **采集与版本** | IHC 子集 Train 671、Validation 200。官方项目还发布独立 WBC blood 子集，不能直接并入该 IHC 数量。 |

---

## 任务与标注

目标为 IHC 组织中淋巴细胞的轮廓分割；NuClick 的交互输入（click、scribble）是条件/算法输入，不是另一种细胞类别。

### 类别与标签语义

- Lymphocyte（免疫组化标记的淋巴细胞）
- Background / 未指定其他细胞类别

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

871 张 IHC patch（671 train + 200 validation）；不同于 WBC 子集；无独立核类型多分类赛道。

---

## 文件组成与读取方式

- `hemato_data.zip` 等官方发布压缩包（NuClick Warwick 发布）
- IHC 原图与核 segmentation masks
- 原作者点击提示工具和模型代码

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

- 从下载包检查 ROI mask、图像、是否含 click 输入，固定独立测试集。

### 建模与数据泄漏风险

- `Lymphocyte` 是细胞类型不是 organ；IHC 不应写 H&E。

### 评估指标

交互核分割 Dice/IoU、实例级 F1；评价时可固定点击点数/位置。

---

## 相关资源

- [data](https://warwick.ac.uk/fac/cross_fac/tia/data/nuclick/)
- [paper](https://arxiv.org/pdf/2005.14511.pdf)
- [download](https://warwick.ac.uk/fac/cross_fac/tia/data/nuclick/hemato_data.zip)
- [official](https://github.com/navidstuv/NuClick)

---

## 引用

请从 [原论文/出版社](https://arxiv.org/pdf/2005.14511.pdf) 导出 BibTeX，不能使用非真实示例作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：作为 IHC 分割任务，不能把同一个 ROI 的点击变换视为多幅独立原图。
4. **核查边界**：NuClick原作者实现及数据说明
