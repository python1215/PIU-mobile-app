/**
 * Modular KPI Popup Manager
 * Orchestrates all KPI popup modules for a cohesive system
 */

class ModularKPIPopupManager {
    constructor() {
        // Initialize core modules
        this.core = new KPIPopupCore();
        this.calculationEngine = new KPICalculationEngine(this.core);
        this.dataHandler = new KPIDataHandler(this.core);
        
        // Make data handler globally available
        window.kpiDataHandler = this.dataHandler;
        
        // Bind methods to maintain context
        this.bindMethods();
    }

    /**
     * Bind methods to maintain proper context
     */
    bindMethods() {
        // Bind core methods
        this.core.calculate = this.calculationEngine.calculate.bind(this.calculationEngine);
        this.core.useResult = this.dataHandler.useResult.bind(this.dataHandler);
    }

    /**
     * Show popup (main entry point)
     */
    showPopup(config) {
        return this.core.showPopup(config);
    }

    /**
     * Open popup by KPI type (simplified interface)
     */
    openPopup(kpiType) {
        if (!this.configurations) {
            throw new Error('Manager not initialized. Call initialize() first.');
        }
        
        const config = this.configurations[kpiType];
        if (!config) {
            throw new Error(`Configuration not found for KPI type: ${kpiType}`);
        }
        
        return this.showPopup(config);
    }

    /**
     * Close popup
     */
    closePopup() {
        return this.core.closePopup();
    }

    /**
     * Get calculation results
     */
    getCalculationResults() {
        return this.core.calculationResults;
    }

    /**
     * Clear all calculation results
     */
    clearCalculationResults() {
        this.core.calculationResults = {};
    }

    /**
     * Export calculation history
     */
    exportCalculationHistory() {
        const calculations = Object.entries(this.core.calculationResults).map(([key, value]) => ({
            kpiType: key.toUpperCase(),
            result: value,
            timestamp: new Date().toISOString()
        }));
        
        this.dataHandler.exportCalculationData(calculations);
    }

    /**
     * Validate configuration
     */
    validateConfiguration(config) {
        const required = ['key', 'title', 'fields', 'calculateFunction'];
        const missing = required.filter(field => !config[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration fields: ${missing.join(', ')}`);
        }
        
        if (!Array.isArray(config.fields) || config.fields.length === 0) {
            throw new Error('Configuration must include at least one field');
        }
        
        if (typeof config.calculateFunction !== 'function') {
            throw new Error('calculateFunction must be a function');
        }
        
        return true;
    }

    /**
     * Register custom calculation function
     */
    registerCalculationFunction(kpiType, calculationFunction) {
        if (typeof calculationFunction !== 'function') {
            throw new Error('Calculation function must be a function');
        }
        
        // Store custom calculation functions for dynamic KPI types
        if (!this.customCalculations) {
            this.customCalculations = {};
        }
        
        this.customCalculations[kpiType.toUpperCase()] = calculationFunction;
    }

    /**
     * Get module status
     */
    getModuleStatus() {
        return {
            core: !!this.core,
            calculationEngine: !!this.calculationEngine,
            dataHandler: !!this.dataHandler,
            activePopup: !!this.core.currentPopup,
            calculationResults: Object.keys(this.core.calculationResults).length
        };
    }

    /**
     * Initialize with configurations
     */
    initialize(configurations) {
        if (!configurations || typeof configurations !== 'object') {
            throw new Error('Configurations object is required for initialization');
        }
        
        this.configurations = configurations;
        
        // Validate all configurations
        Object.values(configurations).forEach(config => {
            try {
                this.validateConfiguration(config);
            } catch (error) {
                console.error(`Invalid configuration for ${config.key}:`, error.message);
            }
        });
        
        console.log('Modular KPI Popup Manager initialized successfully');
        return this;
    }

    /**
     * Show popup by KPI type
     */
    showPopupByType(kpiType) {
        if (!this.configurations) {
            throw new Error('Manager not initialized. Call initialize() first.');
        }
        
        const config = this.configurations[kpiType.toUpperCase()];
        if (!config) {
            throw new Error(`Configuration not found for KPI type: ${kpiType}`);
        }
        
        return this.showPopup(config);
    }

    /**
     * Get available KPI types
     */
    getAvailableKPITypes() {
        return this.configurations ? Object.keys(this.configurations) : [];
    }
}

// Create global instance for backward compatibility
window.modularKPIPopupManager = new ModularKPIPopupManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModularKPIPopupManager;
}

// Also maintain backward compatibility with existing code
window.KPIPopupManager = class extends ModularKPIPopupManager {
    constructor() {
        super();
        console.warn('KPIPopupManager is deprecated. Use ModularKPIPopupManager instead.');
    }
};