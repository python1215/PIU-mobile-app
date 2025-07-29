/**
 * KPI Smart Trigger System
 * Handles automatic popup triggering based on indicator selection
 */

class KPITriggerSystem {
    constructor() {
        this.isInitialized = false;
        this.triggerMethods = ['click', 'focus', 'input'];
    }

    /**
     * Initialize the smart popup trigger system
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupSmartPopupTriggers();
        this.isInitialized = true;
        console.log('KPI Smart Trigger System initialized');
    }

    /**
     * Setup smart popup triggers for achieved value field
     */
    setupSmartPopupTriggers() {
        const achievedField = document.getElementById('id_achieved_value');
        const baselineField = document.getElementById('id_baseline_value');
        
        if (!achievedField || !baselineField) {
            console.warn('Required fields not found for KPI triggers');
            return;
        }

        // Add multiple event listeners for reliability
        this.triggerMethods.forEach(eventType => {
            achievedField.addEventListener(eventType, (event) => {
                this.handleTriggerEvent(event, baselineField);
            });
        });

        console.log('Smart popup triggers attached successfully');
    }

    /**
     * Handle trigger event and determine which popup to show
     */
    handleTriggerEvent(event, baselineField) {
        // Check if baseline value exists
        const baselineValue = parseFloat(baselineField.value) || 0;
        
        if (baselineValue <= 0) {
            if (event.type === 'click') {
                alert('Please enter a baseline value first before calculating achieved value.');
            }
            return;
        }

        // Get selected indicator
        const indicatorSelect = document.getElementById('id_indicator_description');
        if (!indicatorSelect || !indicatorSelect.value) {
            console.log('No indicator selected');
            return;
        }

        const selectedOption = indicatorSelect.options[indicatorSelect.selectedIndex];
        const indicatorText = selectedOption.text.toLowerCase();
        const indicatorValue = selectedOption.value;
        
        console.log('Triggering popup for:', indicatorValue, indicatorText);
        
        // Determine which popup to show
        const kpiType = this.detectKPIType(indicatorText, indicatorValue);
        if (kpiType) {
            this.showKPIPopup(kpiType);
        }
    }

