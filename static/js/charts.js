// 初始化所有图表
let trendChart = null;
let districtPieChart = null;
let growthRateChart = null;
let districtRankChart = null;
let hkMapChart = null;
let recoveryDeathChart = null;
let riskLevelChart = null;
let populationDensityChart = null;

// 页面加载完成后执行
$(document).ready(function() {
    // 先加载地图数据，再初始化图表
    loadMapData().then(() => {
    // 初始化图表
    initCharts();
    
    // 加载数据
    loadData();
    
    // 设置窗口调整大小时重新渲染图表
    $(window).resize(function() {
        resizeCharts();
    });
});
});

// 加载地图数据
function loadMapData() {
    return new Promise((resolve, reject) => {
        fetch("/static/js/hongkong.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error('地图数据加载失败: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('地图数据加载成功', data);
                // 注册地图
                echarts.registerMap('HK', data);
                console.log('香港地图注册成功');
                resolve();
            })
            .catch(error => {
                console.error('地图数据加载或注册失败:', error);
                // 即使失败也继续初始化其他图表
                resolve();
            });
    });
}

// 初始化所有图表
function initCharts() {
    // 初始化趋势图
    trendChart = echarts.init(document.getElementById('trend-chart'));
    
    // 初始化区域分布饼图
    districtPieChart = echarts.init(document.getElementById('district-pie-chart'));
    
    // 初始化增长率图
    growthRateChart = echarts.init(document.getElementById('growth-rate-chart'));
    
    // 初始化地区排名图
    districtRankChart = echarts.init(document.getElementById('district-rank-chart'));
    
    // 初始化香港地图
    hkMapChart = echarts.init(document.getElementById('hk-map-chart'));
    
    // 初始化康复死亡率对比图
    recoveryDeathChart = echarts.init(document.getElementById('recovery-death-chart'));
    
    // 初始化风险等级分布图
    riskLevelChart = echarts.init(document.getElementById('risk-level-chart'));
    
    // 初始化人口密度与确诊关系图
    populationDensityChart = echarts.init(document.getElementById('population-density-chart'));
    
    console.log('所有图表初始化完成');
}

// 加载数据
function loadData() {
    // 使用jQuery Ajax加载所有数据
    $.ajax({
        url: '/api/all',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            // 更新数据概览
            updateOverview(data.overview);
            
            // 更新趋势图
            updateTrendChart(data.trend);
            
            // 更新区域分布饼图
            updateDistrictPieChart(data.district);
            
            // 更新增长率图
            updateGrowthRateChart(data.trend);
            
            // 更新地区排名图
            updateDistrictRankChart(data.district);
            
            // 更新香港地图
            updateHKMapChart(data.map);
            
            // 更新康复死亡率对比图
            updateRecoveryDeathChart(data.recovery_death);
            
            // 更新风险等级分布图
            updateRiskLevelChart(data.risk_level);
            
            // 更新人口密度与确诊关系图
            updatePopulationDensityChart(data.population_density);
            
            // 更新最后更新时间
            $('#update-time').text(data.overview.latest_date);
        },
        error: function(xhr, status, error) {
            console.error('数据加载失败:', error);
        }
    });
}

// 更新数据概览卡片
function updateOverview(data) {
    $('#total-confirmed-value').text(data.total_confirmed.toLocaleString());
    $('#new-confirmed-value').text(data.latest_increase.toLocaleString());
    
    // 根据增长率显示不同颜色
    const growthRateValue = $('#growth-rate-value');
    growthRateValue.text(data.growth_rate.toFixed(2) + '%');
    
    if (data.growth_rate > 0) {
        growthRateValue.css('color', '#ff6b6b');
        growthRateValue.prepend('↑ ');
    } else if (data.growth_rate < 0) {
        growthRateValue.css('color', '#51cf66');
        growthRateValue.prepend('↓ ');
    } else {
        growthRateValue.css('color', '#ffd66b');
    }
    
    // 更新康复率
    const recoveryRateValue = $('#recovery-rate-value');
    recoveryRateValue.text(data.recovery_rate.toFixed(2) + '%');
    
    // 更新死亡率
    const fatalityRateValue = $('#fatality-rate-value');
    fatalityRateValue.text(data.fatality_rate.toFixed(2) + '%');
}

