# PanNuke 数据集详情

## 数据集描述

**PanNuke** 是计算病理学中**大规模、高引用**的公开数据集之一，面向**细胞核实例分割**与**细胞核分类**。图像来自大量 **H&E 染色的全切片（WSI）**，覆盖 **19 种**组织/肿瘤类型，强调**泛癌种（pan-cancer）**场景下的模型泛化。

### 相关论文（建议至少阅读其一）

| 论文 | 说明 |
|------|------|
| **PanNuke: An Open Pan-Cancer Histology Dataset for Nuclei Instance Segmentation and Classification**（**ECDP / Springer LNCS，2019**） | **初始发布**：建立数据组织、**5 类**核语义与 **Fold 划分**等，类别与格式基本定型。 |
| **PanNuke Dataset Extension, Insights and Baselines**（后续工作，常见为期刊/预印本扩展） | **扩充与系统评估**：在更大规模或更多设置下汇报各任务表现；具体核数、patch 数等**以该文表格与官方下载包为准**。 |

下文中的 patch 数量、核总数在不同文献中可能写作 **约 7,904**、**约 21.64 万核**、**205,343**、**189,744** 等，差异来自**版本、是否去重统计、Fold 汇总口径**等，**务必以你本地的 `np.load(...).shape` 与最新官方说明为准**。

### 数据收集与图像特点（读论文时的要点）

1. **组织类型**：自 **19 种**不同组织类型采样，以获得较全面的细胞核与场景多样性。  
2. **视场与 patch**：WSI 上采样的**视场（FoV）**数量与最终 **256×256 patch** 数量在不同介绍中分别出现（例如**数百个 FoV** 与**数千个 patch**），二者为**不同粒度**，不要混为一谈。  
3. **核实例**：每个被标注的细胞核均有**实例级掩膜**（实例 ID 可在 `masks` 各前 5 个通道中非零像素中读取）。  
4. **未刻意筛选「干净场」**：来自 H&E WSI 的图像**并非**为展示而 **cherry-pick**；**未专门排除**各类 **artifacts**（气泡、拼接缝、阴影、折叠等技术伪影），更贴近真实阅片与算法鲁棒性评估场景。

---

## 数据集基本信息（汇总）

| 项目 | 说明 |
|------|------|
| **任务** | 细胞核 **实例分割** + **分类**（5 类核 + 背景通道） |
| **染色** | **H&E** |
| **器官/组织** | **19 类**（见下文 `types.npy`） |
| **Patch 尺寸** | **256 × 256**，RGB |
| **典型放大倍数** | 常见说明为 **40×**（以数据卡与论文为准） |
| **存储格式** | NumPy `.npy`（`Fold1` / `Fold2` / `Fold3`） |

---

## 核心数据量与图像格式（常见表述）

| 特征 | 细节 |
|------|------|
| **图像块（patch）数量** | 常见介绍为 **约 7,904** 个；**三折 `.npy` 行数相加**见下文「文件结构」中的实测形状（示例合计 **8001**），请以本机 `shape[0]` 为准。 |
| **单张 patch 大小** | **256 × 256 × 3** |
| **细胞核实例数** | 文献中常见 **约 205,343**、**约 21.64 万**、或按 Fold 汇总的 **189,744** 等；**以后续扩展论文与官方统计表为准**。 |
| **WSI 来源** | 文献中常见表述为自 **TCGA** 等大型公共队列及合作机构的全切片中采样（**2 万+** 张 WSI 等），覆盖 **19 种**组织类型；**具体清单与统计以论文及官方数据说明为准**。 |

---

## 任务与标注

对每个细胞核提供两类信息：

- **实例分割**：每个核有**像素级实例 ID**（同一 ID 属于同一实例；ID **不必从 1 开始或连续**，需在读入后建立映射）。  
- **分类**：每个实例属于 **5 种细胞语义类别之一**（见下表）。

---

## 细胞核五大类别（临床/组织学含义）

| 顺序（与 `masks` 前 5 通道一致） | 英文 | 含义概要 |
|--------------------------------|------|----------|
| 1 | **Neoplastic** | **肿瘤细胞核**——肿瘤诊断与分级中最受关注的一类。 |
| 2 | **Inflammatory** | **炎症细胞核**（如淋巴细胞、巨噬细胞等）——反映免疫/炎症微环境。 |
| 3 | **Connective / Soft tissue** | **结缔 / 软组织细胞核**（如成纤维细胞、间质相关）——间质成分。 |
| 4 | **Epithelial** | **上皮细胞核**（非肿瘤或良性上皮结构等，依论文定义）。 |
| 5 | **Dead** | **死亡 / 坏死相关细胞核**——凋亡、坏死等形态。 |

> 上表为**语义顺序**；与 `masks.npy` **通道下标**的对应关系为：**通道 0～4** 分别对应上表 **1～5**，**通道 5** 为背景（见下节）。

---

## 十九种组织类型（`types.npy`）

每张 patch 对应 **19 选 1** 的器官/组织字符串（与官方命名一致，注意大小写与下划线）：

`Adrenal_gland`，`Bile-duct`，`Bladder`，`Breast`，`Cervix`，`Colon`，`Esophagus`，`HeadNeck`，`Kidney`，`Liver`，`Lung`，`Ovarian`，`Pancreatic`，`Prostate`，`Skin`，`Stomach`，`Testis`，`Thyroid`，`Uterus`

---

## 数据划分：Fold 1 / 2 / 3

