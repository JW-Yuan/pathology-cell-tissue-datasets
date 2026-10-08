# DigestPath2019 - colonoscopy tissue segment 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

DigestPath2019 结肠镜活检组织分割与筛查子任务，用于在大型 H&E 显微图上分割恶性区域并分类组织良恶性；不能和其印戒细胞检测子赛道混为一谈。

### 相关论文与发布方

- [官方/第一方来源](https://digestpath2019.grand-challenge.org/)
- [原论文](https://arxiv.org/pdf/1907.03954.pdf)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2019 |
| **器官/组织或物种** | Colon |
| **染色及模态** | H&E |
| **具体任务** | seg、classi |
| **图像单元与尺寸** | patch (avg 5kx5k) |
| **标注内容** | images + lesion annotation |
| **扫描/附加条件** | 20x |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 660, Test: 212 |
| **格式/数据形态** | 组织 ROI RGB 大图（平均约 5,000×5,000）与阳性样本 JPG 二值病灶 mask |
| **采集与版本** | 20×；阳性部分标注 255 前景、0 背景；病理医生可能漏标少量恶性腺体。 |

---

## 任务与标注

250 张训练阳性图像具有恶性区域像素级标签，410 张阴性图没有病灶 mask 因其病灶为阴性；不是对所有组织类型全面语义标注。

### 类别与标签语义

- Malignant lesion（恶性区域）
- Non-malignant/background（非病灶）
- Whole tissue benign/malignant（图像级筛查类别）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

训练 660 = 250 positive（源自 93 张 WSI）+ 410 negative（源自 231 张 WSI）；测试 212 张，来自 152 位患者。

---

## 文件组成与读取方式

- H&E colonoscopy tissue image（平均 ~5000×5000 px）
- 训练阳性病灶 JPG mask
- 组织良恶性分类标签

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

- JPG 病灶 mask 采用阈值（例如 128）获得二值 GT；核查 mask 与 RGB 尺寸和裁剪原点对齐。

### 建模与数据泄漏风险

- 一张 WSI 可含多块组织，每张发布图可能仅截取一两个；别把 660 个 tissue 当成 660 个患者。

### 评估指标

阳性像素分割 Dice/IoU + 图像级良恶性准确率/AUC。

---

## 相关资源

- [data](https://digestpath2019.grand-challenge.org/)
- [paper](https://arxiv.org/pdf/1907.03954.pdf)
- [download](https://drive.google.com/drive/folders/1hLd_OD4eGeyUrmb7UCWxxFfGSwwMI15V)
- [official](https://digestpath2019.grand-challenge.org/)

---

## 引用

正式引文请从 [原论文](https://arxiv.org/pdf/1907.03954.pdf) 获取并导出 BibTeX，不猜测完整作者。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 DigestPath2019 印戒细胞检测子任务为不同任务与图像来源，不能混标。
4. **核查边界**：官方挑战赛；结肠切片分割与分类子任务