// 更新趋势图
function updateTrendChart(data) {
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: '',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data: ['每日新增', '累计确诊'],
            top: 10,
            textStyle: {
                color: '#a3a3a3'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: data.dates,
                axisLabel: {
                    color: '#a3a3a3',
                    rotate: 45
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisTick: {
                    show: false
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '每日新增',
                position: 'left',
                axisLabel: {
                    color: '#a3a3a3',
                    formatter: '{value}'
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            {
                type: 'value',
                name: '累计确诊',
                position: 'right',
                axisLabel: {
                    color: '#a3a3a3',
                    formatter: '{value}'
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: '每日新增',
                type: 'bar',
                data: data.new_cases,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#ff9a9e' },
                        { offset: 1, color: 'rgba(255, 154, 158, 0.3)' }
                    ])
                },
                barMaxWidth: 10
            },
            {
                name: '累计确诊',
                type: 'line',
                yAxisIndex: 1,
                data: data.total_cases,
                symbolSize: 6,
                symbol: 'circle',
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#43e97b'
                },
                itemStyle: {
                    color: '#43e97b'
                }
            }
        ]
    };
    
    trendChart.setOption(option);
}

// 更新区域分布饼图
function updateDistrictPieChart(data) {
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            textStyle: {
                color: '#a3a3a3'
            }
        },
        series: [
            {
                name: '区域分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#030c22',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                        color: '#fff'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.pie_data
            }
        ],
        color: [
            '#ff9a9e', '#fad0c4', '#fbc2eb', '#a6c1ee', '#8fd3f4', 
            '#84fab0', '#38f9d7', '#43e97b', '#6a11cb', '#2575fc', 
            '#fa709a', '#fee140', '#a3bded', '#6991c7', '#37ecba',
            '#72afd3', '#37ecba', '#ffe29f', '#a18cd1', '#fbc2eb'
        ]
    };
    
    districtPieChart.setOption(option);
}

// 更新增长率图
function updateGrowthRateChart(data) {
    // 获取最近30天的日期和增长率
    const recentDates = data.dates.slice(-30);
    const recentRates = data.growth_rates.slice(-30);
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: recentDates,
            axisLabel: {
                color: '#a3a3a3',
                rotate: 45
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            name: '增长率(%)',
            axisLabel: {
                color: '#a3a3a3',
                formatter: '{value}%'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        },
        series: [
            {
                name: '增长率',
                type: 'bar',
                data: recentRates,
                itemStyle: {
                    color: function(params) {
                        return params.value >= 0 ? '#ff9a9e' : '#51cf66';
                    }
                }
            }
        ]
    };
    
    growthRateChart.setOption(option);
}

// 更新地区排名图
function updateDistrictRankChart(data) {
    // 获取前10的区域
    let districts = data.districts;
    let cases = data.case_counts;
    
    if (districts.length > 10) {
        districts = districts.slice(0, 10);
        cases = cases.slice(0, 10);
    }
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                color: '#a3a3a3'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: districts,
            axisLabel: {
                color: '#a3a3a3'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            axisTick: {
                show: false
            }
        },
        series: [
            {
                name: '确诊病例',
                type: 'bar',
                data: cases,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#43e97b' },
                        { offset: 1, color: '#38f9d7' }
                    ])
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#fff'
                }
            }
        ]
    };
    
    districtRankChart.setOption(option);
}

