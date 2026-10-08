# ACDC-LungHP 数据集详情

## 2026-10-08 官方来源核查

- **第一方来源**：[官方/作者发布页](https://acdc-lunghp.grand-challenge.org/DATA/)
- **主要任务**：seg、classi
- **数据与标注**：images + xml
- **适用范围**：Lung histopathology WSI challenge with 150 annotated training and 50 testing slides; XML region annotations.
- **版本/来源提醒**：官方挑战赛；分类/分割阶段应分开描述


## 数据集描述

ACDC-LungHP 官方赛题使用肺组织病理全切片图像（WSI），训练阶段 150 例含人工标注样本，测试阶段 50 例。官方数据页说明 WSI 是 TIFF 格式，参考标注为 XML 格式。任务解读应优先依据官方赛题规则；不能在没有来源时推定每张图都有某套固定四类标签、边界框或二值掩膜。

## 数据与标注

- **器官**：Lung
- **染色**：H&E
- **规模**：训练 150，测试 50
- **图像**：TIFF 全切片图像
- **原始标注**：官方 XML 区域标注；测试真值不等同于公开标注
- **访问限制**：官方挑战赛数据下载可能需要注册。

## 相关资源

- [官方数据介绍](https://acdc-lunghp.grand-challenge.org/DATA/)
- [当前记录所关联论文](https://ieeexplore.ieee.org/document/9265237)

## 引用注意

原详情页所含 `Author, A.`、`Author, B.` 等占位作者以及 `github.com/example` 并非可靠的正式引用，已删除。发表论文时请从实际使用的官方赛题或论文记录导出 BibTeX。