三份 **互不重叠** 的子集，便于 **3-fold 交叉验证**：常用 **两折训练/验证、一折测试**，具体划分以论文与代码为准。

---

## 文件结构与 `.npy` 形状（实测示例）

下列 **每个 Fold 内** 的 `shape` 与 **`dtype`** 来自常见发布包；若你下载的版本不同，**以 `np.load` 结果为准**。

```text
PanNuke/
├── Fold1/
│   ├── images.npy   # 例：shape = (2656, 256, 256, 3), dtype = float64
│   ├── masks.npy    # 例：shape = (2656, 256, 256, 6), dtype = float64
│   └── types.npy    # 例：shape = (2656,), dtype = <U13 等字符串类型
├── Fold2/
│   ├── images.npy   # 例：(2623, 256, 256, 3), float64
│   ├── masks.npy    # 例：(2623, 256, 256, 6), float64
│   └── types.npy    # 例：(2623,)
└── Fold3/
    ├── images.npy   # 例：(2722, 256, 256, 3), float64
    ├── masks.npy    # 例：(2722, 256, 256, 6), float64
    └── types.npy    # 例：(2722,)
```

- 上例三折 **第一维之和** = 2656 + 2623 + 2722 = **8001**（与部分介绍中的「约 7904」可能因**版本或是否计入某子集**不一致，以官方为准）。

### `images.npy`

- **形状**：`(num, H, W, 3)`，`H=W=256`。  
- **含义**：RGB 图像；常见为 **`float64`**，像素值落在 **0～255**（使用时再按需归一化到 `[0,1]` 或做标准化）。

### `masks.npy`

- **形状**：`(num, H, W, 6)`。  
- **通道 0～4**：五个细胞类别，**同一通道内**非零像素值为**实例 ID**；**不同数字表示不同实例**；**ID 不一定从 1 开始或连续**，需扫描唯一值。  
- **通道 5**：**背景**，取值为 **0 或 1**（**1** 表示背景像素）；该通道通常**不**作为「第 6 类细胞」，而是与前景实例掩膜配合使用。

| 通道索引 | 内容 |
|----------|------|
| 0 | Neoplastic cells |
| 1 | Inflammatory |
| 2 | Connective / Soft tissue cells |
| 3 | Dead cells |
| 4 | Epithelial cells |
| 5 | Background（0/1） |

### `types.npy`

- **形状**：`(num,)`，与 `images` / `masks` **第一维对齐**。  
- **含义**：该 patch 对应的 **19 种组织类型之一**（字符串）。

---

## 标注统计（示例：与旧版统计表一致时）

下列 **按类别核数** 的表格与站内 `_datasets.json` 中 **189,744** 总计一致时，可作为参考；若扩展集或新统计更新，**以新数据为准**。

| 细胞核类型 | 数量 | 比例 |
|------------|------|------|
| Neoplastic | 77,403 | 40.79% |
| Connective/Soft tissue | 50,585 | 26.66% |
| Inflammatory | 32,276 | 17.01% |
| Epithelial | 26,572 | 14.00% |
| Dead | 2,908 | 1.53% |
| **合计** | **189,744** | 100% |

---

## 使用建议（简要）

### 加载示例

```python
import numpy as np

images = np.load("Fold1/images.npy")  # (N, 256, 256, 3)
masks = np.load("Fold1/masks.npy")   # (N, 256, 256, 6)
types = np.load("Fold1/types.npy")   # (N,)
```

### 建模提示

- **类别不平衡**：肿瘤核与死细胞等比例差异大，注意采样与损失设计。  
- **实例 ID**：从各前景通道提取唯一非零值作为实例集合。  
- **伪影**：数据**未**保证无伪影，训练时可考虑增强或显式建模。

### 评估指标

分割：Dice、IoU、PQ 等；分类：准确率、宏/微平均 F1、混淆矩阵等。

---

## 相关资源

- [Warwick 数据页](https://warwick.ac.uk/fac/cross_fac/tia/data/pannuke/)  
- [PanNuke 项目页 / GitHub 导航](https://jgamper.github.io/PanNukeDataset/)  
- **ECDP 2019 论文**（Springer）：[*PanNuke: An Open Pan-Cancer Histology Dataset…*](https://link.springer.com/chapter/10.1007/978-3-030-23937-4_2)  
- 扩展与基线论文请检索：**PanNuke Dataset Extension, Insights and Baselines**（引用以正式出版信息为准）。

---

## 引用（ECDP 2019 示例）

```bibtex
@inproceedings{pannuke2019,
  title={PanNuke: An Open Pan-Cancer Histology Dataset for Nuclei Instance Segmentation and Classification},
  author={Gamper, Jevgenij and Koohbanani, Navid Alemi and Benet, Ksenija and Khuram, Ali and Rajpoot, Nasir},
  booktitle={European Congress on Digital Pathology},
  pages={11--19},
  year={2019},
  organization={Springer}
}
```

使用扩展版数据或基线结果时，请**同时引用**扩展论文（以正式 BibTeX 为准）。

---

## 注意事项

1. **许可**：遵守官方发布页及数据原始来源的使用协议。  
2. **版本与数字**：patch 数、核总数、比例等**以官方最新说明与本机数组形状为准**；不同论文/幻灯片可能沿用不同统计口径。  
3. **内存**：三份 Fold 体积较大，注意分批加载与存储。  
4. **标签语义**：**5 类核 + 背景通道**的定义与通道顺序**仅适用于本数据集**；跨项目复用标签映射前须单独核对。
