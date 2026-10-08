# CAMELYON17 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

CAMELYON17 从切片级转移检测提升至患者级病理 N 分期。数据由荷兰 5 个中心提供，每位患者 5 张淋巴结 WSI，目标是由各切片病灶状态合成患者级 pN-stage。

### 相关论文与发布方

- [官方/第一方来源](https://camelyon17.grand-challenge.org/Data/)
- [原论文](https://ieeexplore.ieee.org/document/8447230)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2017 |
| **器官/组织或物种** | Lymph node 乳腺癌淋巴结转移 |
| **染色及模态** | H&E |
| **具体任务** | classi、seg |
| **图像单元与尺寸** | WSI |
| **标注内容** | WSIs + patient pN-stage labels + lesion XML annotations on a limited training subset |
| **扫描/附加条件** | patient level analysis |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 500 (100 patients, 5 slides each); Test: 500 |
| **格式/数据形态** | `.tif` 多级 WSI；部分训练片有 ASAP XML 病灶多边形，其余主要是患者级分期标签 |
| **采集与版本** | 100 训练患者 + 100 测试患者，各 5 WSI；数据不应描述为 1,000 个独立患者。 |

---

## 任务与标注

公开患者级 pN-stage；仅 5 个中心各 10 张训练 WSI（合计 50）带 lesion-level XML 精细标注。原 CAMELYON16 切片还可被作为 lesion-level 训练补充。

### 类别与标签语义

- 转移灶等级：阴性、孤立肿瘤细胞、微转移、宏转移的切片级状态
- 患者级：按官方 pN-stage 类别与五枚淋巴结综合；不是每张 WSI 均有 binary mask

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

500 train WSI（100 patients）与 500 test WSI（100 patients）。测试标签和精确病灶标注不随所有图像公开发布。

---

## 文件组成与读取方式

- 按中心/患者组织的 TIFF WSI
- 训练表格中的 patient pN-stage
- 50 张带专家 contour 的训练 WSI 对应 XML

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

- 从五张淋巴结切片的模型输出汇总患者级类别；病灶 XML 经 ASAP 转换到对应像素层级。

### 建模与数据泄漏风险

- 不应声称全部 1,000 WSI 有公开精细 mask；患者是划分和评测的最小单位。

### 评估指标

患者 pN-stage 分类准确率或挑战赛官方评分，辅助 lesion-level FROC。

---

## 相关资源

- [data](https://camelyon17.grand-challenge.org/)
- [paper](https://ieeexplore.ieee.org/document/8447230)
- [download](https://pan.baidu.com/s/1mIzSewImtEisclPtTHGSyw)
- [official](https://camelyon17.grand-challenge.org/Data/)

---

## 引用

引用请从 [原论文或出版社页面](https://ieeexplore.ieee.org/document/8447230) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：与 CAMELYON16 的 training lesion ground truth 存在复用关系。
4. **核查边界**：CAMELYON17官方数据页；仅部分切片有病灶精标
