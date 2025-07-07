// Dashboard functionality for PIU M&E System

// Global variables
let dashboardCharts = {};
let dashboardData = {};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

// Initialize dashboard components
function initializeDashboard() {
    loadDashboardData();
    setupRefreshInterval();
}

// Load dashboard data from API
function loadDashboardData() {
    fetch('/dashboard/data')
        .then(response => response.json())
        .then(data => {
            dashboardData = data;
            updateDashboardCards(data);
            updateCharts(data);
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            showErrorMessage('Failed to load dashboard data');
        });
}

// Update dashboard summary cards
function updateDashboardCards(data) {
    const totalProjectsEl = document.getElementById('total-projects');
    const totalActivitiesEl = document.getElementById('total-activities');
    const totalIndicatorsEl = document.getElementById('total-indicators');
    const overallProgressEl = document.getElementById('overall-progress');
    
    if (totalProjectsEl) totalProjectsEl.textContent = data.total_projects || 0;
    if (totalActivitiesEl) totalActivitiesEl.textContent = data.total_activities || 0;
    if (totalIndicatorsEl) totalIndicatorsEl.textContent = data.total_indicators || 0;
    
    // Calculate overall progress
    if (overallProgressEl && data.budget_data && data.budget_data.length > 0) {
        const avgProgress = data.budget_data.reduce((sum, item) => sum + (item.utilization || 0), 0) / data.budget_data.length;
        overallProgressEl.textContent = avgProgress.toFixed(1) + '%';
    } else if (overallProgressEl) {
        overallProgressEl.textContent = '0%';
    }
}

// Update all charts with new data
function updateCharts(data) {
    updateProjectStatusChart(data.project_status);
    updateActivityStatusChart(data.activity_status);
    updateBudgetChart(data.budget_data);
    updateIndicatorChart(data.indicator_achievement);
}

// Update project status chart
function updateProjectStatusChart(statusData) {
    const ctx = document.getElementById('projectStatusChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (dashboardCharts.projectStatus) {
        dashboardCharts.projectStatus.destroy();
    }
    
    const labels = Object.keys(statusData);
    const data = Object.values(statusData);
    const colors = getStatusColors(labels);
    
    dashboardCharts.projectStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: '#fff'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update activity status chart
function updateActivityStatusChart(statusData) {
    const ctx = document.getElementById('activityStatusChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (dashboardCharts.activityStatus) {
        dashboardCharts.activityStatus.destroy();
    }
    
    const labels = Object.keys(statusData);
    const data = Object.values(statusData);
    const colors = getActivityStatusColors(labels);
    
    dashboardCharts.activityStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: '#fff'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update budget chart
function updateBudgetChart(budgetData) {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (dashboardCharts.budget) {
        dashboardCharts.budget.destroy();
    }
    
    if (!budgetData || budgetData.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    const labels = budgetData.map(item => item.name);
    const allocated = budgetData.map(item => item.budget || 0);
    const spent = budgetData.map(item => item.spent || 0);
    
    dashboardCharts.budget = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Budget Allocated',
                data: allocated,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Budget Spent',
                data: spent,
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        },
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Update indicator achievement chart
function updateIndicatorChart(indicatorData) {
    const ctx = document.getElementById('indicatorChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (dashboardCharts.indicator) {
        dashboardCharts.indicator.destroy();
    }
    
    if (!indicatorData || indicatorData.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // Sort by achievement and take top 10
    const sortedData = indicatorData
        .sort((a, b) => b.achievement - a.achievement)
        .slice(0, 10);
    
    const labels = sortedData.map(item => item.name);
    const achievements = sortedData.map(item => item.achievement || 0);
    const backgroundColors = achievements.map(value => {
        if (value >= 100) return 'rgba(34, 197, 94, 0.8)';
        if (value >= 75) return 'rgba(251, 191, 36, 0.8)';
        if (value >= 50) return 'rgba(59, 130, 246, 0.8)';
        return 'rgba(239, 68, 68, 0.8)';
    });
    
    dashboardCharts.indicator = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Achievement %',
                data: achievements,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
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
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x || 0;
                            return `Achievement: ${value.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Get colors for project status
function getStatusColors(labels) {
    const colorMap = {
        'Active': '#28a745',
        'Completed': '#17a2b8',
        'Planning': '#ffc107',
        'Suspended': '#dc3545',
        'On Hold': '#6c757d'
    };
    
    return labels.map(label => colorMap[label] || '#6c757d');
}

// Get colors for activity status
function getActivityStatusColors(labels) {
    const colorMap = {
        'Completed': '#28a745',
        'In Progress': '#007bff',
        'Not Started': '#ffc107',
        'Delayed': '#dc3545',
        'On Hold': '#6c757d'
    };
    
    return labels.map(label => colorMap[label] || '#6c757d');
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spin fa-spinner me-2"></i>Refreshing...';
            this.disabled = true;
            
            setTimeout(() => {
                loadDashboardData();
                this.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh Data';
                this.disabled = false;
            }, 1000);
        });
    }
}

// Setup automatic refresh interval
function setupRefreshInterval() {
    // Refresh data every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
}

// Show error message
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Export dashboard data
function exportDashboardData() {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dashboard-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Print dashboard
function printDashboard() {
    window.print();
}

// Global functions for inline event handlers
window.refreshDashboard = function() {
    loadDashboardData();
};

window.exportDashboardData = exportDashboardData;
window.printDashboard = printDashboard;
