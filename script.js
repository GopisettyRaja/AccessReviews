document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');
    const pages = document.querySelectorAll('.page');
    const employeeReviewList = document.getElementById('employeeReviewList');
    const reviewDetailModal = document.getElementById('reviewDetailModal');
    const modalCloseButton = reviewDetailModal.querySelector('.close-button');

    // Modal elements for employee details
    const modalEmployeeName = document.getElementById('modalEmployeeName');
    const modalEmployeeDepartment = document.getElementById('modalEmployeeDepartment');
    const modalEntitlementCount = document.getElementById('modalEntitlementCount');
    const entitlementsTableBody = document.getElementById('entitlementsTableBody');
    const modalDecisionSummary = document.getElementById('modalDecisionSummary');
    const modalApproveAllBtn = document.getElementById('modalApproveAllBtn');
    const modalDenyAllBtn = document.getElementById('modalDenyAllBtn');
    const modalOverallComment = document.getElementById('modalOverallComment');
    const modalSubmitReviewBtn = document.getElementById('modalSubmitReviewBtn');
    const modalRequestMoreInfoBtn = document.getElementById('modalRequestMoreInfoBtn');
    const modalEmployeeHistory = document.getElementById('modalEmployeeHistory');

    const reviewSearchInput = document.getElementById('reviewSearchInput');
    const filterDueDate = document.getElementById('filterDueDate');
    const filterApplication = document.getElementById('filterApplication');
    const filterRiskLevel = document.getElementById('filterRiskLevel');
    const filterDepartment = document.getElementById('filterDepartment');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectedCountSpan = document.getElementById('selectedCount');
    const bulkApproveBtn = document.getElementById('bulkApproveBtn');
    const bulkDenyBtn = document = document.getElementById('bulkDenyBtn');
    const filterToggleButton = document.querySelector('.filter-toggle-btn');
    const filtersBar = document.querySelector('.filters-bar');

    const toastContainer = document.getElementById('toastContainer');

    // Mock Data - Now Employee-centric
    let employeeReviewsData = [
        {
            employeeId: 'emp001',
            employeeName: 'Alice Johnson',
            department: 'Sales',
            employeeHistory: [
                { reviewer: 'System', action: 'Account Created', date: '2024-03-01' },
                { reviewer: 'Manager Jane', action: 'Approved all access', date: '2024-12-01', comment: 'Annual review, all access remains valid.' },
            ],
            entitlements: [
                {
                    entitlementId: 'ent001a',
                    application: 'SalesForce CRM',
                    entitlementName: 'Sales Rep Role',
                    reasonForAccess: 'New sales team member requiring CRM access for lead management and tracking.',
                    provisionedDate: '2024-03-15',
                    dueDate: '2025-05-25', // Due soon (within 3 days of today)
                    riskLevel: 'Medium',
                    lastLogin: '2025-05-20 10:30 AM',
                    lastActivity: '2025-05-20 11:00 AM',
                    activityFrequency: 'Daily',
                    decision: 'pending', // pending, approved, denied
                    comment: ''
                },
                {
                    entitlementId: 'ent001b',
                    application: 'Slack',
                    entitlementName: 'Sales Channel Access',
                    reasonForAccess: 'Collaboration with sales team.',
                    provisionedDate: '2024-03-15',
                    dueDate: '2025-06-01',
                    riskLevel: 'Low',
                    lastLogin: '2025-05-22 09:00 AM',
                    lastActivity: '2025-05-22 09:10 AM',
                    activityFrequency: 'Daily',
                    decision: 'pending',
                    comment: ''
                },
                {
                    entitlementId: 'ent001c',
                    application: 'Marketing App',
                    entitlementName: 'Viewer Access',
                    reasonForAccess: 'Occasional viewing of marketing campaigns.',
                    provisionedDate: '2024-04-01',
                    dueDate: '2025-05-23', // Due today
                    riskLevel: 'Low',
                    lastLogin: '2025-04-10 02:00 PM',
                    lastActivity: '2025-04-10 02:15 PM',
                    activityFrequency: 'Infrequent',
                    decision: 'pending',
                    comment: ''
                }
            ],
            isSelected: false,
            overallComment: ''
        },
        {
            employeeId: 'emp002',
            employeeName: 'Bob Smith',
            department: 'Engineering',
            employeeHistory: [],
            entitlements: [
                {
                    entitlementId: 'ent002a',
                    application: 'Jira Software',
                    entitlementName: 'Project Admin',
                    reasonForAccess: 'Responsible for project oversight, team management, and workflow configuration within Jira.',
                    provisionedDate: '2023-11-01',
                    dueDate: '2025-05-21', // Overdue
                    riskLevel: 'High',
                    lastLogin: '2025-05-10 09:15 AM',
                    lastActivity: '2025-05-10 09:45 AM',
                    activityFrequency: 'Weekly',
                    decision: 'pending',
                    comment: ''
                },
                {
                    entitlementId: 'ent002b',
                    application: 'GitHub Enterprise',
                    entitlementName: 'Code Contributor',
                    reasonForAccess: 'Developing and managing source code repositories.',
                    provisionedDate: '2023-10-01',
                    dueDate: '2025-06-15',
                    riskLevel: 'High',
                    lastLogin: '2025-05-22 10:00 AM',
                    lastActivity: '2025-05-22 11:30 AM',
                    activityFrequency: 'Daily',
                    decision: 'pending',
                    comment: ''
                }
            ],
            isSelected: false,
            overallComment: ''
        },
        {
            employeeId: 'emp003',
            employeeName: 'Charlie Brown',
            department: 'HR',
            employeeHistory: [],
            entitlements: [
                {
                    entitlementId: 'ent003a',
                    application: 'HRIS System',
                    entitlementName: 'HR Manager Access',
                    reasonForAccess: 'Requires full HRIS access for personnel management, payroll processing, and benefits administration.',
                    provisionedDate: '2024-01-01',
                    dueDate: '2025-06-30',
                    riskLevel: 'High',
                    lastLogin: '2025-05-22 08:00 AM',
                    lastActivity: '2025-05-22 08:30 AM',
                    activityFrequency: 'Daily',
                    decision: 'pending',
                    comment: ''
                },
                {
                    entitlementId: 'ent003b',
                    application: 'SharePoint',
                    entitlementName: 'Internal Communications',
                    reasonForAccess: 'Access to internal HR documents and policies.',
                    provisionedDate: '2024-01-05',
                    dueDate: '2025-06-30',
                    riskLevel: 'Medium',
                    lastLogin: '2025-05-21 01:00 PM',
                    lastActivity: '2025-05-21 01:30 PM',
                    activityFrequency: 'Weekly',
                    decision: 'pending',
                    comment: ''
                }
            ],
            isSelected: false,
            overallComment: ''
        },
        {
            employeeId: 'emp004',
            employeeName: 'Diana Prince',
            department: 'Marketing',
            employeeHistory: [],
            entitlements: [
                {
                    entitlementId: 'ent004a',
                    application: 'Confluence Wiki',
                    entitlementName: 'Knowledge Base Editor',
                    reasonForAccess: 'Content creator for internal documentation and team collaboration spaces.',
                    provisionedDate: '2024-02-10',
                    dueDate: '2025-05-28',
                    riskLevel: 'Low',
                    lastLogin: '2025-05-18 01:00 PM',
                    lastActivity: '2025-05-18 01:30 PM',
                    activityFrequency: 'Infrequent',
                    decision: 'pending',
                    comment: ''
                }
            ],
            isSelected: false,
            overallComment: ''
        }
    ];

    // Store the currently active employee in the modal
    let currentEmployeeInModal = null;

    // Initial page load (make Dashboard active by default)
    document.getElementById('dashboard-page').classList.add('active');
    pageTitle.textContent = 'Dashboard';

    // --- Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = e.currentTarget.dataset.page + '-page';

            navLinks.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            pages.forEach(page => {
                if (page.id === targetPageId) {
                    page.classList.add('active');
                    pageTitle.textContent = e.currentTarget.querySelector('span').textContent.trim();
                } else {
                    page.classList.remove('active');
                }
            });

            if (targetPageId === 'pending-reviews-page') {
                renderEmployeeReviews();
                updateBulkActionsBar();
            }
        });
    });

    // --- Employee Review Card Rendering ---
    function renderEmployeeReviews() {
        employeeReviewList.innerHTML = ''; // Clear previous cards

        const searchTerm = reviewSearchInput.value.toLowerCase();
        const selectedDueDateFilter = filterDueDate.value;
        const selectedApplicationFilter = filterApplication.value;
        const selectedRiskLevelFilter = filterRiskLevel.value;
        const selectedDepartmentFilter = filterDepartment.value;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const filteredEmployees = employeeReviewsData.filter(employee => {
            const matchesSearch = employee.employeeName.toLowerCase().includes(searchTerm) ||
                employee.entitlements.some(e => e.application.toLowerCase().includes(searchTerm) || e.entitlementName.toLowerCase().includes(searchTerm));

            const hasPendingEntitlements = employee.entitlements.some(e => e.decision === 'pending');
            if (!hasPendingEntitlements) return false; // Only show employees with pending entitlements

            let matchesDueDate = true;
            if (selectedDueDateFilter !== '') {
                const pendingEntitlements = employee.entitlements.filter(e => e.decision === 'pending');
                // Find the earliest due date among pending entitlements for this employee
                const earliestDueDate = pendingEntitlements.length > 0
                    ? pendingEntitlements.reduce((minDate, ent) => {
                        const entDueDate = new Date(ent.dueDate);
                        return entDueDate < minDate ? entDueDate : minDate;
                    }, new Date('2099-12-31')) // Initialize with a far future date
                    : null;

                if (!earliestDueDate) matchesDueDate = false; // No pending entitlements
                else {
                    earliestDueDate.setHours(0, 0, 0, 0); // Normalize to start of day

                    if (selectedDueDateFilter === 'today') {
                        matchesDueDate = earliestDueDate.toDateString() === today.toDateString();
                    } else if (selectedDueDateFilter === 'this-week') {
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        startOfWeek.setHours(0, 0, 0, 0);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        endOfWeek.setHours(23, 59, 59, 999);
                        matchesDueDate = earliestDueDate >= startOfWeek && earliestDueDate <= endOfWeek;
                    } else if (selectedDueDateFilter === 'overdue') {
                        matchesDueDate = earliestDueDate < today;
                    }
                }
            }

            const matchesApplication = selectedApplicationFilter === '' ||
                employee.entitlements.some(e => e.application.toLowerCase().includes(selectedApplicationFilter.toLowerCase()));

            const matchesRiskLevel = selectedRiskLevelFilter === '' ||
                employee.entitlements.some(e => e.riskLevel.toLowerCase() === selectedRiskLevelFilter.toLowerCase());

            const matchesDepartment = selectedDepartmentFilter === '' ||
                employee.department.toLowerCase() === selectedDepartmentFilter.toLowerCase();

            return matchesSearch && matchesDueDate && matchesApplication && matchesRiskLevel && matchesDepartment;
        });

        if (filteredEmployees.length === 0) {
            employeeReviewList.innerHTML = '<p class="no-reviews-message">No pending employee reviews found matching your criteria.</p>';
            return;
        }

        filteredEmployees.forEach(employee => {
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('employee-review-card-wrapper');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('employee-review-card-checkbox');
            checkbox.checked = employee.isSelected;
            checkbox.dataset.id = employee.employeeId;
            cardWrapper.appendChild(checkbox);

            const card = document.createElement('div');
            card.classList.add('employee-review-card');
            card.dataset.id = employee.employeeId;

            // Determine overall status and due date for the employee card
            let employeeStatus = 'Pending';
            let earliestDueDate = null;
            let highestRisk = 'Low'; // Track highest risk among pending entitlements

            employee.entitlements.filter(e => e.decision === 'pending').forEach(entitlement => {
                const entDueDate = new Date(entitlement.dueDate);
                if (!earliestDueDate || entDueDate < earliestDueDate) {
                    earliestDueDate = entDueDate;
                }
                const riskOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                if (riskOrder[entitlement.riskLevel.toLowerCase()] > riskOrder[highestRisk.toLowerCase()]) {
                    highestRisk = entitlement.riskLevel;
                }
            });

            if (earliestDueDate) {
                const todayForStatus = new Date();
                todayForStatus.setHours(0, 0, 0, 0);
                const statusClass = getStatusClass(earliestDueDate.toISOString().split('T')[0], todayForStatus); // Use earliestDueDate
                if (statusClass === 'status-overdue') employeeStatus = 'Overdue';
                else if (statusClass === 'status-due-soon') employeeStatus = 'Due Soon';
                else employeeStatus = 'Pending'; // Default to Pending if not overdue/due soon
            } else {
                employeeStatus = 'No Pending'; // Should not happen if filtered correctly
            }

            const riskBadgeClass = `risk-${highestRisk.toLowerCase()}`;
            const statusBadgeClass = `status-${employeeStatus.toLowerCase().replace(' ', '-')}`;

            card.innerHTML = `
                <div class="employee-review-header">
                    <div class="employee-info">
                        <h3>${employee.employeeName}</h3>
                        <p>Department: <strong>${employee.department}</strong></p>
                    </div>
                    <span class="badge ${statusBadgeClass}">${employeeStatus}</span>
                </div>
                <div class="employee-review-meta">
                    <span><i class="fas fa-cubes"></i> ${employee.entitlements.filter(e => e.decision === 'pending').length} Entitlement(s) Pending</span>
                    <span><i class="fas fa-calendar-alt"></i> Earliest Due: ${earliestDueDate ? earliestDueDate.toLocaleDateString() : 'N/A'}</span>
                    <span class="badge ${riskBadgeClass}"><i class="fas fa-exclamation-triangle"></i> ${highestRisk} Risk</span>
                </div>
                <p class="employee-review-summary">Review all active access for ${employee.employeeName} to ensure compliance and security.</p>
                <div class="employee-review-actions">
                    <button class="btn btn-outline view-details-btn" data-id="${employee.employeeId}"><i class="fas fa-eye"></i> Review Access</button>
                    <button class="btn btn-approve quick-approve-btn" data-id="${employee.employeeId}"><i class="fas fa-check"></i> Quick Approve All</button>
                </div>
            `;
            cardWrapper.appendChild(card);
            employeeReviewList.appendChild(cardWrapper);
        });
    }

    // --- Event Delegation for Employee Review Card Actions ---
    employeeReviewList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return; // If clicked element has no data-id, ignore.

        // Find the closest ancestor with data-id (either the card or a button inside it)
        const targetCardOrButton = e.target.closest('[data-id]');
        if (!targetCardOrButton) return; // If no data-id ancestor, ignore.

        const employeeId = targetCardOrButton.dataset.id;
        const employee = employeeReviewsData.find(emp => emp.employeeId === employeeId);
        if (!employee) return;

        if (e.target.classList.contains('view-details-btn')) {
            openEmployeeReviewDetailModal(employee);
        } else if (e.target.classList.contains('quick-approve-btn')) {
            handleQuickApproveAll(employee.employeeId);
        }
    });

    employeeReviewList.addEventListener('change', (e) => {
        if (e.target.classList.contains('employee-review-card-checkbox')) {
            const id = e.target.dataset.id;
            const employee = employeeReviewsData.find(emp => emp.employeeId === id);
            if (employee) {
                employee.isSelected = e.target.checked;
                updateBulkActionsBar();
            }
        }
    });

    // --- Modal Logic for Employee Review ---
    function openEmployeeReviewDetailModal(employee) {
        currentEmployeeInModal = employee; // Store reference to current employee
        modalEmployeeName.textContent = `Review Access for ${employee.employeeName}`;
        modalEmployeeDepartment.textContent = employee.department;
        modalEntitlementCount.textContent = employee.entitlements.filter(e => e.decision === 'pending').length;
        modalOverallComment.value = employee.overallComment || ''; // Load existing comment

        renderEntitlementsTable(employee.entitlements);
        updateModalDecisionSummary();
        renderEmployeeHistory(employee.employeeHistory);

        reviewDetailModal.classList.add('active');
    }

    function closeReviewDetailModal() {
        reviewDetailModal.classList.remove('active');
        currentEmployeeInModal = null; // Clear reference
        // Optional: Re-render main list if state might have changed (e.g., if a partial review was done)
        renderEmployeeReviews();
    }

    function renderEntitlementsTable(entitlements) {
        entitlementsTableBody.innerHTML = '';
        entitlements.forEach(entitlement => {
            const row = entitlementsTableBody.insertRow();
            row.dataset.entitlementId = entitlement.entitlementId;
            row.classList.add(`entitlement-status-${entitlement.decision}`);

            const riskClass = `risk-${entitlement.riskLevel.toLowerCase()}`;
            const statusBadgeClass = `entitlement-status-badge status-${entitlement.decision}`;

            // Determine if 'Show Details' should be initially active (e.g., if there's a comment)
            // Or if usage details are significant. For simplicity, just use comment for now.
            const detailsActive = entitlement.comment.trim() !== '';

            row.innerHTML = `
                <td>
                    <strong>${entitlement.application}</strong><br>
                    <small>${entitlement.entitlementName}</small>
                </td>
                <td>${new Date(entitlement.provisionedDate).toLocaleDateString()}</td>
                <td>${new Date(entitlement.dueDate).toLocaleDateString()}</td>
                <td><span class="badge ${riskClass}">${entitlement.riskLevel}</span></td>
                <td>
                    <button class="usage-justification-toggle" type="button" data-ent-id="${entitlement.entitlementId}">
                        ${detailsActive ? 'Hide Details' : 'Show Details'}
                    </button>
                    <div class="usage-justification-details ${detailsActive ? 'active' : ''}" id="details-${entitlement.entitlementId}">
                        <p><strong>Original Reason:</strong> ${entitlement.reasonForAccess || 'N/A'}</p>
                        <p><i class="fas fa-clock"></i> Last Login: ${entitlement.lastLogin || 'N/A'}</p>
                        <p><i class="fas fa-clock"></i> Last Activity: ${entitlement.lastActivity || 'N/A'}</p>
                        <p>Activity Freq: ${entitlement.activityFrequency || 'N/A'}</p>
                        <textarea class="entitlement-comment" placeholder="Add comment (optional for approve, required for deny)" data-ent-id="${entitlement.entitlementId}">${entitlement.comment}</textarea>
                    </div>
                </td>
                <td>
                    <div class="entitlement-action-btns">
                        <button class="btn btn-approve entitlement-approve-btn" data-ent-id="${entitlement.entitlementId}" ${entitlement.decision !== 'pending' ? 'disabled' : ''}>Approve</button>
                        <button class="btn btn-deny entitlement-deny-btn" data-ent-id="${entitlement.entitlementId}" ${entitlement.decision !== 'pending' ? 'disabled' : ''}>Deny</button>
                    </div>
                </td>
                <td><span class="${statusBadgeClass}">${entitlement.decision}</span></td>
            `;
        });
    }

    function updateModalDecisionSummary() {
        if (!currentEmployeeInModal) return;
        const total = currentEmployeeInModal.entitlements.length;
        const approved = currentEmployeeInModal.entitlements.filter(e => e.decision === 'approved').length;
        const denied = currentEmployeeInModal.entitlements.filter(e => e.decision === 'denied').length;
        const pending = total - approved - denied;
        modalDecisionSummary.textContent = `${approved} Approved, ${denied} Denied, ${pending} Pending (out of ${total})`;

        modalApproveAllBtn.disabled = pending === 0;
        modalDenyAllBtn.disabled = pending === 0;
        // The submit button is enabled only when all decisions are made OR if there are no pending entitlements
        modalSubmitReviewBtn.disabled = pending > 0;
    }

    function renderEmployeeHistory(history) {
        modalEmployeeHistory.innerHTML = '';
        if (history && history.length > 0) {
            history.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.innerHTML = `<strong>${item.reviewer}</strong> ${item.action} on ${new Date(item.date).toLocaleDateString()}. ${item.comment ? `"${item.comment}"` : ''}`;
                modalEmployeeHistory.appendChild(historyItem);
            });
        } else {
            modalEmployeeHistory.innerHTML = '<p style="font-size: 0.8em; color: var(--text-light);">No previous employee review history.</p>';
        }
    }


    modalCloseButton.addEventListener('click', closeReviewDetailModal);
    window.addEventListener('click', (event) => {
        if (event.target === reviewDetailModal) { // Clicked outside the modal content
            closeReviewDetailModal();
        }
    });

    // Event delegation for individual entitlement actions in modal
    entitlementsTableBody.addEventListener('click', (e) => {
        const entId = e.target.dataset.entId;
        if (!entId || !currentEmployeeInModal) return;

        const entitlement = currentEmployeeInModal.entitlements.find(e => e.entitlementId === entId);
        if (!entitlement) return;

        if (e.target.classList.contains('entitlement-approve-btn')) {
            entitlement.decision = 'approved';
            entitlement.comment = entitlementsTableBody.querySelector(`textarea[data-ent-id="${entId}"]`).value;
            showToast(`Entitlement ${entitlement.application} - ${entitlement.entitlementName} Approved`, 'success');
        } else if (e.target.classList.contains('entitlement-deny-btn')) {
            const commentInput = entitlementsTableBody.querySelector(`textarea[data-ent-id="${entId}"]`);
            if (!commentInput.value.trim()) {
                showToast('Please provide a comment for denying this entitlement.', 'warning');
                return;
            }
            entitlement.decision = 'denied';
            entitlement.comment = commentInput.value;
            showToast(`Entitlement ${entitlement.application} - ${entitlement.entitlementName} Denied`, 'danger');
        } else if (e.target.classList.contains('usage-justification-toggle')) {
            // FIX: This now correctly targets the associated details div
            const detailsDiv = document.getElementById(`details-${entId}`);
            detailsDiv.classList.toggle('active');
            e.target.textContent = detailsDiv.classList.contains('active') ? 'Hide Details' : 'Show Details';
            return; // Important: Stop further processing to avoid re-rendering the table unnecessarily
        }

        // Re-render table and update summary to reflect changes
        renderEntitlementsTable(currentEmployeeInModal.entitlements);
        updateModalDecisionSummary();
    });

    // Bulk actions within the modal
    modalApproveAllBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;
        currentEmployeeInModal.entitlements.forEach(ent => {
            if (ent.decision === 'pending') {
                ent.decision = 'approved';
                ent.comment = 'Approved as part of "Approve All" action.';
            }
        });
        renderEntitlementsTable(currentEmployeeInModal.entitlements);
        updateModalDecisionSummary();
        showToast(`All pending entitlements for ${currentEmployeeInModal.employeeName} approved!`, 'success');
    });

    modalDenyAllBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;
        const comment = prompt('Please provide a mandatory reason for denying all pending entitlements:');
        if (comment !== null && comment.trim() !== '') {
            currentEmployeeInModal.entitlements.forEach(ent => {
                if (ent.decision === 'pending') {
                    ent.decision = 'denied';
                    ent.comment = comment;
                }
            });
            renderEntitlementsTable(currentEmployeeInModal.entitlements);
            updateModalDecisionSummary();
            showToast(`All pending entitlements for ${currentEmployeeInModal.employeeName} denied!`, 'danger');
        } else if (comment === '') {
            showToast('Bulk denial requires a reason.', 'warning');
        }
    });

    // Submit overall review decision
    modalSubmitReviewBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;

        // Check if all entitlements have been decided
        const pendingCount = currentEmployeeInModal.entitlements.filter(e => e.decision === 'pending').length;
        if (pendingCount > 0) {
            showToast(`Please make a decision for all ${pendingCount} pending entitlements before submitting.`, 'warning');
            return;
        }

        currentEmployeeInModal.overallComment = modalOverallComment.value;

        // In a real application, you'd send this data to a backend API
        console.log(`Submitting review for ${currentEmployeeInModal.employeeName}:`, currentEmployeeInModal);

        // Simulate successful submission by removing employee from pending list
        // Filter out the employee if all their entitlements are decided
        employeeReviewsData = employeeReviewsData.filter(emp =>
            emp.employeeId !== currentEmployeeInModal.employeeId ||
            emp.entitlements.some(e => e.decision === 'pending') // Keep if any entitlements are still pending
        );

        showToast(`Review for ${currentEmployeeInModal.employeeName} submitted successfully!`, 'success');

        closeReviewDetailModal();
        renderEmployeeReviews(); // Re-render the main list
        updateBulkActionsBar();
    });

    modalRequestMoreInfoBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;
        const comment = modalOverallComment.value.trim();
        if (!comment) {
            showToast('Please add a comment explaining what information is needed.', 'warning');
            return;
        }
        showToast(`Information requested for ${currentEmployeeInModal.employeeName}.`, 'info');
        // In a real app, send request to backend, keep employee in list
        closeReviewDetailModal();
    });


    // --- Toast Notification (Simple) ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        let iconClass = '';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        else if (type === 'danger') iconClass = 'fas fa-times-circle';
        else if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
        else iconClass = 'fas fa-info-circle';

        toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    // --- Filtering and Search ---
    reviewSearchInput.addEventListener('input', renderEmployeeReviews);
    filterDueDate.addEventListener('change', renderEmployeeReviews);
    filterApplication.addEventListener('change', renderEmployeeReviews);
    filterRiskLevel.addEventListener('change', renderEmployeeReviews);
    filterDepartment.addEventListener('change', renderEmployeeReviews);

    // --- Bulk Actions ---
    function updateBulkActionsBar() {
        const selectedEmployees = employeeReviewsData.filter(employee => employee.isSelected);
        if (selectedEmployees.length > 0) {
            selectedCountSpan.textContent = selectedEmployees.length;
            bulkActionsBar.classList.add('active');
        } else {
            bulkActionsBar.classList.remove('active');
        }
    }

    bulkApproveBtn.addEventListener('click', () => {
        const selectedEmployeeIds = employeeReviewsData.filter(emp => emp.isSelected).map(emp => emp.employeeId);
        if (selectedEmployeeIds.length === 0) {
            showToast('No employees selected for bulk approval.', 'warning');
            return;
        }
        if (confirm(`Are you sure you want to approve ALL pending entitlements for ${selectedEmployeeIds.length} selected employees?`)) {
            selectedEmployeeIds.forEach(id => {
                const employeeIndex = employeeReviewsData.findIndex(emp => emp.employeeId === id);
                if (employeeIndex !== -1) {
                    const employee = employeeReviewsData[employeeIndex];
                    employee.entitlements.forEach(ent => {
                        if (ent.decision === 'pending') {
                            ent.decision = 'approved';
                            ent.comment = 'Approved via bulk action.';
                        }
                    });
                    employee.overallComment = 'All entitlements approved via bulk action.';
                    showToast(`All entitlements for ${employee.employeeName} approved!`, 'success');
                    // Mark as not selected after processing
                    employee.isSelected = false;
                }
            });
            // Filter out employees who no longer have pending entitlements
            employeeReviewsData = employeeReviewsData.filter(emp => emp.entitlements.some(e => e.decision === 'pending'));
            renderEmployeeReviews();
            updateBulkActionsBar();
        }
    });

    bulkDenyBtn.addEventListener('click', () => {
        const selectedEmployeeIds = employeeReviewsData.filter(emp => emp.isSelected).map(emp => emp.employeeId);
        if (selectedEmployeeIds.length === 0) {
            showToast('No employees selected for bulk denial.', 'warning');
            return;
        }
        const comment = prompt(`Are you sure you want to deny ALL pending entitlements for ${selectedEmployeeIds.length} selected employees? Please provide a mandatory reason for bulk denial:`);
        if (comment !== null && comment.trim() !== '') {
            selectedEmployeeIds.forEach(id => {
                const employeeIndex = employeeReviewsData.findIndex(emp => emp.employeeId === id);
                if (employeeIndex !== -1) {
                    const employee = employeeReviewsData[employeeIndex];
                    employee.entitlements.forEach(ent => {
                        if (ent.decision === 'pending') {
                            ent.decision = 'denied';
                            ent.comment = comment;
                        }
                    });
                    employee.overallComment = `All entitlements denied via bulk action: ${comment}`;
                    showToast(`All entitlements for ${employee.employeeName} denied!`, 'danger');
                    // Mark as not selected after processing
                    employee.isSelected = false;
                }
            });
            // Filter out employees who no longer have pending entitlements
            employeeReviewsData = employeeReviewsData.filter(emp => emp.entitlements.some(e => e.decision === 'pending'));
            renderEmployeeReviews();
            updateBulkActionsBar();
        } else if (comment === '') {
            showToast('Bulk denial requires a reason.', 'warning');
        }
    });

    // --- Helper for Risk Level Class ---
    function getRiskLevelClass(riskLevel) {
        switch (riskLevel.toLowerCase()) {
            case 'high': return 'risk-high';
            case 'medium': return 'risk-medium';
            case 'low': return 'risk-low';
            default: return '';
        }
    }

    // --- Helper for Status Class (Due Soon/Overdue) ---
    function getStatusClass(dueDateString, today) {
        const reviewDueDate = new Date(dueDateString);
        reviewDueDate.setHours(0, 0, 0, 0);

        if (reviewDueDate < today) {
            return 'status-overdue';
        }

        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999);

        if (reviewDueDate <= threeDaysFromNow) {
            return 'status-due-soon';
        }
        return 'status-pending'; // Default status for non-urgent
    }


    // --- Mobile Filter Toggle ---
    filterToggleButton.addEventListener('click', () => {
        filtersBar.classList.toggle('filters-expanded');
    });

    // Initial render of pending employee reviews
    renderEmployeeReviews();
    updateBulkActionsBar();
});