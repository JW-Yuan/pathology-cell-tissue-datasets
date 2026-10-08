# SegPC-2021 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

SegPC-2021 是多发性骨髓瘤患者骨髓涂片浆细胞的核与细胞质区域分割挑战。它属于细胞病理学/骨髓穿刺涂片，不是 H&E 组织切片数据。

### 相关论文与发布方

- [官方/第一方来源](https://segpc-2021.grand-challenge.org/)
- 原始论文与官方比赛信息以官方页面为准
- [作者/赛事源码](https://github.com/dsciitism/SegPC-2021)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2021 |
| **器官/组织或物种** | Bone marrow (plasma cells) |
| **染色及模态** | Jenner-Giemsa |
| **具体任务** | seg |
| **图像单元与尺寸** | 2040x1536/1920x2560 |
| **标注内容** | images + nucleus and cytoplasma |
| **扫描/附加条件** | 按来源确认 |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 775 images, Train: 298, Valid: 200, Test: 277 |
| **格式/数据形态** | Jenner–Giemsa 染色 BMP 显微图，常见分辨率 2040×1536 或 1920×2560；训练提供核/胞质真值 |
| **采集与版本** | 775 张图：Train 298、Validation 200、Test 277；测试真值不公开。 |

---

## 任务与标注

三种像素级语义区域：细胞核、浆细胞胞质和背景；并非其他核表型的多分类数据集。

### 类别与标签语义

- Nucleus：浆细胞细胞核
- Cytoplasm：浆细胞胞质
- Background：非浆细胞前景

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

Train 298 与 Validation 200 附标签；Test 277 的参考标注挑战管理，不可声称公开可下载 mask。

---

## 文件组成与读取方式

- 高分辨率 `.bmp` 图片
- 训练/验证的 nuclei/cytoplasm segmentation masks
- 测试图像与评测提交信息

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

- 两种相机分辨率不同，要确保 mask 同步缩放；使用颜色增强时不能破坏 Jenner–Giemsa 关键形态。

### 建模与数据泄漏风险

- organ=Bone marrow，target=Plasma cell；不得写成 Blood H&E nuclei segmentation。

### 评估指标

nucleus/cytoplasm pixel Dice、IoU 与官方多类语义评测。

---

## 相关资源

- [data](https://segpc-2021.grand-challenge.org/)
- [github](https://github.com/dsciitism/SegPC-2021)
- [download](https://www.kaggle.com/datasets/sbilab/segpc2021dataset/data)
- [official](https://segpc-2021.grand-challenge.org/)

---

## 引用

尚无足以填入完整 BibTeX 的可靠出版元数据，引用须以官方赛题论文记录为准。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：部分病例或图像在研究论文中有镜像版本，检查是否重复。
4. **核查边界**：官方骨髓浆细胞分割挑战赛
