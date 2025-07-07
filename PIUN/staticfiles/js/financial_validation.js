/**
 * Financial Validation System for PIU Financial Management
 * Ensures Project -> Components -> Subcomponents -> Activities allocation consistency
 */

class FinancialValidator {
    constructor() {
        this.baseUrl = '/PIU_Financial_mgt/api/';
        this.init();
    }

    init() {
        // Initialize validation on form fields
        this.attachValidators();
    }

    attachValidators() {
        // Project funding validation
        $(document).on('change', 'input[name="funding"], select[name="currency"]', (e) => {
            this.validateProjectFunding(e.target);
        });

        // Component allocation validation
        $(document).on('change', 'input[name="allocation"], select[name="projectID"], select[name="currency"]', (e) => {
            // Skip validation for subcomponent forms to allow dynamic loading
            if ($(e.target).closest('form').find('select[name="compID"]').length && 
                $(e.target).attr('name') === 'projectID') {
                return; // Let the component loading handle this
            }
            if ($(e.target).closest('form').find('input[name="allocation"]').length) {
                this.validateComponentAllocation(e.target);
            }
        });

        // Subcomponent allocation validation
        $(document).on('change', 'input[name="allocation"], select[name="compID"]', (e) => {
            if ($(e.target).closest('form').find('select[name="compID"]').length) {
                this.validateSubcomponentAllocation(e.target);
            }
        });

        // Activity allocation validation
        $(document).on('change', 'input[name="allocation"], select[name="subcompID"]', (e) => {
            if ($(e.target).closest('form').find('select[name="subcompID"]').length) {
                this.validateActivityAllocation(e.target);
            }
        });
    }

