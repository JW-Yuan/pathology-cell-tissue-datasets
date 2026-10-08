# SegPath 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

SegPath 使用同一组织切片重新染色（restaining）和免疫荧光来构建 H&E 组织图像的细胞/组织级语义分割标签，突破人工注释困难。

### 相关论文与发布方

- [官方/第一方来源](https://dakomura.github.io/SegPath/)
- [原论文](https://doi.org/10.1016/j.patter.2023.100688)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2023 |
| **器官/组织或物种** | multiple |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (984x984) |
| **标注内容** | 984x984 H&E patches + per-target binary masks obtained using registered restained immunofluorescence |
| **扫描/附加条件** | 20x - Zeiss MIRAX MIDI |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 158,687 patches |
| **格式/数据形态** | 984×984 H&E patches 与多个目标 marker 衍生的二值细胞/组织 masks；不同目标可单独下载 |
| **采集与版本** | 约 158,687 个组织 patches（具体不同 marker 的子集数量应单独统计）；官方项目页列出八个目标的分布，不应以其中红细胞 Zenodo 包概括全部数据。 |

---

## 任务与标注

各目标分割标签来自重新染色后的对应位置映射与 marker 识别，常见为单一目标的二值语义 mask，而不是像 PanNuke 那样所有类别同时具有核实例 ID。

### 类别与标签语义

- 八类细胞/组织分割目标：完整组织/marker 名称按原作者 SegPath 官网表
- 不同 marker 子集的 GT 不是天然同一张 H&E 的八通道联标

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

每个目标的标注与发布包独立组织，不能把不同 marker 子集的 patch 数机械相加成唯一样本数；划分依作者官方基准。

---

## 文件组成与读取方式

- H&E 图像 patches
- IF/restaining 对齐生成的 per-target segmentation mask
- 官方主页为各 target 单独给出的数据集链接

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

- 逐个 target 加载 image/mask 并确认是否属于同一个切片配对，避免错误拼成多标签实例分割。

### 建模与数据泄漏风险

- 原索引中的 Zenodo 7412580 是 RBC 子集，不是全部 SegPath；不能错误套用只含 H&E 的人工核 label 规则。

### 评估指标

各 target Dice/IoU、pixel-level F1；可将细胞目标和组织目标分组报告。

---

## 相关资源

- [data](https://dakomura.github.io/SegPath/)
- [paper](https://doi.org/10.1016/j.patter.2023.100688)
- [download](https://dakomura.github.io/SegPath/)
- [official](https://dakomura.github.io/SegPath/)

---

## 引用

正确 BibTeX 请从 [论文记录](https://doi.org/10.1016/j.patter.2023.100688) 导出；不编造作者与卷期页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：可能与原始 WSI 来源数据库存在交叉，须核对样本 ID 和切片级来源。
4. **核查边界**：原作者官网；8类细胞分割，按标记物单独下载
