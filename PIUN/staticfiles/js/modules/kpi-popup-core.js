/**
 * KPI Popup Core Module
 * Core popup creation and management functionality
 */

class KPIPopupCore {
    constructor() {
        this.currentPopup = null;
        this.calculationResults = {};
    }

    /**
     * Create and show a popup with the given configuration
     */
    async showPopup(config) {
        this.closePopup(); // Remove any existing popup
        
        const popup = document.createElement('div');
        popup.id = 'kpiPopup';
        popup.className = 'kpi-popup';
        popup.style.cssText = this.getPopupStyles(config.theme || 'default');
        
        popup.innerHTML = this.buildPopupHTML(config);
        document.body.appendChild(popup);
        
        this.currentPopup = popup;
        this.attachEventListeners(config);
        
        // Auto-load indicator values if indicator is selected
        await this.autoLoadIndicatorValues(config);
        
        console.log(`${config.title} popup created successfully`);
    }

    /**
     * Auto-load KPI indicator values from selected indicator
     */
    async autoLoadIndicatorValues(config) {
        try {
            // Get selected indicator from data entry form
            const indicatorSelect = document.getElementById('id_indicator_description');
            if (indicatorSelect && indicatorSelect.value) {
                const indicatorId = indicatorSelect.value;
                
                // Use data handler to load indicator values
                if (window.kpiDataHandler) {
                    await window.kpiDataHandler.loadIndicatorValues(indicatorId, config);
                }
            }
        } catch (error) {
            console.error('Error auto-loading indicator values:', error);
        }
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
                ${config.fields.filter(field => field.name !== 'quarter').map(field => `
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: ${config.labelColor || '#333'};">
                            ${field.label}:
                        </label>
                        <input type="number" 
                               id="${config.type.toLowerCase()}-${field.name}" 
                               step="${field.step || '0.01'}" 
                               placeholder="${field.placeholder}"
                               ${field.readonly ? 'readonly' : ''}
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; ${field.readonly ? 'background-color: #f8f9fa; color: #6c757d;' : ''}">
                        ${field.unit ? `<small style="color: #666; display: block; margin-top: 2px;">Unit: ${field.unit}</small>` : ''}
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
     * Reset form fields
     */
    resetForm(config) {
        // Reset quarter selection
        const quarterSelect = document.getElementById('quarterSelect');
        if (quarterSelect) {
            quarterSelect.value = '';
        }
        
        // Reset input fields
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
    }

    /**
     * Calculate function for KPI popup
     */
    calculate(config) {
        const values = {};
        let allValid = true;

        // Collect quarter value
        const quarterSelect = document.getElementById('quarterSelect');
        const quarterValue = quarterSelect ? quarterSelect.value : null;
        if (!quarterValue) {
            alert('Please select a quarter.');
            return;
        }
        values.quarter = quarterValue;

        // Collect input values from form fields
        config.fields.forEach(field => {
            if (field.name !== 'quarter' && !field.readonly) {
                const input = document.getElementById(`${config.type.toLowerCase()}-${field.name}`);
                if (input) {
                    const value = parseFloat(input.value) || 0;
                    values[field.name] = value;
                    
                    if (field.required && value <= 0) {
                        allValid = false;
                    }
                }
            }
        });

        if (!allValid) {
            alert(`Please enter valid values for all required fields.`);
            return;
        }

        try {
            // Calculate result using provided function
            const result = config.calculateFunction(values);
            
            // Display result
            const resultElement = document.getElementById('resultValue');
            const resultContainer = document.getElementById('calculationResult');
            
            if (resultElement && resultContainer) {
                resultElement.textContent = result.toFixed(2);
                resultContainer.style.display = 'block';
                
                // Store result
                this.calculationResults[config.key] = result.toFixed(2);
                
                console.log(`${config.type} calculation completed: ${result.toFixed(2)}`);
            }
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Error calculating result. Please check your input values.');
        }
    }
}

// Export for use in other modules
window.KPIPopupCore = KPIPopupCore;