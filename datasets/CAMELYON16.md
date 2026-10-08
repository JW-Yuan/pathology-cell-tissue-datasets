# CAMELYON16 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

CAMELYON16 聚焦乳腺癌哨兵淋巴结转移灶检测：输入 H&E 淋巴结全切片（WSI），既可做切片级是否转移判定，也可基于阳性切片中的专家描绘 ROI 评估病灶定位。

### 相关论文与发布方

- [官方/第一方来源](https://camelyon16.grand-challenge.org/Data/)
- [原论文](https://jamanetwork.com/journals/jama/article-abstract/2665774)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2016 |
| **器官/组织或物种** | Lymph node |
| **染色及模态** | H&E |
| **具体任务** | classi、seg |
| **图像单元与尺寸** | WSI |
| **标注内容** | images + binary masks |
| **扫描/附加条件** | slide level analysis |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | Train: 270 (160 Normal, 110 with metastases); Test: 130 |
| **格式/数据形态** | 多尺度 TIFF WSI；阳性训练切片可用 XML 轮廓和二值 WSI 掩膜 |
| **采集与版本** | 来自 Radboud UMC 与 UMC Utrecht 两个中心；总 400 WSI。 |

---

## 任务与标注

阳性训练样本的 XML 多边形和 WSI binary masks 表示乳腺癌转移灶而非核实例。正常 WSI 没有阳性病灶；注意官方 README 列出的少数不完全标注切片。

### 类别与标签语义

- 正常/转移：切片级 binary label
- ROI：转移瘤（tumor/metastasis）与非肿瘤组织（背景）；不提供细胞核类别标签

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

训练集 270 WSI（两个中心 170+100；合计 160 normal、110 tumor），测试 130 WSI。测试标注由挑战赛方管理；使用公开 GT 应核实下载包。

---

## 文件组成与读取方式

- WSI 多分辨率 `.tif`
- 阳性片专家病灶 `.xml` 轮廓
- 可选已转换的二值 mask

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

- 使用 OpenSlide/ASAP 读取 WSI；将 XML 坐标换算至金字塔目标倍率，再生成二值转移区域掩膜。

### 建模与数据泄漏风险

- 切片级标签不能被误作逐像素已覆盖标注；同一中心/患者的近邻切片不宜分散于训练/测试。

### 评估指标

病灶 FROC、切片级 AUC 与挑战赛官方指标；像素 Dice 仅对有真值的病灶区域有效。

---

## 相关资源

- [data](https://camelyon16.grand-challenge.org/)
- [paper](https://jamanetwork.com/journals/jama/article-abstract/2665774)
- [download](https://pan.baidu.com/s/1UW_HLXXjjw5hUvBIUYPgbA)
- [official](https://camelyon16.grand-challenge.org/Data/)

---

## 引用

引用请从 [原论文或出版社页面](https://jamanetwork.com/journals/jama/article-abstract/2665774) 导出正式 BibTeX；不使用未核实的作者/卷页。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：CAMELYON17 病灶阶段重用 CAMELYON16 标注数据。
4. **核查边界**：CAMELYON16官方数据页
