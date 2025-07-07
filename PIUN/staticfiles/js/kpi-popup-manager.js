/**
 * KPI Popup Manager
 * Centralized popup management system for KPI calculations
 */

class KPIPopupManager {
    constructor() {
        this.currentPopup = null;
        this.calculationResults = {};
    }

    /**
     * Create and show a popup with the given configuration
     */
    showPopup(config) {
        this.closePopup(); // Remove any existing popup
        
        const popup = document.createElement('div');
        popup.id = 'kpiPopup';
        popup.className = 'kpi-popup';
        popup.style.cssText = this.getPopupStyles(config.theme || 'default');
        
        popup.innerHTML = this.buildPopupHTML(config);
        document.body.appendChild(popup);
        
        this.currentPopup = popup;
        this.attachEventListeners(config);
        
        console.log(`${config.title} popup created successfully`);
    }

    /**
     * Close current popup
     */
    closePopup() {
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
    }

    /**
     * Get popup styles based on theme
     */
    getPopupStyles(theme) {
        const themes = {
            default: '#007bff',
            warning: '#ffc107',
            success: '#28a745',
            info: '#17a2b8'
        };
        
        const borderColor = themes[theme] || themes.default;
        
        return `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 3px solid ${borderColor};
            border-radius: 10px;
            padding: 30px;
            width: 600px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
    }

    /**
     * Build popup HTML structure
     */
    buildPopupHTML(config) {
        return `
            <h3 style="margin: 0 0 20px 0; color: ${config.titleColor || '#333'};">
                ${config.icon || '📊'} ${config.title}
            </h3>
            
            ${config.formula ? `
                <div style="background: ${config.formulaBg || '#f8f9fa'}; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid ${config.formulaBorder || '#dee2e6'};">
                    <strong>Formula:</strong> ${config.formula}
                </div>
            ` : ''}
            
            <!-- Quarter Selection -->
            <div style="margin: 20px 0;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: ${config.labelColor || '#333'};">
                    Quarter:
                </label>
                <select id="quarterSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: white;">
                    <option value="">Select Quarter</option>
                    <option value="1">Q1 (January - March)</option>
                    <option value="2">Q2 (April - June)</option>
                    <option value="3">Q3 (July - September)</option>
                    <option value="4">Q4 (October - December)</option>
                </select>
            </div>
            
            <div style="display: grid; grid-template-columns: ${config.gridColumns || '1fr 1fr'}; gap: 15px; margin: 20px 0;">
                ${config.fields.map(field => `
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: ${config.labelColor || '#333'};">
                            ${field.label}:
                        </label>
                        <input type="number" 
                               id="${field.id}" 
                               step="${field.step || '0.01'}" 
                               placeholder="${field.placeholder}" 
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                `).join('')}
            </div>
            
            <div id="calculationResult" style="display: none; background: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #c3e6cb;">
                <strong>${config.resultLabel || 'Result'}:</strong> <span id="resultValue"></span>${config.resultUnit || ''}
            </div>
            
            <div style="margin-top: 20px;">
                <button id="calculateBtn" style="background: ${config.calculateBtnColor || '#007bff'}; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; font-weight: bold;">
                    ${config.calculateBtnText || 'Calculate'}
                </button>
                <button id="resetBtn" style="background: #fd7e14; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Reset
                </button>
                <button id="useResultBtn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Use This Value
                </button>
                <button id="closeBtn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
    }

    /**
     * Attach event listeners to popup buttons
     */
    attachEventListeners(config) {
        const calculateBtn = document.getElementById('calculateBtn');
        const resetBtn = document.getElementById('resetBtn');
        const useResultBtn = document.getElementById('useResultBtn');
        const closeBtn = document.getElementById('closeBtn');

        calculateBtn.addEventListener('click', () => this.calculate(config));
        resetBtn.addEventListener('click', () => this.resetForm(config));
        useResultBtn.addEventListener('click', () => this.useResult(config));
        closeBtn.addEventListener('click', () => this.closePopup());
    }

