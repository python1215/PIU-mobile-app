/**
 * KPI Module Loader
 * Handles initialization and loading of all KPI modules
 */

class KPIModuleLoader {
    constructor() {
        this.modules = {
            core: null,
            calculationEngine: null,
            dataHandler: null,
            manager: null
        };
        this.loadAttempts = 0;
        this.maxLoadAttempts = 10;
    }

    /**
     * Initialize all KPI modules with dependency checking
     */
    async initialize() {
        console.log('Initializing KPI Module System...');
        
        try {
            // Wait for all module classes to be available
            await this.waitForModules();
            
            // Initialize the modular popup manager
            if (window.modularKPIPopupManager) {
                this.modules.manager = window.modularKPIPopupManager;
                
                // Initialize with existing configurations if available
                if (window.KPIConfigurations) {
                    this.modules.manager.initialize(window.KPIConfigurations);
                    console.log('Modular KPI Popup Manager initialized with configurations');
                } else {
                    console.warn('KPIConfigurations not found. Manager initialized without configurations.');
                }
                
                // Set up global access for backward compatibility
                if (!window.kpiPopupManager) {
                    window.kpiPopupManager = this.modules.manager;
                }
                
                return true;
            } else {
                throw new Error('ModularKPIPopupManager not available');
            }
        } catch (error) {
            console.error('Failed to initialize KPI modules:', error);
            return false;
        }
    }

    /**
     * Wait for all required modules to be loaded
     */
    async waitForModules() {
        const requiredClasses = [
            'KPIPopupCore',
            'KPICalculationEngine', 
            'KPIDataHandler',
            'ModularKPIPopupManager'
        ];
        
        return new Promise((resolve, reject) => {
            const checkModules = () => {
                this.loadAttempts++;
                
                const missingClasses = requiredClasses.filter(className => !window[className]);
                
                if (missingClasses.length === 0) {
                    console.log('All KPI modules loaded successfully');
                    resolve();
                } else if (this.loadAttempts >= this.maxLoadAttempts) {
                    reject(new Error(`Failed to load KPI modules after ${this.maxLoadAttempts} attempts. Missing: ${missingClasses.join(', ')}`));
                } else {
                    console.log(`Waiting for modules: ${missingClasses.join(', ')} (attempt ${this.loadAttempts})`);
                    setTimeout(checkModules, 100);
                }
            };
            
            checkModules();
        });
    }

    /**
     * Get module status for debugging
     */
    getStatus() {
        return {
            loadAttempts: this.loadAttempts,
            maxLoadAttempts: this.maxLoadAttempts,
            modulesLoaded: {
                KPIPopupCore: !!window.KPIPopupCore,
                KPICalculationEngine: !!window.KPICalculationEngine,
                KPIDataHandler: !!window.KPIDataHandler,
                ModularKPIPopupManager: !!window.ModularKPIPopupManager
            },
            managerStatus: this.modules.manager ? this.modules.manager.getModuleStatus() : null
        };
    }

    /**
     * Show popup using the modular system
     */
    showPopup(config) {
        if (this.modules.manager) {
            return this.modules.manager.showPopup(config);
        } else {
            console.error('KPI Manager not initialized. Call initialize() first.');
            return false;
        }
    }

    /**
     * Show popup by KPI type
     */
    showPopupByType(kpiType) {
        if (this.modules.manager) {
            return this.modules.manager.showPopupByType(kpiType);
        } else {
            console.error('KPI Manager not initialized. Call initialize() first.');
            return false;
        }
    }
}

// Create global loader instance
window.kpiModuleLoader = new KPIModuleLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing KPI modules...');
    const success = await window.kpiModuleLoader.initialize();
    
    if (success) {
        console.log('KPI Module System ready');
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('kpiModulesReady', {
            detail: { loader: window.kpiModuleLoader }
        }));
    } else {
        console.error('Failed to initialize KPI Module System');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KPIModuleLoader;
}