    async validateProjectFunding(element) {
        const form = $(element).closest('form');
        const projectID = form.find('input[name="projectID"]').val() || form.find('select[name="projectID"]').val();
        const funding = form.find('input[name="funding"]').val();
        const currency = form.find('select[name="currency"]').val();

        if (!funding) return;
        
        // For new projects without projectID, show info message
        if (!projectID) {
            const data = {
                is_valid: true,
                message: `Project funding set to ${funding} ${currency || 'GMD'}. Components can be added after creation.`,
                severity: 'info'
            };
            this.showValidationMessage(form, data, 'project');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}validate-project-funding/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    project_id: projectID,
                    funding: parseFloat(funding),
                    currency: currency
                })
            });

            const data = await response.json();
            this.showValidationMessage(form, data, 'project');
        } catch (error) {
            console.error('Validation error:', error);
        }
    }

    async validateComponentAllocation(element) {
        const form = $(element).closest('form');
        const projectID = form.find('select[name="projectID"]').val();
        const allocation = form.find('input[name="allocation"]').val();
        const componentID = form.find('input[name="compID"]').val();

        if (!projectID || !allocation) return;

        try {
            const response = await fetch(`${this.baseUrl}validate-component-allocation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    project_id: projectID,
                    component_id: componentID,
                    allocation: parseFloat(allocation)
                })
            });

            const data = await response.json();
            this.showValidationMessage(form, data, 'component');
        } catch (error) {
            console.error('Validation error:', error);
        }
    }

    async validateSubcomponentAllocation(element) {
        const form = $(element).closest('form');
        const componentID = form.find('select[name="compID"]').val();
        const allocation = form.find('input[name="allocation"]').val();
        const subcomponentID = form.find('input[name="subcompID"]').val();

        if (!componentID || !allocation) return;

        try {
            const response = await fetch(`${this.baseUrl}validate-subcomponent-allocation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    component_id: componentID,
                    subcomponent_id: subcomponentID,
                    allocation: parseFloat(allocation)
                })
            });

            const data = await response.json();
            this.showValidationMessage(form, data, 'subcomponent');
        } catch (error) {
            console.error('Validation error:', error);
        }
    }

    async validateActivityAllocation(element) {
        const form = $(element).closest('form');
        const subcomponentID = form.find('select[name="subcompID"]').val();
        const allocation = form.find('input[name="allocation"]').val();
        const activityID = form.find('input[name="activityID"]').val();

        if (!subcomponentID || !allocation) return;

        try {
            const response = await fetch(`${this.baseUrl}validate-activity-allocation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    subcomponent_id: subcomponentID,
                    activity_id: activityID,
                    allocation: parseFloat(allocation)
                })
            });

            const data = await response.json();
            this.showValidationMessage(form, data, 'activity');
        } catch (error) {
            console.error('Validation error:', error);
        }
    }

    showValidationMessage(form, data, level) {
        // Remove existing validation messages
        form.find('.validation-message').remove();

        let messageHtml = '';
        let alertClass = 'alert-success';
        let icon = 'bi-check-circle';
        let title = '✓ Valid:';

        if (data.severity === 'info') {
            alertClass = 'alert-info';
            icon = 'bi-info-circle';
            title = 'ℹ Info:';
        } else if (data.severity === 'warning') {
            alertClass = 'alert-warning';
            icon = 'bi-exclamation-triangle';
            title = '⚠ Warning:';
        } else if (data.severity === 'error' || !data.is_valid) {
            alertClass = 'alert-danger';
            icon = 'bi-x-circle';
            title = '✗ Error:';
        }

        // For errors and warnings, show modal dialog
        if (data.severity === 'error' || data.severity === 'warning' || !data.is_valid) {
            this.showValidationModal(data, level);
            return;
        }

        messageHtml = `
            <div class="alert ${alertClass} validation-message" role="alert">
                <i class="bi ${icon} me-2"></i>
                <strong>${title}</strong> ${data.message}
                ${data.details ? `<br><small>${data.details}</small>` : ''}
                ${data.suggestions ? `<br><small><strong>Suggestion:</strong> ${data.suggestions}</small>` : ''}
            </div>
        `;

        // Insert message after the allocation field
        const allocationField = form.find('input[name="allocation"]');
        if (allocationField.length) {
            allocationField.closest('.form-group, .col-md-6, .mb-3').after(messageHtml);
        } else {
            form.prepend(messageHtml);
        }

        // Auto-hide success messages after 5 seconds
        if (data.is_valid) {
            setTimeout(() => {
                form.find('.validation-message').fadeOut();
            }, 5000);
        }
    }

    showValidationModal(data, level) {
        const timestamp = Date.now();
        const modalId = `validationModal-${timestamp}`;
        const buttonId = `confirmValidationBtn-${timestamp}`;
        
        // Remove any existing validation modals
        $('.validation-modal').remove();
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');

        const modalTitle = data.severity === 'error' ? 'Validation Error' : 'Validation Warning';
        const modalClass = data.severity === 'error' ? 'text-danger' : 'text-warning';
        const icon = data.severity === 'error' ? 'bi-x-circle' : 'bi-exclamation-triangle';
        
        console.log('Creating validation modal with data:', data);
        
        const modalHtml = `
            <div class="modal validation-modal show" id="${modalId}" tabindex="-1" style="display: block;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title ${modalClass}" id="${modalId}Label">
                                <i class="bi ${icon} me-2"></i>${modalTitle}
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-${data.severity === 'error' ? 'danger' : 'warning'} border-0 bg-light">
                                <p class="mb-2"><strong>Message:</strong> ${data.message}</p>
                                ${data.suggestions ? `<p class="mb-0"><strong>Suggestion:</strong> ${data.suggestions}</p>` : ''}
                            </div>
                            ${data.severity === 'warning' ? 
                                '<p class="text-muted small">You can proceed with this warning, but please review the allocation.</p>' : 
                                '<p class="text-muted small">Please correct this error before proceeding.</p>'
                            }
                        </div>
                        <div class="modal-footer border-top-0">
                            <button type="button" class="btn btn-primary" id="${buttonId}">
                                <i class="bi bi-check-lg me-1"></i>OK, I Understand
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add backdrop first
        const backdrop = $('<div class="modal-backdrop show" style="z-index: 1040;"></div>');
        $('body').append(backdrop);
        
        // Add modal to body
        $('body').append(modalHtml);
        $('body').addClass('modal-open');
        
        const modalElement = document.getElementById(modalId);

        // Auto-close modal after 30 seconds
        const autoCloseTimer = setTimeout(() => {
            console.log('Auto-closing modal after 30 seconds');
            closeModal();
        }, 30000);

        // Function to close modal
        const closeModal = () => {
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            $('body').removeClass('modal-open');
            backdrop.remove();
            $(`#${modalId}`).remove();
            
            // Remove keydown event listener
            $(document).off('keydown.validationModal');
            
            // Clear the auto-close timer
            clearTimeout(autoCloseTimer);
        };

        // Handle OK button click
        $(`#${buttonId}`).on('click', function() {
            console.log('OK button clicked, closing modal');
            closeModal();
        });

        // Prevent all modal dismissal methods except OK button and timer
        modalElement.addEventListener('click', function(e) {
            // Only allow clicks on the OK button
            if (!e.target.id.includes('confirmValidationBtn')) {
                e.stopPropagation();
                e.preventDefault();
            }
        });
        
        backdrop.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Backdrop click prevented');
            return false;
        });
        
        // Prevent escape key and other keyboard dismissal
        $(document).on('keydown.validationModal', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Escape key prevented');
                return false;
            }
        });
        
        console.log('Modal created and will auto-close in 30 seconds');
    }

    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    }

    // Show real-time allocation summary
    showAllocationSummary(level, data) {
        const summaryContainer = $(`#${level}-allocation-summary`);
        if (summaryContainer.length) {
            let summaryHtml = `
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0"><i class="bi bi-calculator me-2"></i>Allocation Summary</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Current Total:</strong> ${data.current_total} ${data.currency}
                            </div>
                            <div class="col-md-6">
                                <strong>Allocated:</strong> ${data.allocated_total} ${data.currency}
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <strong>Remaining:</strong> 
                                <span class="${data.remaining >= 0 ? 'text-success' : 'text-danger'}">
                                    ${data.remaining} ${data.currency}
                                </span>
                            </div>
                            <div class="col-md-6">
                                <strong>Progress:</strong> ${data.percentage}%
                            </div>
                        </div>
                    </div>
                </div>
            `;
            summaryContainer.html(summaryHtml);
        }
    }
}

// Initialize validator when document is ready
$(document).ready(() => {
    new FinancialValidator();
});

// Utility functions for form validation
window.FinancialValidationUtils = {
    formatCurrency: (amount, currency = 'GMD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },

    validateForm: async (formElement) => {
        const form = $(formElement);
        const validator = new FinancialValidator();
        
        // Trigger validation for all relevant fields
        const allocationField = form.find('input[name="allocation"]');
        if (allocationField.length) {
            await validator.validateComponentAllocation(allocationField[0]);
        }
        
        // Check if there are any error messages
        const errorMessages = form.find('.alert-danger');
        return errorMessages.length === 0;
    }
};