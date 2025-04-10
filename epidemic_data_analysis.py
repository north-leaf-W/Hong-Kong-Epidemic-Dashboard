import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
plt.rcParams['axes.unicode_minus'] = False    # 用来正常显示负号

# 读取Excel文件
file_path = '香港各区疫情数据_20250322.xlsx'
df = pd.read_excel(file_path)

# 将报告日期转换为日期格式
df['报告日期'] = pd.to_datetime(df['报告日期'])

# 按日期分组计算总的新增确诊和累计确诊
daily_summary = df.groupby('报告日期').agg({
    '新增确诊': 'sum',
}).reset_index()

# 添加累计确诊列
daily_summary['累计确诊'] = daily_summary['新增确诊'].cumsum()

# 打印每日新增和累计确诊数据
print("每日新增和累计确诊数据:")
print(daily_summary.head(20))

# 计算总确诊病例数
total_confirmed = daily_summary['累计确诊'].max()
print(f"\n总确诊病例数: {total_confirmed}")

# 计算总的新增确诊病例数
total_new_cases = daily_summary['新增确诊'].sum()
print(f"总的新增确诊病例数: {total_new_cases}")

# 计算日均新增确诊
avg_daily_new = daily_summary['新增确诊'].mean()
print(f"日均新增确诊: {avg_daily_new:.2f}")

# 找出新增确诊最高的日期
max_increase_date = daily_summary.loc[daily_summary['新增确诊'].idxmax()]
print(f"新增确诊最高的日期: {max_increase_date['报告日期'].strftime('%Y-%m-%d')}, 新增病例: {max_increase_date['新增确诊']}")

# 计算7日移动平均
daily_summary['7日移动平均'] = daily_summary['新增确诊'].rolling(window=7).mean()

# 输出数据范围
date_range = (daily_summary['报告日期'].min(), daily_summary['报告日期'].max())
print(f"数据日期范围: {date_range[0].strftime('%Y-%m-%d')} 至 {date_range[1].strftime('%Y-%m-%d')}")
total_days = (date_range[1] - date_range[0]).days + 1
print(f"总天数: {total_days}")

# 创建双轴图表显示每日新增和累计确诊
plt.figure(figsize=(14, 7))
ax1 = plt.gca()
ax2 = ax1.twinx()

# 绘制每日新增确诊柱状图
bars = ax1.bar(daily_summary['报告日期'], daily_summary['新增确诊'], color='steelblue', alpha=0.6, label='每日新增确诊')
ax1.set_ylabel('每日新增确诊数', fontsize=12, color='steelblue')
ax1.tick_params(axis='y', labelcolor='steelblue')

# 绘制7日移动平均线
ax1.plot(daily_summary['报告日期'], daily_summary['7日移动平均'], color='orange', linewidth=2, label='7日移动平均')

# 绘制累计确诊折线图
line = ax2.plot(daily_summary['报告日期'], daily_summary['累计确诊'], color='red', linewidth=2, label='累计确诊')
ax2.set_ylabel('累计确诊数', fontsize=12, color='red')
ax2.tick_params(axis='y', labelcolor='red')

# 设置x轴日期格式
ax1.xaxis.set_major_locator(plt.MaxNLocator(10))  # 限制x轴上的日期标签数量
plt.xticks(rotation=45)
plt.title('香港疫情每日新增和累计确诊趋势', fontsize=14)

# 添加图例
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')

plt.tight_layout()
plt.savefig('香港疫情趋势图.png', dpi=300)
print("\n已保存趋势图：香港疫情趋势图.png")

# 按周分析确诊趋势
print("\n按周确诊趋势分析:")
# 创建周数和年份
daily_summary['year'] = daily_summary['报告日期'].dt.isocalendar().year
daily_summary['week'] = daily_summary['报告日期'].dt.isocalendar().week
weekly_data = daily_summary.groupby(['year', 'week']).agg({
    '新增确诊': 'sum',
    '报告日期': 'min'  # 获取每周的第一天
}).reset_index()
weekly_data = weekly_data.sort_values('报告日期')
print(weekly_data.head(10))

# 计算每月确诊情况
print("\n每月确诊情况:")
daily_summary['月份'] = daily_summary['报告日期'].dt.to_period('M')
monthly_data = daily_summary.groupby('月份').agg({
    '新增确诊': 'sum',
    '报告日期': 'count'
})
print(monthly_data.head(10))

# 保存分析结果到CSV文件
daily_summary.to_csv('香港每日疫情数据统计.csv', index=False, encoding='utf-8-sig')
weekly_data.to_csv('香港每周疫情数据统计.csv', index=False, encoding='utf-8-sig')
print("\n分析结果已保存到：香港每日疫情数据统计.csv 和 香港每周疫情数据统计.csv") 