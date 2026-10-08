# CoNSeP - HoVer-Net 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

CoNSeP（Colorectal Nuclei Segmentation and Phenotypes）与 HoVer-Net 工作共同发布，来自结直肠腺癌组织图像，具备逐核实例轮廓和核表型标签。

### 相关论文与发布方

- [官方/第一方来源](https://warwick.ac.uk/fac/cross_fac/tia/data/hovernet/)
- [原论文](https://www.sciencedirect.com/science/article/abs/pii/S1361841519301045?via%3Dihub)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2019 |
| **器官/组织或物种** | Colorectal adenocarcinoma |
| **染色及模态** | H&E |
| **具体任务** | seg、classi |
| **图像单元与尺寸** | patch (1000x1000) |
| **标注内容** | images + nuclei (location + class) |
| **扫描/附加条件** | 40x (UHCW) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 27 images, Test: 14 images, 24.319 nuclei |
| **格式/数据形态** | RGB H&E 1,000×1,000 图像与每核分割/类型标签，原作者数据包含 `.mat` 标注 |
| **采集与版本** | 41 张图片、16 位结直肠腺癌患者、24,319 个核，典型 40×。 |

---

## 任务与标注

核级实例分割（instance map）与细胞核类型注释；原始多类标签可按论文评测需要合并，但合并后不能宣称保留了原始完整类别。

### 类别与标签语义

- Other（其他）
- Inflammatory（炎性）
- Healthy epithelial（健康上皮）
- Dysplastic/malignant epithelial（异型/肿瘤上皮）
- Fibroblast（成纤维细胞）
- Muscle（肌细胞）
- Endothelial（内皮）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

原作者发布 train 27 images / test 14 images，必须遵照其划分与不同病人样本关系。

---

## 文件组成与读取方式

- RGB 图像：1000×1000
- MAT annotation：核实例像素图、核类型/中心位置（键以实际 `.mat` 为准）

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

- `scipy.io.loadmat` 读取核 ID/type map，核类别编号按原包对照表解释。

### 建模与数据泄漏风险

- 后续 HoVer-Net 实现可能把 7 类合并为更少类别；评测要先声明采用哪个类别映射。

### 评估指标

核实例 Dice、AJI、PQ；带核类型的 mPQ/类别 F1。

---

## 相关资源

- [data](https://warwick.ac.uk/fac/cross_fac/tia/data/hovernet/)
- [paper](https://www.sciencedirect.com/science/article/abs/pii/S1361841519301045?via%3Dihub)
- [download](https://opendatalab.com/OpenDataLab/CoNSeP/tree/main)
- [official](https://warwick.ac.uk/fac/cross_fac/tia/data/hovernet/)

---

## 引用

引用请从 [原论文或出版社页面](https://www.sciencedirect.com/science/article/abs/pii/S1361841519301045?via%3Dihub) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：Lizard 整理来源含 CoNSeP 图像数据，注意跨集合重复。
4. **核查边界**：作者实验室数据页；Warwick站点可能要求登录
