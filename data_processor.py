import pandas as pd
import json
from datetime import datetime

class DataProcessor:
    def __init__(self, file_path):
        self.file_path = file_path
        self.df = None
        self.daily_summary = None
        self.load_data()
        
    def load_data(self):
        # 读取Excel文件
        self.df = pd.read_excel(self.file_path)
        # 将报告日期转换为日期格式
        self.df['报告日期'] = pd.to_datetime(self.df['报告日期'])
        
        # 按日期分组计算总的新增确诊和累计确诊
        self.daily_summary = self.df.groupby('报告日期').agg({
            '新增确诊': 'sum',
            '新增康复': 'sum',
            '新增死亡': 'sum',
            '累计确诊': 'sum',
            '累计康复': 'sum',
            '累计死亡': 'sum',
        }).reset_index()
        
        # 如果daily_summary中没有累计确诊列，则添加
        if '累计确诊' not in self.daily_summary.columns:
            self.daily_summary['累计确诊'] = self.daily_summary['新增确诊'].cumsum()
        
        # 如果daily_summary中没有累计康复列，则添加
        if '累计康复' not in self.daily_summary.columns:
            self.daily_summary['累计康复'] = self.daily_summary['新增康复'].cumsum()
        
        # 如果daily_summary中没有累计死亡列，则添加
        if '累计死亡' not in self.daily_summary.columns:
            self.daily_summary['累计死亡'] = self.daily_summary['新增死亡'].cumsum()
        
        # 计算增长率
        self.daily_summary['增长率'] = self.daily_summary['新增确诊'].pct_change() * 100
        self.daily_summary['增长率'] = self.daily_summary['增长率'].fillna(0)
        
        # 计算康复率和死亡率
        self.daily_summary['康复率'] = self.daily_summary.apply(
            lambda x: (x['累计康复'] / x['累计确诊']) * 100 if x['累计确诊'] > 0 else 0, 
            axis=1
        )
        self.daily_summary['死亡率'] = self.daily_summary.apply(
            lambda x: (x['累计死亡'] / x['累计确诊']) * 100 if x['累计确诊'] > 0 else 0, 
            axis=1
        )
        self.daily_summary['现存确诊'] = self.daily_summary['累计确诊'] - self.daily_summary['累计康复'] - self.daily_summary['累计死亡']
        
    def get_overview_data(self):
        """获取数据概览信息"""
        total_confirmed = int(self.daily_summary['累计确诊'].max())
        latest_date = self.daily_summary['报告日期'].max().strftime('%Y-%m-%d')
        latest_increase = int(self.daily_summary.iloc[-1]['新增确诊'])
        latest_growth_rate = float(self.daily_summary.iloc[-1]['增长率'])
        recovery_rate = float(self.daily_summary.iloc[-1]['康复率'])
        fatality_rate = float(self.daily_summary.iloc[-1]['死亡率'])
        
        return {
            'total_confirmed': total_confirmed,
            'latest_date': latest_date,
            'latest_increase': latest_increase,
            'growth_rate': round(latest_growth_rate, 2),
            'recovery_rate': round(recovery_rate, 2),
            'fatality_rate': round(fatality_rate, 2)
        }
    
    def get_trend_data(self):
        """获取趋势图数据"""
        dates = [d.strftime('%Y-%m-%d') for d in self.daily_summary['报告日期']]
        new_cases = self.daily_summary['新增确诊'].tolist()
        total_cases = self.daily_summary['累计确诊'].tolist()
        growth_rates = self.daily_summary['增长率'].tolist()
        
        return {
            'dates': dates,
            'new_cases': new_cases,
            'total_cases': total_cases,
            'growth_rates': growth_rates
        }
    
    def get_district_data(self):
        """获取各区域数据"""
        # 获取最新日期的数据
        latest_date = self.df['报告日期'].max()
        latest_data = self.df[self.df['报告日期'] == latest_date]
        
        # 按区域分组计算累计确诊
        district_data = latest_data.groupby('地区名称').agg({
            '累计确诊': 'sum'
        }).reset_index()
        
        # 按确诊数从高到低排序
        district_data = district_data.sort_values('累计确诊', ascending=False)
        
        districts = district_data['地区名称'].tolist()
        case_counts = district_data['累计确诊'].tolist()
        
        # 准备饼图数据
        pie_data = []
        for i in range(len(districts)):
            pie_data.append({
                'name': districts[i],
                'value': int(case_counts[i])
            })
        
        return {
            'districts': districts,
            'case_counts': case_counts,
            'pie_data': pie_data
        }
    
    def get_recovery_death_data(self):
        """获取康复率和死亡率数据"""
        dates = [d.strftime('%Y-%m-%d') for d in self.daily_summary['报告日期']]
        recovery_rates = self.daily_summary['康复率'].tolist()
        fatality_rates = self.daily_summary['死亡率'].tolist()
        active_cases = self.daily_summary['现存确诊'].tolist()
        recovered_cases = self.daily_summary['累计康复'].tolist()
        death_cases = self.daily_summary['累计死亡'].tolist()
        
        return {
            'dates': dates,
            'recovery_rates': recovery_rates,
            'fatality_rates': fatality_rates,
            'active_cases': active_cases,
            'recovered_cases': recovered_cases,
            'death_cases': death_cases
        }
    
    def get_risk_level_data(self):
        """获取风险等级分布数据"""
        # 获取最新日期的数据
        latest_date = self.df['报告日期'].max()
        latest_data = self.df[self.df['报告日期'] == latest_date]
        
        # 按风险等级分组计算区域数量
        risk_data = latest_data.groupby('风险等级').size().reset_index(name='区域数')
        
        # 添加确诊总数
        risk_data_with_confirmed = latest_data.groupby('风险等级').agg({
            '累计确诊': 'sum'
        }).reset_index()
        
        # 合并数据
        risk_data = pd.merge(risk_data, risk_data_with_confirmed, on='风险等级')
        
        # 按风险等级排序（低风险、中风险、高风险、极高风险）
        risk_order = {'低风险': 0, '中风险': 1, '高风险': 2, '极高风险': 3}
        risk_data['order'] = risk_data['风险等级'].map(risk_order)
        risk_data = risk_data.sort_values('order')
        risk_data = risk_data.drop('order', axis=1)
        
        # 风险等级颜色
        risk_colors = {
            '低风险': '#4FC462',   # 绿色
            '中风险': '#F3C13A',   # 黄色
            '高风险': '#ED553B',   # 红色
            '极高风险': '#800000'  # 深红色
        }
        
        # 生成颜色列表
        colors = [risk_colors.get(risk, '#4FC462') for risk in risk_data['风险等级']]
        
        return {
            'risk_levels': risk_data['风险等级'].tolist(),
            'district_counts': risk_data['区域数'].tolist(),
            'case_counts': risk_data['累计确诊'].tolist(),
            'colors': colors
        }
    
    def get_population_density_data(self):
        """获取人口密度与确诊关系数据"""
        # 获取最新日期的数据
        latest_date = self.df['报告日期'].max()
        latest_data = self.df[self.df['报告日期'] == latest_date]
        
        # 提取需要的列
        density_data = latest_data[['地区名称', '人口', '累计确诊', '发病率(每10万人)']].copy()
        
        # 计算人口密度（简化处理，以人口数作为人口密度的代表）
        density_data = density_data.sort_values('人口', ascending=False)
        
        # 准备散点图数据
        scatter_data = []
        for _, row in density_data.iterrows():
            scatter_data.append({
                'name': row['地区名称'],
                'value': [int(row['人口']), int(row['累计确诊']), row['发病率(每10万人)']],
            })
        
        return {
            'districts': density_data['地区名称'].tolist(),
            'populations': density_data['人口'].tolist(),
            'case_counts': density_data['累计确诊'].tolist(),
            'incidence_rates': density_data['发病率(每10万人)'].tolist(),
            'scatter_data': scatter_data
        }
    
    def get_map_data(self):
        """获取地图数据"""
        # 获取最新日期的数据
        latest_date = self.df['报告日期'].max()
        latest_data = self.df[self.df['报告日期'] == latest_date]
        
        # 香港各区的中英文名称对照
        district_name_mapping = {
            '中西区': 'Central and Western',
            '湾仔区': 'Wan Chai',
            '东区': 'Eastern',
            '南区': 'Southern',
            '油尖旺区': 'Yau Tsim Mong',
            '深水埗区': 'Sham Shui Po',
            '九龙城区': 'Kowloon City',
            '黄大仙区': 'Wong Tai Sin',
            '观塘区': 'Kwun Tong',
            '葵青区': 'Kwai Tsing',
            '荃湾区': 'Tsuen Wan',
            '屯门区': 'Tuen Mun',
            '元朗区': 'Yuen Long',
            '北区': 'North',
            '大埔区': 'Tai Po',
            '沙田区': 'Sha Tin',
            '西贡区': 'Sai Kung',
            '离岛区': 'Islands'
        }
        
        # 调试输出
        print("加载地图数据 - 最新日期:", latest_date)
        
        # 香港各区的地理坐标信息
        district_coords = {
            '中西区': [114.154283, 22.286499],
            '湾仔区': [114.182915, 22.279605],
            '东区': [114.226928, 22.279605],
            '南区': [114.174364, 22.246872],
            '油尖旺区': [114.173347, 22.320048],
            '深水埗区': [114.162813, 22.331015],
            '九龙城区': [114.194915, 22.328483],
            '黄大仙区': [114.203309, 22.343039],
            '观塘区': [114.231394, 22.318516],
            '葵青区': [114.139343, 22.363939],
            '荃湾区': [114.122840, 22.371065],
            '屯门区': [113.977101, 22.391980],
            '元朗区': [114.039503, 22.443062],
            '北区': [114.148118, 22.494273],
            '大埔区': [114.168841, 22.445675],
            '沙田区': [114.202077, 22.382892],
            '西贡区': [114.264645, 22.314623],
            '离岛区': [113.946670, 22.281981]
        }
        
        # 香港各区的风险级别颜色设置
        risk_level_colors = {
            '低风险': '#4FC462',   # 绿色
            '中风险': '#F3C13A',   # 黄色
            '高风险': '#ED553B',   # 红色
            '极高风险': '#800000'  # 深红色
        }
        
        # 获取各区数据
        district_data = []
        
        for index, row in latest_data.iterrows():
            district_name = row['地区名称']
            confirmed = int(row['累计确诊'])
            new_cases = int(row['新增确诊'])
            risk_level = row['风险等级']
            
            # 获取英文区名
            district_name_en = district_name_mapping.get(district_name, district_name)
            print(f"区域匹配: {district_name} -> {district_name_en}")
            
            # 获取坐标
            coords = district_coords.get(district_name, [0, 0])
            color = risk_level_colors.get(risk_level, '#4FC462')
            
            district_data.append({
                'name': district_name,
                'name_en': district_name_en,
                'value': confirmed,
                'new_cases': new_cases,
                'risk_level': risk_level,
                'coords': coords,
                'color': color
            })
        
        return {
            'date': latest_date.strftime('%Y-%m-%d'),
            'districts': district_data
        }
    
    def export_json(self):
        """导出所有数据为JSON格式"""
        data = {
            'overview': self.get_overview_data(),
            'trend': self.get_trend_data(),
            'district': self.get_district_data(),
            'map': self.get_map_data(),
            'recovery_death': self.get_recovery_death_data(),
            'risk_level': self.get_risk_level_data(),
            'population_density': self.get_population_density_data()
        }
        
        return json.dumps(data) 