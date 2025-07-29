/**
 * Working KPI Calculator - Fully Functional Implementation
 * Complete calculator with all 14 KPI types and proper calculation formulas
 */

// KPI Configurations with formulas and fields
const KPI_CONFIGS = {
    'ROA': {
        name: 'Return on Assets (ROA)',
        formula: 'ROA = (Net Profit After Tax / Total Assets) × 100',
        fields: [
            { id: 'net_profit_after_tax', label: 'Net Profit After Tax', type: 'number', placeholder: 'Enter net profit after tax' },
            { id: 'total_assets', label: 'Total Assets', type: 'number', placeholder: 'Enter total assets' }
        ],
        calculate: (data) => (parseFloat(data.net_profit_after_tax) / parseFloat(data.total_assets)) * 100
    },
    'PAT': {
        name: 'Profit After Tax (PAT)',
        formula: 'PAT = Total Revenue - Total Expenses - Tax Amount',
        fields: [
            { id: 'total_revenues_turnover', label: 'Total Revenue/Turnover', type: 'number', placeholder: 'Enter total revenue' },
            { id: 'total_expenses', label: 'Total Expenses', type: 'number', placeholder: 'Enter total expenses' },
            { id: 'tax_amount', label: 'Tax Amount', type: 'number', placeholder: 'Enter tax amount' }
        ],
        calculate: (data) => parseFloat(data.total_revenues_turnover) - parseFloat(data.total_expenses) - parseFloat(data.tax_amount)
    },
    'DSCR': {
        name: 'Debt Service Coverage Ratio (DSCR)',
        formula: 'DSCR = Net Operating Income / Total Debt Service',
        fields: [
            { id: 'net_operating_income', label: 'Net Operating Income', type: 'number', placeholder: 'Enter net operating income' },
            { id: 'total_debt_service', label: 'Total Debt Service', type: 'number', placeholder: 'Enter total debt service' }
        ],
        calculate: (data) => parseFloat(data.net_operating_income) / parseFloat(data.total_debt_service)
    },
    'MWh': {
        name: 'Energy Injection (MWh)',
        formula: 'Energy = Power Injected × Time Duration',
        fields: [
            { id: 'power_injected', label: 'Power Injected (MW)', type: 'number', placeholder: 'Enter power injected' },
            { id: 'time_duration', label: 'Time Duration (hours)', type: 'number', placeholder: 'Enter time duration' }
        ],
        calculate: (data) => parseFloat(data.power_injected) * parseFloat(data.time_duration)
    },
    'GAF': {
        name: 'Generation Availability Factor (GAF)',
        formula: 'GAF = (Available Hours / Total Period Hours) × 100',
        fields: [
            { id: 'total_available_hours', label: 'Total Available Hours', type: 'number', placeholder: 'Enter available hours' },
            { id: 'total_period_hours', label: 'Total Period Hours', type: 'number', placeholder: 'Enter total period hours' }
        ],
        calculate: (data) => (parseFloat(data.total_available_hours) / parseFloat(data.total_period_hours)) * 100
    },
    'TDE': {
        name: 'Training Man Hours (TDE)',
        formula: 'TDE = Total Training Days / Total Employees',
        fields: [
            { id: 'total_training_days_conducted', label: 'Total Training Days', type: 'number', placeholder: 'Enter training days' },
            { id: 'total_number_of_employees', label: 'Total Employees', type: 'number', placeholder: 'Enter number of employees' }
        ],
        calculate: (data) => parseFloat(data.total_training_days_conducted) / parseFloat(data.total_number_of_employees)
    },
    'ATC': {
        name: 'ATC&C (Total Losses Electricity)',
        formula: 'ATC = (1 - (Billing Efficiency × Collection Efficiency)) / 100',
        fields: [
            { id: 'billing_efficiency', label: 'Billing Efficiency (%)', type: 'number', placeholder: 'Enter billing efficiency' },
            { id: 'collection_efficiency', label: 'Collection Efficiency (%)', type: 'number', placeholder: 'Enter collection efficiency' }
        ],
        calculate: (data) => (1 - (parseFloat(data.billing_efficiency) * parseFloat(data.collection_efficiency) / 10000)) * 100
    },
    'NECD': {
        name: 'New Electricity Connection Days (NECD)',
        formula: 'NECD = Total Time Days / Total New Connections',
        fields: [
            { id: 'total_time_days', label: 'Total Time (Days)', type: 'number', placeholder: 'Enter total time in days' },
            { id: 'total_number_of_new_connections', label: 'Total New Connections', type: 'number', placeholder: 'Enter number of new connections' }
        ],
        calculate: (data) => parseFloat(data.total_time_days) / parseFloat(data.total_number_of_new_connections)
    },
    'NWCD': {
        name: 'New Water Connection Days (NWCD)',
        formula: 'NWCD = Total Time Days / Total New Water Connections',
        fields: [
            { id: 'total_time_days', label: 'Total Time (Days)', type: 'number', placeholder: 'Enter total time in days' },
            { id: 'total_number_of_new_connections', label: 'Total New Water Connections', type: 'number', placeholder: 'Enter number of new connections' }
        ],
        calculate: (data) => parseFloat(data.total_time_days) / parseFloat(data.total_number_of_new_connections)
    },
    'TPS': {
        name: 'Timely Payment of Salary (TPS)',
        formula: 'TPS = (On-time Payments / Total Payments Due) × 100',
        fields: [
            { id: 'number_of_on_time_payments', label: 'On-time Payments', type: 'number', placeholder: 'Enter on-time payments' },
            { id: 'total_number_of_payments_due', label: 'Total Payments Due', type: 'number', placeholder: 'Enter total payments due' }
        ],
        calculate: (data) => (parseFloat(data.number_of_on_time_payments) / parseFloat(data.total_number_of_payments_due)) * 100
    },
    'TTP': {
        name: 'Timely Tax Payment (TTP)',
        formula: 'TTP = (On-time Tax Payments / Total Tax Payments Due) × 100',
        fields: [
            { id: 'number_of_on_time_payments', label: 'On-time Tax Payments', type: 'number', placeholder: 'Enter on-time tax payments' },
            { id: 'total_number_of_payments_due', label: 'Total Tax Payments Due', type: 'number', placeholder: 'Enter total tax payments due' }
        ],
        calculate: (data) => (parseFloat(data.number_of_on_time_payments) / parseFloat(data.total_number_of_payments_due)) * 100
    },
    'WQCC': {
        name: 'Water Quality Compliance Bacteriological (WQCC)',
        formula: 'WQCC = (Compliant Samples / Total Samples) × 100',
        fields: [
            { id: 'number_of_compliant_water_samples', label: 'Compliant Water Samples', type: 'number', placeholder: 'Enter compliant samples' },
            { id: 'total_number_of_tested_water_samples', label: 'Total Tested Samples', type: 'number', placeholder: 'Enter total tested samples' }
        ],
        calculate: (data) => (parseFloat(data.number_of_compliant_water_samples) / parseFloat(data.total_number_of_tested_water_samples)) * 100
    },
    'WQCB': {
        name: 'Water Quality Compliance - Banjul (WQCB)',
        formula: 'WQCB = (Compliant Samples / Total Samples) × 100',
        fields: [
            { id: 'number_of_compliant_water_samples', label: 'Compliant Water Samples', type: 'number', placeholder: 'Enter compliant samples' },
            { id: 'total_number_of_tested_water_samples', label: 'Total Tested Samples', type: 'number', placeholder: 'Enter total tested samples' }
        ],
        calculate: (data) => (parseFloat(data.number_of_compliant_water_samples) / parseFloat(data.total_number_of_tested_water_samples)) * 100
    },
    'NRW': {
        name: 'Non-Revenue Water (NRW)',
        formula: 'NRW = (Water Entering System - Billed Consumption) / Water Entering System × 100',
        fields: [
            { id: 'water_entering_system', label: 'Water Entering System', type: 'number', placeholder: 'Enter water entering system' },
            { id: 'billed_authorized_consumption', label: 'Billed Consumption', type: 'number', placeholder: 'Enter billed consumption' }
        ],
        calculate: (data) => ((parseFloat(data.water_entering_system) - parseFloat(data.billed_authorized_consumption)) / parseFloat(data.water_entering_system)) * 100
    }
};

