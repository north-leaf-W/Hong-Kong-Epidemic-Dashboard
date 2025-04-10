import pandas as pd

# 读取Excel文件
file_path = '香港各区疫情数据_20250322.xlsx'
df = pd.read_excel(file_path)

# 显示前20行数据
print("香港各区疫情数据前20行：")
print(df.head(20))

# 显示数据基本信息
print("\n数据基本信息：")
print(f"总行数: {len(df)}")
print(f"列名: {list(df.columns)}")