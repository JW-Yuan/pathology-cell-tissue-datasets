# CryoNuSeg 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

CryoNuSeg 是冷冻 H&E 切片的细胞核实例分割基准，从 TCGA 冷冻样本获得多个组织器官的 512×512 patches，旨在评估非固定石蜡切片条件下的核分割泛化。

### 相关论文与发布方

- [官方/第一方来源](https://github.com/masih4/CryoNuSeg)
- [原论文](https://www.sciencedirect.com/science/article/pii/S0010482521001438)
- [代码/项目仓库](https://github.com/masih4/CryoNuSeg)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2021 |
| **器官/组织或物种** | multiple (10: adrenal gland, larynx, lymph nodes, mediastinum, pancreas, pleura, skin, testes, thymus, and thyroid gland) |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | patch (512x512) |
| **标注内容** | images + segmentation masks + binary labels |
| **扫描/附加条件** | 40x (from TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 8000 nuclei from 30 patches (from 30 wsi) |
| **格式/数据形态** | 30 张 RGB 512×512、核实例 pixel masks（公开仓库提供 ImageJ 标注流程与生成方法） |
| **采集与版本** | 10 个器官，各 3 张 WSI 各抽取一块；注释核数量有文献报告 7,596，而有的汇总约写 8,000，不能精确混用。 |

---

## 任务与标注

手工勾画每个核的像素级轮廓（instance），对比常规 FFPE H&E 具有不同的冷冻伪影。

### 类别与标签语义

- Nucleus / Background：单类核实例，不提供核表型多类别分类真值

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

30 张来自 TCGA 的图像，论文组织以 10 organ×3 patch 给出；跨器官评测时应按器官分组而非随机 patch。

---

## 文件组成与读取方式

- H&E 512×512 图像
- 每个核的 ImageJ 标注/实例 mask
- 作者 GitHub 提供 mask 生成辅助代码

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

- 读取实例掩膜时先确认同一 ID 是否唯一，不可因为所有核都属一种语义就丢弃实例区别。

### 建模与数据泄漏风险

- 冷冻切片非 FFPE，数据规模不足以可靠随机分割很多训练/验证样本。

### 评估指标

AJI、Dice、PQ 及跨器官泛化指标。

---

## 相关资源

- [data](https://www.kaggle.com/datasets/ipateam/segmentation-of-nuclei-in-cryosectioned-he-images)
- [github](https://github.com/masih4/CryoNuSeg)
- [paper](https://www.sciencedirect.com/science/article/pii/S0010482521001438)
- [download](https://www.kaggle.com/datasets/ipateam/segmentation-of-nuclei-in-cryosectioned-he-images)
- [official](https://github.com/masih4/CryoNuSeg)

---

## 引用

正式引文请从 [原论文](https://www.sciencedirect.com/science/article/pii/S0010482521001438) 获取并导出 BibTeX，不猜测完整作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：TCGA 来源需按病例 ID 排除与其他 TCGA 派生集的潜在交叉。
4. **核查边界**：论文作者仓库；冷冻切片实例分割