    /**
     * Detect KPI type based on indicator text and value
     */
    detectKPIType(indicatorText, indicatorValue) {
        console.log('Detecting KPI type for:', indicatorText, indicatorValue);
        
        // FORCED OVERRIDE SYSTEM - Check these first before any pattern matching
        
        // Force KPI-07 (Average Time to Collect) - Multiple detection methods
        if (indicatorValue === '7' || 
            indicatorText.includes('7') || 
            indicatorText.toLowerCase().includes('kpi-07') ||
            indicatorText.toLowerCase().includes('kpi07') ||
            indicatorText.toLowerCase().includes('average time') || 
            indicatorText.toLowerCase().includes('atc') ||
            indicatorText.toLowerCase().includes('collect') ||
            indicatorText.toLowerCase().includes('billing') ||
            indicatorText.toLowerCase().includes('collection')) {
            console.log('🔴 FORCED KPI-07 ATC Override Triggered for:', indicatorText);
            return 'ATC';
        }
        
        // Force KPI-06 (Training Man Hours) 
        if (indicatorValue === '6' || 
            indicatorText.includes('6') || 
            indicatorText.toLowerCase().includes('training') || 
            indicatorText.toLowerCase().includes('tde') ||
            indicatorText.toLowerCase().includes('employee')) {
            console.log('🔴 FORCED KPI-06 TDE Override Triggered for:', indicatorText);
            return 'TDE';
        }
        
        // Force KPI-04 (Local Production - Total Electricity Generated)
        if (indicatorText.toLowerCase().includes('local production') ||
            indicatorText.toLowerCase().includes('total electricity generated') ||
            indicatorText.toLowerCase().includes('energy injection') ||
            indicatorText.toLowerCase().includes('kpi-04') ||
            indicatorText.toLowerCase().includes('kpi04')) {
            console.log('🔴 FORCED KPI-04 MWh Override Triggered for:', indicatorText);
            return 'MWh';
        }
        
        const detectionRules = [
            {
                type: 'ROA',
                patterns: ['return on net assets', 'roa', 'return on assets', 'kpi-01', 'kpi01', 'return', 'net assets']
            },
            {
                type: 'PAT',
                patterns: ['profit after tax', 'pat', 'kpi-02', 'kpi02', 'profit', 'tax']
            },
            {
                type: 'DSCR',
                patterns: ['debt service coverage ratio', 'dscr', 'debt service coverage', 'kpi-03', 'kpi03', 'debt', 'coverage', 'ratio']
            },
            {
                type: 'MWh',
                patterns: ['local production', 'total electricity generated', 'energy injection', 'mwh', 'kpi-04', 'kpi04', 'energy', 'injection', 'power', 'megawatt']
            },
            {
                type: 'GAF',
                patterns: ['generation availability factor', 'gaf', 'grid availability', 'kpi-05', 'kpi05', 'generation', 'availability', 'factor']
            },
            {
                type: 'TDE',
                patterns: ['training days efficiency', 'tde', 'training efficiency', 'kpi-06', 'kpi06', 'training', 'days', 'efficiency', 'employee training']
            },
            {
                type: 'ATC',
                patterns: ['average time to collect', 'atc', 'collection time', 'kpi-07', 'kpi07', 'average', 'collect', 'collection', 'billing efficiency', 'losses electricity']
            },
            {
                type: 'NECD',
                patterns: ['new electricity connection days', 'necd', 'electricity connection', 'kpi-08', 'kpi08', 'new electricity', 'connection days', 'electricity days']
            },
            {
                type: 'NWCD',
                patterns: ['new water connection days', 'nwcd', 'water connection', 'kpi-09', 'kpi09', 'new water', 'water days', 'connection water']
            },
            {
                type: 'TPS',
                patterns: ['timely payment of salary', 'timely payment score', 'tps', 'payment salary', 'salary payment', 'kpi-10', 'kpi10', 'timely payment', 'payment timely', 'on-time payments', 'salary timely']
            },
            {
                type: 'TTP',
                patterns: ['timely tax payment', 'ttp', 'tax payment', 'kpi-11', 'kpi11', 'timely tax', 'tax timely']
            },
            {
                type: 'WQCC',
                patterns: ['water quality compliance chlorine', 'wqcc', 'quality compliance chlorine', 'kpi-12', 'kpi12', 'water quality', 'chlorine compliance', 'water chlorine']
            },
            {
                type: 'WQCB',
                patterns: ['water quality compliance bacteriological', 'wqcb', 'compliance bacteriological', 'kpi-13', 'kpi13', 'bacteriological compliance', 'water bacteriological']
            },
            {
                type: 'NRW',
                patterns: ['non-revenue water', 'nrw', 'non revenue water', 'kpi-14', 'kpi14', 'revenue water', 'water revenue', 'non revenue']
            }
        ];

        // Check each rule with detailed logging
        for (const rule of detectionRules) {
            console.log(`Checking rule for ${rule.type}:`, rule.patterns);
            
            const matchFound = rule.patterns.some(pattern => {
                const lowerPattern = pattern.toLowerCase();
                const lowerText = indicatorText.toLowerCase();
                const lowerValue = indicatorValue.toLowerCase();
                
                const textMatch = lowerText.includes(lowerPattern);
                const valueMatch = lowerValue.includes(lowerPattern);
                const exactMatch = lowerValue === lowerPattern;
                
                console.log(`  Pattern "${pattern}": text="${textMatch}", value="${valueMatch}", exact="${exactMatch}"`);
                
                return textMatch || valueMatch || exactMatch;
            });
            
            if (matchFound) {
                console.log(`✓ KPI type detected: ${rule.type} for "${indicatorText}"`);
                return rule.type;
            }
        }

        console.log('❌ No specific KPI type detected for:', indicatorText, indicatorValue);
        
        // Instead of defaulting to ROA, let's be more specific
        if (indicatorText.toLowerCase().includes('energy') || indicatorText.toLowerCase().includes('injection')) {
            console.log('Forcing MWh for energy-related indicator');
            return 'MWh';
        }
        
        return 'ROA';
    }

    /**
     * Show appropriate KPI popup
     */
    showKPIPopup(kpiType) {
        if (!window.KPIConfigurations || !window.kpiPopupManager) {
            console.error('KPI system dependencies not loaded');
            return;
        }

        const config = window.KPIConfigurations[kpiType];
        if (config) {
            window.kpiPopupManager.showPopup(config);
        } else {
            console.error(`Configuration not found for KPI type: ${kpiType}`);
        }
    }

    /**
     * Reinitialize triggers (useful after dynamic content updates)
     */
    reinitialize() {
        this.isInitialized = false;
        this.initialize();
    }
}

// Create global instance
window.kpiTriggerSystem = new KPITriggerSystem();

// Auto-initialize disabled - using direct override system instead
// document.addEventListener('DOMContentLoaded', function() {
//     window.kpiTriggerSystem.initialize();
// });

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KPITriggerSystem;
}