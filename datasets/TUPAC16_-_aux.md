# TUPAC16 - aux 数据集详情

## 数据集简介

TUPAC16（2016）乳腺肿瘤增殖评估挑战赛使用 WSI 进行肿瘤增殖评分预测，另提供辅助的有丝分裂图像/坐标标注，用于 **mitotic figure detection**。辅助数据不能误写为核实例分割 mask 数据。

## 数据集基本信息

- **年份**：2016（挑战赛年份，与后续论文发表年份不同）
- **组织**：乳腺 H&E 病理切片
- **标注任务**：有丝分裂细胞检测（Detection）；原挑战赛主任务还包含增殖评分预测
- **辅助数据规模**：73
- **原始标注**：有丝分裂位置坐标，相关方案采用 CSV 格式；不存在通用的逐实例 mask GT 假设
- **文件形态**：patch

## 官方来源与论文

- [TUPAC16 官方挑战赛](https://tupac.grand-challenge.org/)
- [官方数据集说明](https://tupac.grand-challenge.org/Dataset/)
- [挑战赛论文](https://arxiv.org/abs/1807.08284)
- [原始辅助标注格式与替代标签说明](https://github.com/DeepMicroscopy/TUPAC16_AlternativeLabels)

## 核查备注

TUPAC16官方挑战赛；aux子集为有丝分裂检测。数据下载可能受挑战赛注册和授权限制；具体坐标、标注版本与划分以原始发布包为准。
