// Chart utilities and configurations for PIU M&E System

// Chart.js default configuration
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.backgroundColor = 'rgba(255, 255, 255, 0.1)';

// Common chart options
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#fff',
                padding: 20,
                usePointStyle: true
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#fff'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        },
        y: {
            ticks: {
                color: '#fff'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
    }
};

// Color schemes
const colorSchemes = {
    primary: [
        '#007bff', '#0056b3', '#17a2b8', '#138496',
        '#28a745', '#1e7e34', '#ffc107', '#e0a800',
        '#dc3545', '#bd2130', '#6c757d', '#545b62'
    ],
    success: [
        '#28a745', '#34ce57', '#40d564', '#4cdc71',
        '#58e27e', '#64e88b', '#70ef98', '#7cf5a5'
    ],
    warning: [
        '#ffc107', '#ffca2c', '#ffd93d', '#ffe54e',
        '#fff05f', '#fffc70', '#ffff81', '#ffff92'
    ],
    danger: [
        '#dc3545', '#e85563', '#f47581', '#ff959f',
        '#ffb5bd', '#ffd5db', '#fff5f9', '#ffffff'
    ],
    info: [
        '#17a2b8', '#2bb2c6', '#3fc2d4', '#53d2e2',
        '#67e2f0', '#7bf2fe', '#8ffffff', '#a3ffff'
    ]
};

// Chart creation utilities
const ChartUtils = {
    // Create a progress chart
    createProgressChart: function(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const chartOptions = {
            ...commonChartOptions,
            ...options,
            plugins: {
                ...commonChartOptions.plugins,
                ...options.plugins
            }
        };
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || ['Completed', 'Remaining'],
                datasets: [{
                    data: data.values || [0, 100],
                    backgroundColor: data.colors || ['#28a745', '#6c757d'],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    cutout: '70%'
                }]
            },
            options: chartOptions
        });
    },
    
    // Create a bar chart
    createBarChart: function(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const chartOptions = {
            ...commonChartOptions,
            ...options,
            plugins: {
                ...commonChartOptions.plugins,
                ...options.plugins
            }
        };
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: data.datasets || []
            },
            options: chartOptions
        });
    },
    
    // Create a line chart
    createLineChart: function(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const chartOptions = {
            ...commonChartOptions,
            ...options,
            plugins: {
                ...commonChartOptions.plugins,
                ...options.plugins
            }
        };
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: data.datasets || []
            },
            options: chartOptions
        });
    },
    
    // Create a pie chart
    createPieChart: function(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const chartOptions = {
            ...commonChartOptions,
            ...options,
            plugins: {
                ...commonChartOptions.plugins,
                ...options.plugins
            }
        };
        
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: data.colors || colorSchemes.primary,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                }]
            },
            options: chartOptions
        });
    },
    
    // Get color scheme
    getColorScheme: function(schemeName, count) {
        const scheme = colorSchemes[schemeName] || colorSchemes.primary;
        if (count <= scheme.length) {
            return scheme.slice(0, count);
        }
        
        // Generate additional colors if needed
        const colors = [...scheme];
        while (colors.length < count) {
            colors.push(...scheme);
        }
        return colors.slice(0, count);
    },
    
    // Format currency for tooltips
    formatCurrency: function(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    },
    
    // Format percentage
    formatPercentage: function(value) {
        return `${value.toFixed(1)}%`;
    },
    
    // Create gauge chart (using doughnut with custom plugin)
    createGaugeChart: function(canvasId, value, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const maxValue = options.max || 100;
        const minValue = options.min || 0;
        const currentValue = Math.max(minValue, Math.min(maxValue, value));
        const percentage = ((currentValue - minValue) / (maxValue - minValue)) * 100;
        
        const gaugeOptions = {
            ...commonChartOptions,
            cutout: '80%',
            rotation: -90,
            circumference: 180,
            plugins: {
                ...commonChartOptions.plugins,
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                }
            }
        };
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        this.getGaugeColor(percentage),
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: gaugeOptions,
            plugins: [{
                id: 'gaugeText',
                beforeDraw: function(chart) {
                    const ctx = chart.ctx;
                    const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
                    const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = 'bold 24px Arial';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(currentValue.toFixed(1), centerX, centerY);
                    ctx.font = '12px Arial';
                    ctx.fillText(options.label || 'Progress', centerX, centerY + 30);
                    ctx.restore();
                }
            }]
        });
    },
    
    // Get gauge color based on value
    getGaugeColor: function(percentage) {
        if (percentage >= 80) return '#28a745';
        if (percentage >= 60) return '#ffc107';
        if (percentage >= 40) return '#fd7e14';
        return '#dc3545';
    },
    
    // Animate chart on load
    animateChart: function(chart) {
        if (chart) {
            chart.update('active');
        }
    },
    
    // Destroy chart safely
    destroyChart: function(chart) {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    },
    
    // Resize chart
    resizeChart: function(chart) {
        if (chart) {
            chart.resize();
        }
    }
};

// Chart themes
const chartThemes = {
    dark: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: '#000',
        gridColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgba(0, 0, 0, 0.2)'
    }
};

// Apply theme to chart
function applyChartTheme(chartOptions, theme = 'dark') {
    const themeConfig = chartThemes[theme];
    if (!themeConfig) return chartOptions;
    
    return {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                ...chartOptions.plugins?.legend,
                labels: {
                    ...chartOptions.plugins?.legend?.labels,
                    color: themeConfig.color
                }
            },
            tooltip: {
                ...chartOptions.plugins?.tooltip,
                backgroundColor: themeConfig.backgroundColor,
                titleColor: themeConfig.color,
                bodyColor: themeConfig.color,
                borderColor: themeConfig.borderColor
            }
        },
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales?.x,
                ticks: {
                    ...chartOptions.scales?.x?.ticks,
                    color: themeConfig.color
                },
                grid: {
                    ...chartOptions.scales?.x?.grid,
                    color: themeConfig.gridColor
                }
            },
            y: {
                ...chartOptions.scales?.y,
                ticks: {
                    ...chartOptions.scales?.y?.ticks,
                    color: themeConfig.color
                },
                grid: {
                    ...chartOptions.scales?.y?.grid,
                    color: themeConfig.gridColor
                }
            }
        }
    };
}

// Export utilities
window.ChartUtils = ChartUtils;
window.colorSchemes = colorSchemes;
window.commonChartOptions = commonChartOptions;
window.applyChartTheme = applyChartTheme;