// Main trigger function
function triggerKPICalculationPopup() {
    console.log('Working KPI Calculator - triggerKPICalculationPopup called');
    
    // Get the selected indicator description
    const indicatorSelect = document.getElementById('id_indicator_description');
    if (!indicatorSelect || !indicatorSelect.value) {
        alert('Please select an indicator description first.');
        return;
    }
    
    const indicatorText = indicatorSelect.options[indicatorSelect.selectedIndex].text.toLowerCase();
    console.log('Indicator text:', indicatorText);
    
    // Detect KPI type from indicator text
    const kpiType = detectKPIType(indicatorText);
    console.log('Detected KPI type:', kpiType);
    
    if (!kpiType || !KPI_CONFIGS[kpiType]) {
        alert('KPI type not recognized. Please select a valid indicator.');
        return;
    }
    
    // Show popup
    showKPIPopup(kpiType);
}

// KPI type detection function
function detectKPIType(indicatorText) {
    const text = indicatorText.toLowerCase();
    
    // Direct mapping - comprehensive detection
    if (text.includes('return on assets') || text.includes('roa')) return 'ROA';
    if (text.includes('profit after tax') || text.includes('pat')) return 'PAT';
    if (text.includes('debt service coverage') || text.includes('dscr')) return 'DSCR';
    if (text.includes('energy injection') || text.includes('mwh')) return 'MWh';
    if (text.includes('generation availability') || text.includes('gaf')) return 'GAF';
    if (text.includes('training man hours') || text.includes('tde')) return 'TDE';
    if (text.includes('atc&c') || text.includes('total losses electricity')) return 'ATC';
    if (text.includes('new electricity connections') || text.includes('necd')) return 'NECD';
    if (text.includes('new water connections') || text.includes('nwcd')) return 'NWCD';
    if (text.includes('timely payment of salary') || text.includes('timely payment score') || text.includes('tps')) return 'TPS';
    if (text.includes('timely tax payment') || text.includes('ttp')) return 'TTP';
    if (text.includes('water quality compliance bacteriological') || text.includes('wqcc')) return 'WQCC';
    if (text.includes('water quality compliance - banjul') || text.includes('wqcb')) return 'WQCB';
    if (text.includes('non-revenue water') || text.includes('nrw')) return 'NRW';
    
    // Default fallback
    return 'ROA';
}

