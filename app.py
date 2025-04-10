from flask import Flask, render_template, jsonify
from data_processor import DataProcessor

app = Flask(__name__)

# 读取Excel数据
data_processor = DataProcessor('香港各区疫情数据_20250322.xlsx')

@app.route('/')
def index():
    """渲染主页面"""
    return render_template('index.html')

@app.route('/api/overview')
def get_overview():
    """获取数据概览"""
    return jsonify(data_processor.get_overview_data())

@app.route('/api/trend')
def get_trend():
    """获取趋势数据"""
    return jsonify(data_processor.get_trend_data())

@app.route('/api/district')
def get_district():
    """获取区域数据"""
    return jsonify(data_processor.get_district_data())

@app.route('/api/map')
def get_map():
    """获取地图数据"""
    return jsonify(data_processor.get_map_data())

@app.route('/api/recovery_death')
def get_recovery_death():
    """获取康复率和死亡率数据"""
    return jsonify(data_processor.get_recovery_death_data())

@app.route('/api/risk_level')
def get_risk_level():
    """获取风险等级分布数据"""
    return jsonify(data_processor.get_risk_level_data())

@app.route('/api/population_density')
def get_population_density():
    """获取人口密度与确诊关系数据"""
    return jsonify(data_processor.get_population_density_data())

@app.route('/api/all')
def get_all_data():
    """获取所有数据"""
    all_data = {
        'overview': data_processor.get_overview_data(),
        'trend': data_processor.get_trend_data(),
        'district': data_processor.get_district_data(),
        'map': data_processor.get_map_data(),
        'recovery_death': data_processor.get_recovery_death_data(),
        'risk_level': data_processor.get_risk_level_data(),
        'population_density': data_processor.get_population_density_data()
    }
    return jsonify(all_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 