// 更新香港疫情分布地图
function updateHKMapChart(data) {
    const districts = data.districts;
    console.log('开始更新地图数据', districts);
    
    // 准备地图数据
    const mapData = districts.map(item => ({
        name: item.name_en, // 使用英文名称匹配GeoJSON数据
        value: item.value,
        chineseName: item.name, // 保存中文名称用于显示
        new_cases: item.new_cases,
        risk_level: item.risk_level,
        itemStyle: {
            areaColor: item.color,
            borderColor: '#fff',
            borderWidth: 1
        }
    }));
    console.log('地图数据处理完成', mapData);

    // 地图配置项
    const option = {
        backgroundColor: 'transparent',
        title: {
            show: false // 隐藏标题，使用HTML标题替代
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: '#333',
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
                color: '#fff'
            },
            formatter: function(params) {
                // 根据数据类型提供不同的提示信息
                const district = districts.find(d => d.name_en === params.name) || {};
                const chineseName = district.name || params.name;
                
                if (params.seriesType === 'map') {
                    return `<div style="font-weight:bold;color:#fff">
                        <div style="font-size:16px;margin-bottom:5px">${chineseName}</div>
                        <div>累计确诊: <span style="color:#ff6b6b;font-weight:bold">${params.value}</span></div>
                        <div>新增确诊: <span style="color:#ffd66b;font-weight:bold">${district.new_cases || 0}</span></div>
                        <div>风险等级: <span style="color:${district.color};font-weight:bold">${district.risk_level || '暂无数据'}</span></div>
                    </div>`;
                } else {
                    return `<div style="font-weight:bold;color:#fff">
                        <div style="font-size:16px;margin-bottom:5px">${params.data.chineseName}</div>
                        <div>累计确诊: <span style="color:#ff6b6b;font-weight:bold">${params.data.value[2]}</span></div>
                    </div>`;
                }
            }
        },
        visualMap: {
            min: 0,
            max: districts.length > 0 ? Math.max(...districts.map(d => d.value)) : 1000,
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
                color: ['#C6FFDD', '#FFF7BC', '#FFC700', '#FF9E4A', '#FF6B6B', '#CC0000'] // 绿色到黄色再到红色渐变
            },
            textStyle: {
                color: '#a3a3a3'
            },
            left: 'left',
            bottom: 10
        },
        series: [
            {
                name: '香港确诊分布',
                type: 'map',
                map: 'HK',
                roam: true,
                zoom: 1.3,
                center: [114.15, 22.35],
                aspectScale: 0.9, // 调整地图长宽比
                data: mapData,
                emphasis: {
                    label: {
                        show: true,
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 12,
                        textShadowColor: 'rgba(0, 0, 0, 0.9)',
                        textShadowBlur: 4
                    },
                    itemStyle: {
                        areaColor: '#ff4500', // 高亮颜色改为橙红色
                        shadowColor: 'rgba(255, 69, 0, 0.5)',
                        shadowBlur: 10
                    }
                },
                select: {
                    itemStyle: {
                        areaColor: '#ff4500' // 选中颜色也改为橙红色
                    },
                    label: {
                        show: true,
                        color: '#fff'
                    }
                },
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 10,
                    formatter: function(params) {
                        const district = districts.find(d => d.name_en === params.name);
                        return district ? district.name : params.name;
                    },
                    textShadowColor: 'rgba(0, 0, 0, 0.8)',  // 添加文字阴影
                    textShadowBlur: 3,                     // 文字阴影模糊度
                    textShadowOffsetX: 1,                  // 文字阴影X偏移
                    textShadowOffsetY: 1                   // 文字阴影Y偏移
                },
                itemStyle: {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 5,
                    areaColor: '#333d61' // 设置默认底色为深蓝灰色
                }
            }
        ]
    };
    
    // 设置图表选项
    try {
        console.log('开始设置地图选项');
        hkMapChart.setOption(option);
        console.log('地图配置成功');
    } catch (error) {
        console.error('地图配置失败:', error);
    }
}

