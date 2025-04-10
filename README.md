# 香港疫情可视化大屏

基于Flask和ECharts实现的香港疫情数据可视化大屏，展示香港各区域疫情数据和趋势分析。项目采用响应式设计，适配不同尺寸的屏幕，提供丰富的交互功能和数据展示方式。

## 项目特点

- **全面的数据概览**：提供累计确诊、新增确诊、增长率、康复率、死亡率等关键指标
- **多样化的可视化图表**：包含趋势图、饼图、柱状图、地图、散点图等多种可视化方式
- **地理空间分析**：通过香港地图直观展示各区疫情分布情况和风险等级
- **关联性分析**：展示人口密度与确诊病例的关系，帮助分析潜在风险因素
- **交互式体验**：所有图表支持悬停查看详情、缩放、数据筛选等交互功能
- **响应式设计**：自适应不同屏幕尺寸，提供最佳视觉体验
- **美观的界面设计**：深色主题背景搭配鲜明的数据颜色，提高可读性

## 功能详情

### 数据概览区

- **累计确诊**：显示总确诊病例数，附带视觉指标
- **新增确诊**：显示最新一日的新增病例数
- **增长率**：显示当前的疫情增长率，不同趋势显示不同颜色
- **康复率**：显示当前累计康复病例占累计确诊的比例
- **死亡率**：显示当前累计死亡病例占累计确诊的比例

### 可视化图表

- **香港疫情趋势**：展示时间序列上的新增和累计确诊数据变化
- **香港各区疫情分布地图**：通过颜色深浅直观展示各区确诊情况，支持缩放和悬停查看详情
- **高风险地区排名**：按确诊数从高到低排列各区域，直观对比各区情况
- **确诊病例区域分布**：饼图展示各区域累计确诊病例分布比例
- **近期疫情增长率**：柱状图展示每日增长率变化趋势，正负增长使用不同颜色
- **各区风险等级分布**：展示不同风险等级的区域数量和对应的确诊数据
- **人口密度与确诊关系**：散点图分析人口因素与确诊病例的相关性，包含趋势线
- **康复率与死亡率对比**：结合堆叠柱状图和折线图展示康复情况、死亡情况及其比率变化

## 技术栈

- **后端**：Python Flask
- **数据处理**：Pandas, Openpyxl
- **前端框架**：Bootstrap 5
- **可视化库**：ECharts 5.4
- **JS库**：jQuery 3.6
- **字体图标**：Font Awesome 6
- **字体**：Noto Sans SC (Google Fonts)

## 项目运行

### 环境要求

- Python 3.7+
- Flask
- pandas
- openpyxl

### 安装依赖

```bash
pip install flask pandas openpyxl
```

### 运行应用

```bash
python app.py
```

运行后，在浏览器中访问 http://127.0.0.1:5000 即可查看可视化大屏。

## 目录结构

```
香港疫情可视化大屏/
├── app.py                         # Flask应用主文件
├── data_processor.py              # 数据处理模块
├── 香港各区疫情数据_20250322.xlsx # 数据源Excel文件
├── templates/
│   └── index.html                 # 大屏页面模板
└── static/
    ├── css/
    │   └── style.css              # 页面样式
    ├── js/
    │   ├── charts.js              # 图表配置和数据处理
    │   └── hongkong.json          # 香港地图GeoJSON数据
    └── favicon.ico                # 网站图标
```

## 数据说明

项目使用的数据源为`香港各区疫情数据_20250322.xlsx`，包含以下字段：

- **报告日期**：数据记录日期
- **地区名称**：香港各区域名称
- **新增确诊**：当日新增确诊病例数
- **累计确诊**：截至当日累计确诊病例数
- **新增康复**：当日新增康复人数
- **累计康复**：截至当日累计康复人数
- **新增死亡**：当日新增死亡人数
- **累计死亡**：截至当日累计死亡人数
- **现存确诊**：当前仍在治疗的确诊病例数
- **发病率**：每10万人口中的确诊病例数
- **人口**：各区域人口数量
- **风险等级**：区域风险等级评估（低风险、中风险、高风险、极高风险）

## 使用指南

1. 启动应用后，访问 http://127.0.0.1:5000
2. 页面顶部显示数据概览卡片，包含关键疫情指标
3. 中间部分是图表展示区域，包含多种类型的可视化图表
4. 将鼠标悬停在图表上可查看详细数据
5. 香港地图支持缩放和平移操作，点击区域可查看详情
6. 时间序列图表支持缩放查看特定时间段数据
7. 部分图表支持数据筛选和排序功能

## 局限性和未来改进

- 当前版本数据为静态数据，未来可接入实时API
- 可添加更多预测和模型分析功能
- 可增强移动端的交互体验
- 可添加数据导出功能
- 可增加用户自定义视图的功能

## 许可信息

本项目仅供学习和研究使用，数据来源于公开渠道，如有侵权请联系删除。 

![image](https://github.com/user-attachments/assets/3b365f24-54dd-4641-afd0-9eb638c8ad73)
