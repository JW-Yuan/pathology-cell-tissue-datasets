# Multi-Scanner SCC 数据集详情

> 参考 PanNuke 详情页组织，官方资料核对日期：2026-10-08。本页只确认写出有据可查的数据及其版本；无法独立核实的文件树、标签映射或划分不作虚构。

## 数据集描述

Multi-Scanner SCC 是 CATCH 犬皮肤鳞状细胞癌子集的多设备扫描扩展，专门研究切片图像在扫描仪差异下的组织分割/配准稳健性。

### 相关论文与发布方

- [官方/第一方来源](https://zenodo.org/records/7418555)
- [原论文](https://link.springer.com/chapter/10.1007/978-3-658-41657-7_46)


---

## 数据集基本信息（汇总）

| 项目 | 核实信息 |
|---|---|
| **发布/挑战赛年份** | 2023 |
| **器官/组织或物种** | Skin (Canine) |
| **染色及模态** | H&E |
| **具体任务** | registration、seg |
| **图像单元与尺寸** | wsi |
| **标注内容** | images + contours (JSON) |
| **扫描/附加条件** | 5 scanners |

---

## 核心数据量与图像格式

| 特征 | 描述 |
|---|---|
| **规模与计数单位** | 44 samples á 5 scanners (220 wsi) |
| **格式/数据形态** | 44 个真实玻片由五台扫描设备得到 220 张金字塔 TIFF WSI，组织多边形提供 MS COCO JSON 与 SlideRunner SQLite |
| **采集与版本** | 官方 Zenodo 7418555 写明 1,243 个多边形人工标注在 Aperio ScanScope CS2 上，之后传输给另外四台扫描仪。Zenodo 提供约 4 μm/px 的下采样金字塔 TIFF 版本。 |

---

## 任务与标注

手工分割 tumor 和六类皮肤组织；跨扫描的 mask 是经坐标转换迁移，不是五台设备分别独立人工标注。

### 类别与标签语义

- Tumor（肿瘤）
- Epidermis（表皮）
- Dermis（真皮）
- Subcutis（皮下）
- Bone（骨）
- Cartilage（软骨）
- Inflammation + necrosis（炎症及坏死）

> 类别顺序、背景编码与实例 ID 仅在来源明确时列出；不得借用其他数据集的类别编号。

---

## 数据划分与统计口径

44 样本×5 scanners，只有 44 个原始标本；训练/测试必须以标本而非扫描图片分组。

---

## 文件组成与读取方式

- `scc.json`：COCO polygon 标注
- `scc.sqlite`：SlideRunner 注释格式
- 多扫描仪金字塔 TIFF 文件（5 台设备）

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

- 统一不同设备像素尺寸和图像仿射/非刚性配准；标注坐标从原始扫描仪转换需核查。

### 建模与数据泄漏风险

- 220 张扫描图 ≠ 220 个独立病例，且所有对象为犬而不是人；也不能与 CATCH SCC 子集当独立数据。

### 评估指标

跨设备 mIoU/Dice、配准 landmark error（若有评估）及 domain shift 鲁棒性。

---

## 相关资源

- [data](https://zenodo.org/records/7418555)
- [paper](https://link.springer.com/chapter/10.1007/978-3-658-41657-7_46)
- [download](https://zenodo.org/records/7418555)
- [official](https://zenodo.org/records/7418555)

---

## 引用

请从 [出版社/原论文](https://link.springer.com/chapter/10.1007/978-3-658-41657-7_46) 导出 BibTeX；不编写未经证实的作者或卷号。

---

## 注意事项

1. **版本与统计口径**：同一个项目不同 release、论文和挑战赛的样本数可能不同；不能混合 WSI、patch、ROI、患者及细胞实例数量。
2. **许可与下载**：数据许可、注册条件及测试集真值可用性以发布方为准；第三方镜像及源码 License 不能替代数据授权。
3. **与其他数据集重叠**：来源明确为 CATCH 的 44 张 SCC 标本。
4. **核查边界**：原作者Zenodo多扫描仪SCC数据
