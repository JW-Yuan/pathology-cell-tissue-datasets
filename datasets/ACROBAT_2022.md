# ACROBAT 2022 数据集详情

## 数据集描述

ACROBAT（Automatic Registration of Breast Cancer Tissue）是目前规模最大的 WSI 配准数据集，旨在推进乳腺癌组织病理全切片图像（WSI）多染色配准算法的研究与开发。

### 核心目标

将 IHC（免疫组化）染色的乳腺癌组织切片 WSI 与对应的 H&E 染色 WSI 进行精准配准（Multimodal WSI Registration）。每位患者的 H&E 切片可匹配 1–4 张 IHC 切片（如 ER、PR、HER2、KI67）。

## 数据集基本信息

- **器官类型**：乳腺 (Breast)
- **染色方式**：多染色（H&E + IHC：ER、PR、HER2、KI67）
- **数据集大小**：Train: 750 张；Valid: 100 张；Test: 300 张（共 1152 例乳腺癌患者，4212 张 WSI）
- **放大倍数**：40x — Hamamatsu 扫描仪
- **数据来源**：CHIME Study（瑞典）
- **任务类型**：WSI 配准（Registration）

## 数据集规模与划分

| 子集 | WSI 数量 | 说明 |
|------|---------|------|
| 训练集 | 750 | 含 H&E + IHC 配对，带 landmark 标注 |
| 验证集 | 100 | 同上 |
| 测试集 | 300 | 同上 |
| **合计** | **1150（竞赛）** | 总数据 4212 张 WSI（含全数据集） |

## 标注格式

- **Landmark 点标注**：每对 H&E–IHC 图像间提供对应的地标点（landmark）坐标，用于评估配准精度
- 标注格式为结构化坐标文件，评估指标为地标点配准误差（Target Registration Error, TRE）

## 数据特点

### 多染色配对
- 每个 H&E WSI 对应 1–4 张 IHC WSI
- IHC 类型包括：ER（雌激素受体）、PR（孕激素受体）、HER2（人表皮生长因子受体 2）、KI67（增殖标志物）

### 临床意义
- 跨染色配准是临床研究和多组学整合分析的基础工具
- 支持形态与生物标志物的空间关联分析

### 技术挑战
- H&E 与 IHC 图像颜色外观差异大
- 组织切片可能存在形变、旋转等非线性形变
- WSI 分辨率极高，计算量大

## 使用建议

### 评估指标

```python
# 目标配准误差（TRE，Target Registration Error）
# 单位：微米（μm）
# 计算方法：对应 landmark 点配准后的欧几里得距离均值
import numpy as np

def compute_TRE(pred_landmarks, gt_landmarks, pixel_spacing_um):
    """
    pred_landmarks: (N, 2) 预测配准后的坐标
    gt_landmarks:   (N, 2) 真实配准的 landmark 坐标
    pixel_spacing_um: 像素实际尺寸（μm/pixel）
    """
    diff = pred_landmarks - gt_landmarks
    distances_px = np.sqrt((diff ** 2).sum(axis=1))
    distances_um = distances_px * pixel_spacing_um
    return distances_um.mean()
```

### 数据加载建议

- 推荐使用 `openslide-python` 加载 WSI 文件
- 配准可采用基于特征点（如 SuperPoint + SuperGlue）或基于深度学习的方法
- 预处理时注意多染色间的颜色标准化

## 相关资源

- [Grand Challenge 官方页](https://acrobat.grand-challenge.org/)
- [论文（MedIA 2024）](https://www.sciencedirect.com/science/article/pii/S1361841524001828)
- [arXiv 预印版](https://arxiv.org/abs/2305.18033)
- [数据集描述论文](https://arxiv.org/abs/2211.13621)
- [Zenodo 挑战结构数据](https://zenodo.org/records/6361806)

## 引用

如果您使用了此数据集，请引用：

```bibtex
@article{acrobat2024,
  title={The ACROBAT 2022 challenge: Automatic registration of breast cancer tissue},
  author={Weitz, Philippe and others},
  journal={Medical Image Analysis},
  year={2024},
  publisher={Elsevier}
}
```

## 注意事项

1. **数据使用许可**：数据遵循 Creative Commons 许可协议，使用前请查阅官方许可说明。
2. **数据访问**：数据通过 Grand Challenge 平台申请获取，需注册账号。
3. **配准复杂性**：不同病例的切片层数、IHC 类型不同，需灵活处理缺失配对的情况。
4. **扫描仪差异**：所有图像使用 Hamamatsu 扫描，相对统一，但染色强度因批次而异。
