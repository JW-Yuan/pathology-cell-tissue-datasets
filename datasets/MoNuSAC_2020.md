# MoNuSAC 2020 数据集详情

## 数据集描述

MoNuSAC 2020（Multi-organ Nuclei Segmentation and Classification Challenge）是一个针对**多器官细胞核分割与分类**任务的大规模组织病理学数据集。  
数据来自多个器官（肺、前列腺、肾脏、乳腺）的 H&E 染色切片，提供**实例级细胞核轮廓标注**以及**细胞核类别标签**，适合用来训练和评估联合分割 + 分类模型。

## 数据集基本信息

- **名称**：MoNuSAC 2020
- **年份**：2020
- **器官类型**：multiple（Lung, Prostate, Kidney, Breast）
- **染色方式**：H&E (Hematoxylin and Eosin)
- **数据集大小**：约 31,411 个细胞核实例，来自 209 张图像
- **图像分辨率**：patch 尺寸大致在 81×113 到 1422×2162 像素之间
- **任务类型**：
  - 细胞核实例分割（seg）
  - 细胞核分类（classi）
- **数据类型**：patch 图像（来自 WSIs 的裁剪）
- **放大倍数**：40x（TCGA 切片）

## 文件结构（基于实际 MoNuSAC 发布包）

在实际下载的 MoNuSAC 发布包中，数据主要分成两个顶层目录，对应训练与测试：

```text
MoNuSAC/
├── MoNuSAC_images_and_annotations_trainning/      # 训练集（图像 + 标注）
└── MoNuSAC Testing Data and Annotations/          # 测试集（图像 + 标注）
```

### 训练集：MoNuSAC_images_and_annotations_trainning

训练目录下按**病例/病人**进行分组，每个顶层子目录通常对应一个 TCGA 病例，例如：

```text
MoNuSAC_images_and_annotations_trainning/
├── TCGA-2Z-A9JG-01Z-00-DX1/          # 某个病例（示例）
│   ├── TCGA-2Z-A9JG-01Z-00-DX1_1.svs
│   ├── TCGA-2Z-A9JG-01Z-00-DX1_1.tif
│   ├── TCGA-2Z-A9JG-01Z-00-DX1_1.xml
│   ├── TCGA-2Z-A9JG-01Z-00-DX1_2.svs
│   ├── TCGA-2Z-A9JG-01Z-00-DX1_2.tif
│   ├── TCGA-2Z-A9JG-01Z-00-DX1_2.xml
│   └── ...（该病例下可能还有更多切片/patch）
├── TCGA-XX-XXXX-.../
└── ...
```

关键点：

- **同一个 basename（去掉扩展名，如 `TCGA-2Z-A9JG-01Z-00-DX1_1`）下，理想情况有三件套**：
  - `.svs`：全切片（Whole Slide Image）
  - `.tif` / `.tiff`：对应的图像 patch 或转换后的图像
  - `.xml`：对应的标注文件（细胞核轮廓 + 属性）
- `check_svs_tif_xml_triplets.py` 脚本就是在这个目录里按 basename 聚合，检查每个 basename 是否同时拥有 `svs + tif + xml` 三种文件，并统计：
  - 完整三件套的数量
  - 缺失某一类文件的情况（只含 svs / 仅 svs+xml 无 tif 等）
  - svs 与 xml 是否一一对应（同一 basename 下数量是否相等）

### 测试集：MoNuSAC Testing Data and Annotations

测试目录结构与训练类似，同样按病例顶层目录组织，每个病例目录下包含若干 `svs / tif / xml` 文件：

```text
MoNuSAC Testing Data and Annotations/
├── TCGA-XXXX-....../
│   ├── <basename>.svs
│   ├── <basename>.tif
│   ├── <basename>.xml      # 测试集在官方评测中可能仅使用部分标注
│   └── ...
└── ...
```

`check_svs_tif_xml_triplets.py` 会同时遍历训练和测试两个目录，输出 TRAIN/TEST 各自的三件套完整性统计。

### SVS / TIF 分辨率关系