// Show KPI popup
function showKPIPopup(kpiType) {
    const config = KPI_CONFIGS[kpiType];
    
    // Create field inputs
    let fieldsHTML = '';
    config.fields.forEach(field => {
        fieldsHTML += `
            <div style="margin: 10px 0;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">${field.label}:</label>
                <input type="${field.type}" 
                       id="${field.id}" 
                       placeholder="${field.placeholder}" 
                       style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        `;
    });
    
    // Add quarter selection
    fieldsHTML += `
        <div style="margin: 10px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Quarter:</label>
            <select id="quarter_selection" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">Select Quarter</option>
                <option value="1">Q1 (January - March)</option>
                <option value="2">Q2 (April - June)</option>
                <option value="3">Q3 (July - September)</option>
                <option value="4">Q4 (October - December)</option>
            </select>
        </div>
    `;
    
    // Create popup HTML
    const popupHTML = `
        <div id="workingKPIPopup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                        background: white; border: 2px solid #007bff; border-radius: 10px; 
                                        padding: 20px; z-index: 10000; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                                        max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="color: #007bff; margin-bottom: 15px;">${config.name}</h3>
            <p style="background: #e7f3ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 14px;">
                <strong>Formula:</strong> ${config.formula}
            </p>
            <div id="kpiInputs">
                ${fieldsHTML}
            </div>
            <div id="kpiResult" style="display: none; background: #e8f5e8; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #28a745;">
                <strong style="color: #155724;">Calculated Result: <span id="calculatedValue">0.00</span></strong>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="calculateKPI('${kpiType}')" 
                        style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Calculate
                </button>
                <button onclick="resetKPIForm()" 
                        style="background: #ffc107; color: black; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Reset
                </button>
                <button onclick="useKPIResult()" 
                        style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Use Result
                </button>
                <button onclick="closeKPIPopup()" 
                        style="background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
        <div id="workingKPIOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;" onclick="closeKPIPopup()"></div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// Calculate KPI result
function calculateKPI(kpiType) {
    const config = KPI_CONFIGS[kpiType];
    const data = {};
    
    // Collect input data
    config.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            data[field.id] = element.value;
        }
    });
    
    // Validate inputs
    const hasEmptyFields = config.fields.some(field => !data[field.id] || data[field.id] === '');
    if (hasEmptyFields) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Check for division by zero
    const denominatorFields = ['total_assets', 'total_debt_service', 'total_period_hours', 'total_number_of_employees', 
                              'total_number_of_new_connections', 'total_number_of_payments_due', 'total_number_of_tested_water_samples', 'water_entering_system'];
    const hasDivisionByZero = denominatorFields.some(field => data[field] === '0');
    if (hasDivisionByZero) {
        alert('Division by zero is not allowed. Please check your input values.');
        return;
    }
    
    try {
        // Calculate result
        const result = config.calculate(data);
        
        // Display result
        document.getElementById('calculatedValue').textContent = result.toFixed(2);
        document.getElementById('kpiResult').style.display = 'block';
        
        // Store result and data globally
        window.currentKPIResult = {
            value: result,
            type: kpiType,
            data: data,
            quarter: document.getElementById('quarter_selection').value
        };
        
        console.log('Calculation successful:', window.currentKPIResult);
        
    } catch (error) {
        console.error('Calculation error:', error);
        alert('Error in calculation. Please check your input values.');
    }
}

// Reset form
function resetKPIForm() {
    const inputs = document.querySelectorAll('#workingKPIPopup input, #workingKPIPopup select');
    inputs.forEach(input => {
        input.value = '';
    });
    
    // Hide result
    const resultDiv = document.getElementById('kpiResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }
    
    // Clear stored result
    window.currentKPIResult = null;
}

// Use KPI result
function useKPIResult() {
    if (!window.currentKPIResult) {
        alert('Please calculate a result first.');
        return;
    }
    
    // Set the achieved value field
    const achievedField = document.getElementById('id_achieved_value');
    if (achievedField) {
        achievedField.value = window.currentKPIResult.value.toFixed(2);
        achievedField.style.backgroundColor = '#e8f5e8';
        achievedField.style.color = '#155724';
    }
    
    // Set quarter if available
    const quarterField = document.getElementById('id_quarter');
    if (quarterField && window.currentKPIResult.quarter) {
        quarterField.value = window.currentKPIResult.quarter;
    }
    
    // Close popup
    closeKPIPopup();
    
    // Show success message
    alert('KPI calculation result has been applied to the form!');
}

// Close popup
function closeKPIPopup() {
    const popup = document.getElementById('workingKPIPopup');
    const overlay = document.getElementById('workingKPIOverlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    // Clear stored result
    window.currentKPIResult = null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Working KPI Calculator loaded and ready');
});