// 更新康复率与死亡率对比图
function updateRecoveryDeathChart(data) {
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: '',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                const valueFormat = function(value) {
                    return value.toLocaleString();
                };
                const rateFormat = function(value) {
                    return value.toFixed(2) + '%';
                };
                
                let result = `<div style="font-weight:bold;color:#fff">${params[0].axisValue}</div>`;
                
                params.forEach(param => {
                    const marker = `<span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:${param.color};"></span>`;
                    
                    if (param.seriesName === '康复率' || param.seriesName === '死亡率') {
                        result += `<div>${marker}${param.seriesName}: ${rateFormat(param.value)}</div>`;
                    } else {
                        result += `<div>${marker}${param.seriesName}: ${valueFormat(param.value)}</div>`;
                    }
                });
                
                return result;
            }
        },
        legend: {
            data: ['累计确诊', '累计康复', '累计死亡', '康复率', '死亡率'],
            textStyle: {
                color: '#a3a3a3'
            },
            top: 10,
            padding: [5, 10]
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.dates,
                axisLabel: {
                    color: '#a3a3a3',
                    interval: Math.floor(data.dates.length / 10), // 动态调整间隔
                    rotate: 30, // 旋转标签以避免重叠
                    margin: 15  // 增加标签与轴线的距离
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '确诊/康复/死亡人数',
                nameTextStyle: {
                    color: '#a3a3a3',
                    padding: [0, 0, 5, 0]
                },
                axisLabel: {
                    color: '#a3a3a3',
                    margin: 12  // 增加标签与轴的距离
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            {
                type: 'value',
                name: '康复率/死亡率(%)',
                nameTextStyle: {
                    color: '#a3a3a3',
                    padding: [0, 0, 5, 0]
                },
                min: 0,
                max: 100,
                axisLabel: {
                    color: '#a3a3a3',
                    formatter: '{value}%',
                    margin: 12  // 增加标签与轴的距离
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                splitLine: {
                    show: false
                }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 70,  // 默认显示最后30%的数据
                end: 100
            },
            {
                show: true,
                type: 'slider',
                bottom: 10,
                height: 15,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                textStyle: {
                    color: '#a3a3a3'
                },
                start: 70,
                end: 100
            }
        ],
        series: [
            {
                name: '累计确诊',
                type: 'bar',
                barWidth: '25%',  // 调整柱宽
                barGap: '30%',    // 调整柱间距
                stack: 'total',
                itemStyle: {
                    color: '#FF6B6B'
                },
                data: data.active_cases  // 使用现存确诊数据
            },
            {
                name: '累计康复',
                type: 'bar',
                stack: 'total',
                itemStyle: {
                    color: '#38F9D7'
                },
                data: data.recovered_cases
            },
            {
                name: '累计死亡',
                type: 'bar',
                stack: 'total',
                itemStyle: {
                    color: '#606060'
                },
                data: data.death_cases
            },
            {
                name: '康复率',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                itemStyle: {
                    color: '#38F9D7'
                },
                lineStyle: {
                    width: 3
                },
                data: data.recovery_rates
            },
            {
                name: '死亡率',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                itemStyle: {
                    color: '#FF6B6B'
                },
                lineStyle: {
                    width: 3
                },
                data: data.fatality_rates
            }
        ]
    };
    
    recoveryDeathChart.setOption(option);
}

// 更新风险等级分布图
function updateRiskLevelChart(data) {
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: '',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: '#333',
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
                color: '#fff'
            },
            formatter: function(params) {
                // 检查数据完整性
                if (!params.data || typeof params.data.confirmed === 'undefined') {
                    return `${params.name || '未知'}: 数据不完整`;
                }
                
                return `<div style="font-weight:bold;color:#fff">
                    <div style="font-size:14px;margin-bottom:5px">${params.name}</div>
                    <div>区域数: <span style="color:#38f9d7;font-weight:bold">${params.value}个</span></div>
                    <div>确诊数: <span style="color:#ff6b6b;font-weight:bold">${params.data.confirmed.toLocaleString()}例</span></div>
                </div>`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.risk_levels,
            axisLabel: {
                color: '#a3a3a3',
                interval: 0,
                fontSize: 12
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            name: '区域数',
            axisLabel: {
                color: '#a3a3a3'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        },
        series: [
            {
                name: '风险等级',
                type: 'bar',
                data: data.risk_levels.map((level, index) => ({
                    value: data.district_counts[index],
                    count: data.district_counts[index],
                    confirmed: data.case_counts[index],
                    itemStyle: {
                        color: data.colors[index]
                    }
                })),
                barWidth: '40%',
                label: {
                    show: true,
                    position: 'top',
                    color: '#fff'
                }
            }
        ]
    };
    
    riskLevelChart.setOption(option);
}

// 更新人口密度与确诊关系图
function updatePopulationDensityChart(data) {
    // 准备数据，确保数据有效性
    const scatterData = [];
    
    // 过滤和处理数据，确保所有数据都是有效的
    for (let i = 0; i < data.scatter_data.length; i++) {
        const item = data.scatter_data[i];
        // 确保数据不为0或负数（因为要用对数轴）
        if (item.value[0] > 0 && item.value[1] > 0) {
            scatterData.push({
                name: item.name,
                value: item.value,
                // 调整散点大小，避免太小看不见
                symbolSize: Math.max(5, Math.sqrt(item.value[1]) * 0.5)
            });
        }
    }
    
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: '',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: '#333',
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
                color: '#fff'
            },
            formatter: function(params) {
                // 确保value是有效的数组
                if (!params.value || params.value.length < 3) {
                    return `${params.name}: 数据不完整`;
                }
                
                return `<div style="font-weight:bold;color:#fff">
                    <div style="font-size:14px;margin-bottom:5px">${params.name}</div>
                    <div>人口: <span style="color:#38f9d7;font-weight:bold">${params.value[0].toLocaleString()}</span></div>
                    <div>确诊数: <span style="color:#ff6b6b;font-weight:bold">${params.value[1].toLocaleString()}</span></div>
                    <div>发病率: <span style="color:#ffd66b;font-weight:bold">${params.value[2].toFixed(2)}</span> (每10万人)</div>
                </div>`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            top: '18%', // 增加顶部空间
            containLabel: true
        },
        xAxis: {
            type: 'log',
            name: '人口数 (对数)',
            nameLocation: 'middle',
            nameGap: 25,
            axisLabel: {
                color: '#a3a3a3',
                formatter: function(value) {
                    if (value === 10000) return '1万';
                    if (value === 100000) return '10万';
                    if (value === 1000000) return '100万';
                    return value.toLocaleString();
                }
            },
            nameTextStyle: {
                color: '#a3a3a3'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        },
        yAxis: {
            type: 'log',
            name: '确诊数 (对数)',
            nameLocation: 'middle',
            nameGap: 40, // 增加名称与轴的距离
            axisLabel: {
                color: '#a3a3a3',
                margin: 10, // 增加标签与轴的距离
                formatter: function(value) {
                    if (value === 10000) return '1万';
                    if (value === 100000) return '10万';
                    if (value === 1000000) return '100万';
                    return value.toLocaleString();
                }
            },
            nameTextStyle: {
                color: '#a3a3a3',
                padding: [0, 0, 5, 0] // 添加文本内边距，向下偏移
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        },
        series: [
            {
                name: '人口与确诊关系',
                type: 'scatter',
                data: scatterData,
                itemStyle: {
                    color: function(params) {
                        // 根据发病率设置渐变色
                        const rate = params.data.value[2];
                        if (rate > 10) return '#ff6b6b'; // 高发病率
                        if (rate > 5) return '#ffd66b'; // 中等发病率
                        return '#51cf66'; // 低发病率
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                label: {
                    show: false, // 默认不显示标签，避免拥挤
                    formatter: function(params) {
                        return params.name;
                    },
                    position: 'top',
                    fontSize: 10,
                    color: '#a3a3a3'
                }
            },
            {
                name: '趋势线',
                type: 'line',
                showSymbol: false,
                symbolSize: 0.1,
                data: calculateTrendLine(data.populations, data.case_counts),
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.3)',
                    width: 1,
                    type: 'dashed'
                }
            }
        ]
    };
    
    populationDensityChart.setOption(option);
}

// 计算趋势线的简单线性回归，修改为适应对数坐标系
function calculateTrendLine(xData, yData) {
    // 过滤掉无效值
    const validData = [];
    for (let i = 0; i < xData.length; i++) {
        if (xData[i] > 0 && yData[i] > 0) {
            // 对数转换，适应对数坐标系
            validData.push([Math.log10(xData[i]), Math.log10(yData[i])]);
        }
    }
    
    // 如果数据不足，返回空数组
    if (validData.length < 2) return [];
    
    // 计算平均值
    let sumX = 0, sumY = 0;
    for (let i = 0; i < validData.length; i++) {
        sumX += validData[i][0];
        sumY += validData[i][1];
    }
    const avgX = sumX / validData.length;
    const avgY = sumY / validData.length;
    
    // 计算斜率和截距
    let numerator = 0, denominator = 0;
    for (let i = 0; i < validData.length; i++) {
        numerator += (validData[i][0] - avgX) * (validData[i][1] - avgY);
        denominator += Math.pow(validData[i][0] - avgX, 2);
    }
    
    const slope = denominator ? numerator / denominator : 0;
    const intercept = avgY - slope * avgX;
    
    // 构建趋势线数据
    const trendLine = [];
    const minX = Math.min(...validData.map(point => point[0]));
    const maxX = Math.max(...validData.map(point => point[0]));
    
    // 转换回原始范围用于绘图
    const startX = Math.pow(10, minX);
    const endX = Math.pow(10, maxX);
    const startY = Math.pow(10, intercept + slope * minX);
    const endY = Math.pow(10, intercept + slope * maxX);
    
    trendLine.push([startX, startY]);
    trendLine.push([endX, endY]);
    
    return trendLine;
}

// 调整所有图表尺寸
function resizeCharts() {
    trendChart && trendChart.resize();
    districtPieChart && districtPieChart.resize();
    growthRateChart && growthRateChart.resize();
    districtRankChart && districtRankChart.resize();
    hkMapChart && hkMapChart.resize();
    recoveryDeathChart && recoveryDeathChart.resize();
    riskLevelChart && riskLevelChart.resize();
    populationDensityChart && populationDensityChart.resize();
} 