`check_svs_tif_resolutions.py` 进一步对训练 + 测试中的 `.svs` 与 `.tif` 进行**分辨率比对**：

- 使用 `openslide` 读取 `.svs` 的 level 0 尺寸（最高分辨率）。
- 使用 `PIL.Image` 读取 `.tif` 的第 0 帧尺寸。
- 按 basename 匹配 `.svs` 与 `.tif`，输出：
  - 分辨率完全一致的对（标记为 `SAME`）
  - 分辨率不一致的对（标记为 `DIFF`，便于后续核查）。

这说明 MoNuSAC 数据不仅提供高分辨率的 SVS 原始切片，同时也提供了与之对应的 TIF 图像，二者在绝大多数情况下应保持空间对齐（若有差异则可通过该脚本快速定位）。

### XML 标注结构与 Attribute 名称

`scan_xml_attribute_names.py` 对训练与测试目录下所有 `.xml` 进行解析，主要做两件事：

1. **统计 `<Attribute Name="...">` 的所有 Name 取值及其出现次数**（train 与 test 分开统计并汇总），帮助理解：
   - XML 中有哪些类型的属性（例如与细胞类型、形态特征、层级信息等相关的字段）。
   - 哪些属性只在训练或测试中出现。
2. **按“病例目录（顶层子目录）”统计每个病例下 XML 文件个数**，验证：
   - 顶层子目录确实可以视作“病人/病例”的单位。
   - 每个病例拥有多少张带标注的切片/patch。

综合以上脚本的分析结果，可以更清楚地理解 MoNuSAC 的组织方式：

- 顶层按病例目录划分，每个病例下有多个切片（svs + tif + xml）。
- basename 层面期待形成 svs/tif/xml 三件套，对齐同一块组织区域。
- XML 中通过 `<Attribute Name="...">` 记录了丰富的实例级属性（包括但不限于类别信息），是细胞核分割 + 分类任务的关键信息来源。

## 标注情况

### 细胞核类别（基于 XML Attribute Name 扫描结果）

根据脚本 `scan_xml_attribute_names.py` 对训练与测试目录下全部 XML 的统计，  
在 `<Attribute Name=\"...\">` 中实际出现的 **细胞级类别相关 Name** 主要包括：

1. **Epithelial**（上皮细胞核）  
2. **Lymphocyte**（淋巴细胞核）  
3. **Macrophage**（巨噬细胞核）  
4. **Neutrophil**（中性粒细胞核）  
5. **Ambiguous**（类别不确定/模糊的细胞核，在测试集中大量出现，用于标记难以归类的实例）

此外还出现过：

- `Description`：仅在极少数 XML 中出现，多为说明性文本，不作为细胞类别使用。  
- `1`：极少量记录，通常可视为历史/工具产生的占位属性，同样不作为明确的细胞类别。

因此，在实际建模时，一般将 **Epithelial / Lymphocyte / Macrophage / Neutrophil** 作为主要可区分的细胞核类别，  
并视任务需要选择是否单独建模 `Ambiguous`，或在评测时将其忽略/合并到“其他”类别。

### 标注格式（典型）

以“实例分割 + 类别标签”方式为主，每张图像会给出：

- **实例掩码（instance mask）**：
  - 与图像同尺寸的二维数组
  - 每个非零像素的值为**实例 ID**，相同 ID 表示同一个细胞核
- **实例级属性表**（可通过 XML / JSON / 单独表格文件提供），包含：
  - 实例 ID
  - 细胞核类别（如 tumor / inflammatory / stromal 等）
  - 可能还包括质心坐标、外接矩形等辅助信息

### 标注统计

- **总图像数**：209 张（来自多个病例）
- **总细胞核实例数**：约 31,411 个
- **器官覆盖**：肺、前列腺、肾脏、乳腺
- **标注粒度**：实例级（每个核单独标注）

## 数据特点

### 多器官、多中心

- 数据来源于 TCGA 多个项目，涵盖 Lung、Prostate、Kidney、Breast 四类器官。
- 多中心采集带来较大的染色和扫描差异，更贴近真实应用场景。

