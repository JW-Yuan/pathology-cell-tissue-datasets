# Janowczyk et al. 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Janowczyk 与 Madabhushi 发布的 ER+ 乳腺癌核分割训练样例，配套公开教程解释如何从部分人工标注的 H&E 大图裁剪训练 patch。

### 相关论文与发布方

- [官方/第一方来源](https://www.andrewjanowczyk.com/use-case-1-nuclei-segmentation/)
- 论文与数据下载请参考第一方数据入口
- [源码/组织者仓库](https://github.com/choosehappy/public/tree/master/DL%20tutorial%20Code)

---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2016 |
| **器官/组织或物种** | Breast |
| **染色及模态** | H&E |
| **具体任务** | seg |
| **图像单元与尺寸** | Patch (2000x2000) |
| **标注内容** | images (12.000 nuclei) + masks |
| **扫描/附加条件** | 40x |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 143 |
| **格式/数据形态** | 143 张 2000×2000 原图（TIF）与对应同尺寸二值 mask（PNG） |
| **采集与版本** | 40×；原作者页面明确 137 名患者、143 张图片、约 12,000 个手动分割核。 |

---

## 任务与标注

白色像素指手动标注核的前景；不是全部核都有精细 mask，剩余区域不能全部当作确认背景。

### 类别与标签语义

- Nucleus（已手工勾画的核）
- Background/Unknown：未标注区域需要按论文负样本采样策略处理

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

143 张图属于 137 名患者，有少数患者多图；按文件名前一段的 patient ID 分离训练和测试，而非图片随机分组。

---

## 文件组成与读取方式

- `*_original.tif`：RGB H&E 组织影像
- `*_mask.png`：与原图配对的部分核标注
- 作者公开教程的 patch 提取 MATLAB 脚本

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

- 教程采用已标注核、边缘和估计背景采样训练 patch；把未注释区域忽略或适当抽样。

### 建模与数据泄漏风险

- 源 mask 部分标注，直接把未标区域当确定背景会污染分割真值。

### 评估指标

标注区域的像素 Dice/IoU；评价时应控制忽略区，不宣称含全图 exhaustively annotated nuclei。

---

## 相关资源

- [data](http://www.andrewjanowczyk.com/use-case-1-nuclei-segmentation/)
- [github](https://github.com/choosehappy/public/tree/master/DL%20tutorial%20Code)
- [download](https://andrewjanowczyk.com/wp-static/nuclei.tgz)
- [official](https://www.andrewjanowczyk.com/use-case-1-nuclei-segmentation/)

---

## 引用

须从第一方挑战页检索正式引文；缺少文献元数据时暂不编造。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：源于独立乳腺癌队列，仍需按病人 ID 防泄漏。
4. **核查边界**：原作者发布页；核标注并非必然全图覆盖