    /**
     * Perform calculation based on config
     */
    calculate(config) {
        const values = {};
        let allValid = true;

        // Collect quarter value
        const quarterSelect = document.getElementById('quarterSelect');
        const quarterValue = quarterSelect.value;
        if (!quarterValue) {
            alert('Please select a quarter.');
            return;
        }
        values.quarter = quarterValue;

        // Collect input values
        config.fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = parseFloat(input.value) || 0;
            values[field.key] = value;
            
            if (field.required && value <= 0) {
                allValid = false;
            }
        });

        if (!allValid) {
            alert(`Please enter valid values for all required fields.`);
            return;
        }

        // Calculate result using provided function
        const result = config.calculateFunction(values);
        
        // Display result
        document.getElementById('resultValue').textContent = result.toFixed(2);
        document.getElementById('calculationResult').style.display = 'block';
        
        // Store result
        this.calculationResults[config.key] = result.toFixed(2);
    }

    /**
     * Use calculated result in the main form
     */
    async useResult(config) {
        const result = this.calculationResults[config.key];
        
        if (result) {
            // Save calculation to database
            await this.saveCalculationToDatabase(config.key.toUpperCase(), result, config);
            
            const achievedField = document.getElementById('id_achieved_value');
            if (achievedField) {
                achievedField.value = result;
                achievedField.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    achievedField.style.backgroundColor = '';
                }, 2000);
                
                // Trigger automatic percentage calculation
                if (typeof window.calculatePercentages === 'function') {
                    window.calculatePercentages();
                }
                
                this.closePopup();
            }
        } else {
            alert(`Please calculate the ${config.resultName || 'value'} first.`);
        }
    }

    /**
     * Save calculation data to database
     */
    async saveCalculationToDatabase(kpiType, calculatedValue, config) {
        try {
            // Get quarter value
            const quarterSelect = document.getElementById('quarterSelect');
            const quarterValue = quarterSelect ? quarterSelect.value : '';

            // Get current input values
            const inputValues = {};
            config.fields.forEach(field => {
                const input = document.getElementById(field.id);
                if (input && input.value) {
                    inputValues[field.key] = parseFloat(input.value) || input.value;
                }
            });

            const response = await fetch('/NAWEC_KPI/api/save-kpi/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    kpi_type: kpiType,
                    calculated_value: parseFloat(calculatedValue),
                    quarter: quarterValue,
                    input_values: inputValues
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`${kpiType} calculation saved successfully with ID: ${data.unique_id}`);
                this.showSuccessMessage(`${kpiType} calculation saved successfully!`);
            } else {
                console.error('Error saving calculation:', data.error);
                this.showErrorMessage('Error saving calculation: ' + data.error);
            }
        } catch (error) {
            console.error('Network error saving calculation:', error);
            this.showErrorMessage('Network error saving calculation');
        }
    }

    /**
     * Get CSRF token for API requests
     */
    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }

    /**
     * Reset all form fields and hide results
     */
    resetForm(config) {
        // Clear quarter selection
        const quarterSelect = document.getElementById('quarterSelect');
        if (quarterSelect) {
            quarterSelect.value = '';
        }

        // Clear all input fields
        config.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.value = '';
            }
        });

        // Hide calculation result
        const resultDiv = document.getElementById('calculationResult');
        if (resultDiv) {
            resultDiv.style.display = 'none';
        }

        // Clear stored result
        delete this.calculationResults[config.key];
        
        console.log(`${config.title} form reset`);
    }

    /**
     * Show KPI popup by type name
     */
    showKPIPopup(kpiType) {
        console.log(`🔴 showKPIPopup called with type: ${kpiType}`);
        
        if (!window.KPIConfigurations) {
            console.error('KPIConfigurations not loaded');
            return;
        }
        
        const config = window.KPIConfigurations[kpiType];
        if (!config) {
            console.error(`Configuration not found for KPI type: ${kpiType}`);
            console.log('Available configurations:', Object.keys(window.KPIConfigurations));
            return;
        }
        
        console.log(`Found configuration for ${kpiType}:`, config);
        this.showPopup(config);
    }
}

// Create global instance
window.kpiPopupManager = new KPIPopupManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KPIPopupManager;
}