### 联合分割 + 分类任务

- 不仅提供核的**边界/实例分割**，还提供**类别标签**，支持：
  - 单一器官/单一任务模型
  - 多器官、多任务联合学习

### 尺度与分辨率多样性

- patch 尺寸不固定（81×113 到 1422×2162），对模型的**输入尺寸适配**与**多尺度建模**提出要求。

## 使用建议

### 数据加载与预处理（示意代码）

实际数据格式取决于下载包的具体实现，这里以“图像 + XML 标注（轮廓 + 类别）”为例给出一个伪代码示意：

```python
import cv2
import xml.etree.ElementTree as ET
import numpy as np

image_path = "TrainData/Images/case_XXXX.png"
anno_path = "TrainData/Labels/case_XXXX.xml"

# 读取图像
img = cv2.imread(image_path)[:, :, ::-1]  # BGR -> RGB

# 解析 XML，获取每个实例的轮廓和类别
tree = ET.parse(anno_path)
root = tree.getroot()

instances = []
for obj in root.findall(".//Object"):
    cls_name = obj.findtext("Type")   # 细胞核类别
    # 获取轮廓点（具体 tag 名称以官方 XML 为准）
    points = []
    for pt in obj.findall(".//Point"):
        x = float(pt.get("X"))
        y = float(pt.get("Y"))
        points.append((x, y))
    instances.append({"class": cls_name, "contour": np.array(points, dtype=np.float32)})

# 根据轮廓生成实例掩码
h, w = img.shape[:2]
inst_mask = np.zeros((h, w), dtype=np.int32)
for inst_id, inst in enumerate(instances, start=1):
    cv2.fillPoly(inst_mask, [inst["contour"].astype(np.int32)], inst_id)
```

> 注意：上述代码仅为示意，具体字段名与结构应以官方 XML/JSON 格式说明为准。

### 模型选择与任务设计

- **细胞核分割**：
  - 可使用 U-Net、U-Net++、DeepLab、HoVer-Net、Mask R-CNN 等。
- **细胞核分类**：
  - 方案一：先分割，再对每个实例提取 patch + 特征，使用 CNN/Transformer 分类。
  - 方案二：端到端的实例分割 + 分类网络（如 Mask R-CNN with multi-head）。
- **跨器官泛化**：
  - 利用器官标签（若提供）进行 domain adaptation 或 multi-task 学习。

### 评估指标

- **分割任务**：
  - Dice / IoU（基于实例或像素）
  - AJI / PQ 等实例级指标
- **分类任务**：
  - 准确率、精确率（Precision）、召回率（Recall）、F1-score
  - 混淆矩阵（按细胞核类别）

## 相关资源

- **数据集主页**：<https://monusac-2020.grand-challenge.org/>
- **论文链接**：<https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9446924>
- **数据下载**：<https://drive.google.com/file/d/1lxMZaAPSpEHLSxGA9KKMt_r-4S8dwLhq/view>

## 引用

如果您在研究中使用了 MoNuSAC 2020 数据集，请引用官方论文（以下为示意 BibTeX，具体信息请以论文主页为准）：

```bibtex
@article{monusac2020,
  title   = {MoNuSAC 2020: Multi-organ Nuclei Segmentation and Classification Challenge},
  author  = {Author, A. and Author, B. and Others},
  journal = {IEEE Transactions on Medical Imaging},
  year    = {2021}
}
```

## 注意事项

1. **数据使用许可**：请仔细阅读 Grand Challenge 页面与论文中的许可条款，仅在允许的范围内使用数据。
2. **隐私与伦理**：数据来自真实患者的病理切片，但已做去标识化处理，使用时仍需遵循所在机构的伦理规范。
3. **类别不平衡**：不同类型细胞核数量可能存在明显差异，训练时建议考虑重采样、类别权重或合适的损失函数。
4. **多中心差异**：不同中心/实验室的染色与扫描条件不同，建议在训练中加入颜色归一化或 domain adaptation 技术，以提升泛化能力。

