# SegLungTCGA 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

SegLungTCGA 是来自 TCGA 肺腺癌 WSI 的组织语义颜色分块数据，用于建模各组织区域构成及其与临床因素的关联。

### 相关论文与发布方

- [官方/第一方来源](https://github.com/animgoeth/SegLungTCGA)
- [原论文](https://bmccancer.biomedcentral.com/articles/10.1186/s12885-022-10081-w#article-info)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2021 |
| **器官/组织或物种** | Lung |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | WSI-derived colored tissue-region patches (87x87 μm physical field) |
| **标注内容** | images |
| **扫描/附加条件** | (from TCGA) |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 454 images + file mapping info |
| **格式/数据形态** | WSI 派生的 **87×87 µm 物理尺寸**区域及对应类别颜色编码；不是固定 87×87 个图像像素 |
| **采集与版本** | 仓库发布拆分 ZIP 压缩卷 `.001`…`.005` 和 `tcga_patient_file_mapping.csv`；旧 TCGA 文件 ID 与新 GDC ID 经 CSV 对应。 |

---

## 任务与标注

不同颜色表示组织区域类型；颜色标签转换为离散分类时必须核查官方 palette；并非每个细胞核的实例轮廓。

### 类别与标签语义

- orange — tumor
- green — stroma
- yellow — mixed
- purple — vessel
- grey — necrosis
- navy — lung
- light blue — immune
- light pink — bronchi
- dark grey — background

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

索引记录 454 个 images/source files（单位与文件 ID 对照要按原发布清点），源于 TCGA lung adenocarcinoma；患者级 split 不是数据包天然固定的机器学习划分。

---

## 文件组成与读取方式

- `SegLungTCGA.zip.001`…`.005`：多卷压缩文件
- `tcga_patient_file_mapping.csv`：patient、旧 file ID 与当前 GDC file ID 对照
- 按颜色区分组织的 WSI 派生图像

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

- 合并/解压多卷 ZIP，读取映射 CSV 恢复 TCGA 病例，再把官方颜色图转换为 tissue label。

### 建模与数据泄漏风险

- 千万不要写成 87×87 像素 patch；病人 TCGA ID 与图像来源必须匹配。

### 评估指标

组织类型语义 IoU/Dice；与临床变量关联时使用患者级统计。

---

## 相关资源

- [data](https://github.com/animgoeth/SegLungTCGA)
- [paper](https://bmccancer.biomedcentral.com/articles/10.1186/s12885-022-10081-w#article-info)
- [download](https://github.com/animgoeth/SegLungTCGA)
- [official](https://github.com/animgoeth/SegLungTCGA)

---

## 引用

正确 BibTeX 请从 [论文记录](https://bmccancer.biomedcentral.com/articles/10.1186/s12885-022-10081-w#article-info) 导出；不编造作者与卷期页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与其他 TCGA 研究可能病例相交，需按 TCGA barcode 检查。
4. **核查边界**：原作者数据；87×87单位为μm
