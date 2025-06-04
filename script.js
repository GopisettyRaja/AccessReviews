document.addEventListener('DOMContentLoaded', () => {
    // ... (existing variable declarations) ...

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
    const bulkDenyBtn = document.getElementById('bulkDenyBtn');
    const selectAllEmployeesCheckbox = document.getElementById('selectAllEmployeesCheckbox');
    const filterToggleButton = document.querySelector('.filter-toggle-btn');
    const filtersBar = document.querySelector('.filters-bar');

    const loadingIndicator = document.getElementById('loadingIndicator');
    const noMoreReviewsMessage = document.getElementById('noMoreReviewsMessage');
    const pageContent = document.querySelector('.page-content'); // This is the scrollable element

    const toastContainer = document.getElementById('toastContainer');

    // --- NEW: Confirmation Modal Elements ---
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationTitle = document.getElementById('confirmationTitle');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmActionButton = document.getElementById('confirmActionButton');
    const cancelActionButton = document.getElementById('cancelActionButton');
    const confirmCloseButton = confirmationModal.querySelector('.close-button');

    // --- NEW: Variables to store context for confirmation ---
    let pendingConfirmationAction = null; // Stores the function to call on confirmation
    let pendingConfirmationData = null; // Stores data needed by the function


    // Mock Data - Now Employee-centric (More data for better lazy load demo)
    let employeeReviewsData = [];
    // Generate 50 dummy employees for lazy loading demonstration
    for (let i = 1; i <= 50; i++) {
        const employeeName = `Employee ${i} ${String.fromCharCode(65 + (i % 26))}`; // e.g., Employee 1 A, Employee 2 B
        const departmentOptions = ['Sales', 'Engineering', 'HR', 'Finance', 'IT', 'Marketing', 'Operations'];
        const department = departmentOptions[i % departmentOptions.length];
        const riskLevelOptions = ['Low', 'Medium', 'High'];
        const riskLevel = riskLevelOptions[i % riskLevelOptions.length];

        const entitlementsCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 entitlements per employee
        const entitlements = [];
        for (let j = 1; j <= entitlementsCount; j++) {
            const appOptions = ['SalesForce', 'Jira', 'HRIS', 'Confluence', 'Corporate VPN', 'SAP ERP', 'GitHub Enterprise', 'Zoom', 'MS Teams', 'Adobe Creative Cloud'];
            const app = appOptions[Math.floor(Math.random() * appOptions.length)];
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) - 30); // Due date +/- 30 days
            const provisionedDate = new Date(dueDate);
            provisionedDate.setDate(provisionedDate.getDate() - Math.floor(Math.random() * 365)); // Provisioned earlier

            entitlements.push({
                entitlementId: `ent${String(i).padStart(3, '0')}${String.fromCharCode(96 + j)}`,
                application: app,
                entitlementName: `${app} Access ${j}`,
                reasonForAccess: `Standard access for ${employeeName} in ${department}.`,
                provisionedDate: provisionedDate.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                riskLevel: riskLevelOptions[Math.floor(Math.random() * riskLevelOptions.length)],
                lastLogin: `2025-05-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 09:00 AM`,
                lastActivity: `2025-05-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 09:30 AM`,
                activityFrequency: ['Daily', 'Weekly', 'Infrequent'][Math.floor(Math.random() * 3)],
                decision: 'pending',
                comment: ''
            });
        }

        employeeReviewsData.push({
            employeeId: `emp${String(i).padStart(3, '0')}`,
            employeeName: employeeName,
            department: department,
            employeeHistory: i % 5 === 0 ? [{ reviewer: 'System', action: 'Previous Access Review', date: '2024-11-15', comment: 'All good.' }] : [],
            entitlements: entitlements,
            isSelected: false, // Initialize selection state for each employee
            overallComment: ''
        });
    }


    // Lazy Loading State Variables
    let currentFilteredEmployees = []; // Employees that match filters/search
    let displayedEmployees = []; // Employees currently shown on UI
    const itemsPerPage = 6; // Number of cards to load at a time
    let currentPage = 0;
    let isLoading = false;
    let hasMoreData = true;

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
                resetLazyLoadState(); // Reset state when navigating to pending reviews
                applyFiltersAndLoadEmployees(); // Initial load for this page
                pageContent.addEventListener('scroll', handleScroll); // Attach scroll listener
            } else {
                pageContent.removeEventListener('scroll', handleScroll); // Remove scroll listener
            }
        });
    });

    // --- Lazy Loading & Filtering Logic ---

    // Resets the lazy load state (used when filters/search change or navigating to the page)
    function resetLazyLoadState() {
        currentPage = 0;
        displayedEmployees = [];
        employeeReviewList.innerHTML = ''; // Clear existing cards
        hasMoreData = true;
        loadingIndicator.classList.remove('active'); // Hide spinner
        noMoreReviewsMessage.style.display = 'none';
        // Do NOT reset selectAllEmployeesCheckbox.checked here,
        // updateSelectAllCheckboxState will correctly set its state based on filtered employees.
        selectAllEmployeesCheckbox.indeterminate = false; // Reset indeterminate
        updateBulkActionsBar(); // Update bulk actions bar
        isLoading = false; // IMPORTANT: Ensure isLoading is false for a fresh load
    }

    // Applies filters/search to the main data and prepares for lazy loading
    function applyFiltersAndLoadEmployees() {
        const searchTerm = reviewSearchInput.value.toLowerCase();
        const selectedDueDateFilter = filterDueDate.value;
        const selectedApplicationFilter = filterApplication.value;
        const selectedRiskLevelFilter = filterRiskLevel.value;
        const selectedDepartmentFilter = filterDepartment.value;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        // Filter the main employee data based on current criteria
        currentFilteredEmployees = employeeReviewsData.filter(employee => {
            // Only consider employees with at least one pending entitlement
            const hasPendingEntitlements = employee.entitlements.some(e => e.decision === 'pending');
            if (!hasPendingEntitlements) return false;

            const matchesSearch = employee.employeeName.toLowerCase().includes(searchTerm) ||
                employee.entitlements.some(e => e.application.toLowerCase().includes(searchTerm) || e.entitlementName.toLowerCase().includes(searchTerm));

            let matchesDueDate = true;
            if (selectedDueDateFilter !== '') {
                const pendingEntitlements = employee.entitlements.filter(e => e.decision === 'pending');
                const earliestDueDate = pendingEntitlements.length > 0
                    ? pendingEntitlements.reduce((minDate, ent) => {
                        const entDueDate = new Date(ent.dueDate);
                        return entDueDate < minDate ? entDueDate : minDate;
                    }, new Date('2099-12-31'))
                    : null;

                if (!earliestDueDate) matchesDueDate = false;
                else {
                    earliestDueDate.setHours(0, 0, 0, 0);
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

        // After filtering, reset lazy load state and load the first batch
        resetLazyLoadState();
        loadMoreEmployees();
    }

    // Appends the next batch of employees to the UI
    function loadMoreEmployees() {
        if (!hasMoreData || isLoading) return;

        isLoading = true;
        loadingIndicator.classList.add('active'); // Show spinner
        noMoreReviewsMessage.style.display = 'none'; // Hide "No more reviews" when loading

        // Simulate network delay
        setTimeout(() => {
            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const nextBatch = currentFilteredEmployees.slice(startIndex, endIndex);

            if (nextBatch.length === 0) {
                hasMoreData = false;
                loadingIndicator.classList.remove('active');
                if (displayedEmployees.length === 0) {
                    employeeReviewList.innerHTML = '<p class="no-reviews-message">No pending employee reviews found matching your criteria.</p>';
                } else {
                    noMoreReviewsMessage.style.display = 'block'; // Show if no more data
                }
                isLoading = false;
                updateSelectAllCheckboxState(); // Update select all checkbox based on filtered data
                return;
            }

            nextBatch.forEach(employee => {
                displayedEmployees.push(employee); // Add to currently displayed list
                const cardWrapper = document.createElement('div');
                cardWrapper.classList.add('employee-review-card-wrapper');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('employee-review-card-checkbox');
                // Crucially, checkbox state reflects the employee's current isSelected state
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
                    const statusClass = getStatusClass(earliestDueDate.toISOString().split('T')[0], todayForStatus);
                    if (statusClass === 'status-overdue') employeeStatus = 'Overdue';
                    else if (statusClass === 'status-due-soon') employeeStatus = 'Due Soon';
                    else employeeStatus = 'Pending';
                } else {
                    employeeStatus = 'No Pending';
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

            currentPage++;
            isLoading = false;
            loadingIndicator.classList.remove('active');
            updateBulkActionsBar(); // Update bulk actions bar based on newly loaded items
            updateSelectAllCheckboxState(); // Update select all checkbox
        }, 500); // Simulate API call delay
    }

    // Scroll event handler for lazy loading
    function handleScroll() {
        // Only trigger if on the pending reviews page
        if (!document.getElementById('pending-reviews-page').classList.contains('active')) {
            return;
        }

        const scrollThreshold = 100; // Pixels from bottom to trigger load
        if (pageContent.scrollTop + pageContent.clientHeight >= pageContent.scrollHeight - scrollThreshold) {
            loadMoreEmployees();
        }
    }


    // --- Quick Approve All function for individual card button ---
    function handleQuickApproveAllAction(employeeId) {
        const employee = employeeReviewsData.find(emp => emp.employeeId === employeeId);

        if (!employee) {
            console.error('Employee not found for quick approve:', employeeId);
            showToast('Error: Employee not found.', 'danger');
            return;
        }

        const hasPending = employee.entitlements.some(ent => ent.decision === 'pending');
        if (!hasPending) {
            showToast('No pending entitlements for this employee.', 'info');
            return;
        }

        // Show enterprise-grade confirmation modal
        showConfirmation(
            'Confirm Quick Approval',
            `Are you sure you want to quick approve ALL pending entitlements for <strong>${employee.employeeName}</strong>?`,
            () => {
                // This code runs if the user clicks 'Confirm'
                employee.entitlements.forEach(ent => {
                    if (ent.decision === 'pending') {
                        ent.decision = 'approved';
                        ent.comment = 'Approved via Quick Approve All button.';
                    }
                });
                employee.overallComment = 'All entitlements quick approved.'; // Set overall comment

                // Filter out employee from the original dataset if no more pending reviews
                // This ensures they won't appear in the filtered list anymore.
                employeeReviewsData = employeeReviewsData.filter(emp =>
                    emp.employeeId !== employee.employeeId || emp.entitlements.some(e => e.decision === 'pending')
                );

                showToast(`All pending entitlements for ${employee.employeeName} approved!`, 'success');

                // Re-render the list to reflect the changes (removes the card if no pending entitlements left)
                applyFiltersAndLoadEmployees();
            },
            'Approve' // Text for the confirm button
        );
    }


    // --- Event Delegation for Employee Review Card Actions ---
    employeeReviewList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        // Find employee in the original data to modify
        const employee = employeeReviewsData.find(emp => emp.employeeId === id);
        if (!employee) return;

        if (e.target.classList.contains('view-details-btn')) {
            openEmployeeReviewDetailModal(employee);
        } else if (e.target.classList.contains('quick-approve-btn')) {
            handleQuickApproveAllAction(employee.employeeId); // Calls the function that triggers the new confirmation
        }
    });

    employeeReviewList.addEventListener('change', (e) => {
        if (e.target.classList.contains('employee-review-card-checkbox')) {
            const id = e.target.dataset.id;
            // Update the isSelected property in the original employeeReviewsData
            const employee = employeeReviewsData.find(emp => emp.employeeId === id);
            if (employee) {
                employee.isSelected = e.target.checked;
                updateBulkActionsBar();
                updateSelectAllCheckboxState(); // Update select all checkbox state when individual changes
            }
        }
    });

    // --- Modal Logic for Employee Review ---
    function openEmployeeReviewDetailModal(employee) {
        currentEmployeeInModal = employee;
        modalEmployeeName.textContent = `Review Access for ${employee.employeeName}`;
        modalEmployeeDepartment.textContent = employee.department;
        modalEntitlementCount.textContent = employee.entitlements.filter(e => e.decision === 'pending').length;
        modalOverallComment.value = employee.overallComment || '';

        renderEntitlementsTable(employee.entitlements);
        updateModalDecisionSummary();
        renderEmployeeHistory(employee.employeeHistory);

        reviewDetailModal.classList.add('active');
    }

    function closeReviewDetailModal() {
        reviewDetailModal.classList.remove('active');
        currentEmployeeInModal = null; // Clear reference
        applyFiltersAndLoadEmployees(); // Re-apply filters and re-load data (resets lazy load)
    }

    function renderEntitlementsTable(entitlements) {
        entitlementsTableBody.innerHTML = '';
        entitlements.forEach(entitlement => {
            const row = entitlementsTableBody.insertRow();
            row.dataset.entitlementId = entitlement.entitlementId;
            row.classList.add(`entitlement-status-${entitlement.decision}`);

            const riskClass = `risk-${entitlement.riskLevel.toLowerCase()}`;
            const statusBadgeClass = `entitlement-status-badge status-${entitlement.decision}`;

            const detailsActive = entitlement.comment.trim() !== ''; // Keep details open if there's a comment

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

    // Event listener for modal close button
    modalCloseButton.addEventListener('click', closeReviewDetailModal);
    // Event listener for clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === reviewDetailModal) {
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
            const detailsDiv = document.getElementById(`details-${entId}`);
            detailsDiv.classList.toggle('active');
            e.target.textContent = detailsDiv.classList.contains('active') ? 'Hide Details' : 'Show Details';
            return; // Exit function after toggling to avoid re-rendering
        }

        // Re-render table and update summary to reflect changes
        renderEntitlementsTable(currentEmployeeInModal.entitlements);
        updateModalDecisionSummary();
    });

    // Bulk actions within the modal (These already use simple prompts, will leave for now or can convert later)
    modalApproveAllBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;

        // Use custom confirmation for modal bulk approve
        showConfirmation(
            'Confirm Approve All',
            `Are you sure you want to approve ALL pending entitlements for <strong>${currentEmployeeInModal.employeeName}</strong>?`,
            () => {
                currentEmployeeInModal.entitlements.forEach(ent => {
                    if (ent.decision === 'pending') {
                        ent.decision = 'approved';
                        ent.comment = 'Approved as part of "Approve All" action.';
                    }
                });
                renderEntitlementsTable(currentEmployeeInModal.entitlements);
                updateModalDecisionSummary();
                showToast(`All pending entitlements for ${currentEmployeeInModal.employeeName} approved!`, 'success');
            },
            'Approve All'
        );
    });

    modalDenyAllBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;

        // For denial, we still need a way to get the comment.
        // A simple prompt is okay here for now, or we could extend the custom modal
        // to include an input field, which is a more complex enhancement.
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

        const pendingCount = currentEmployeeInModal.entitlements.filter(e => e.decision === 'pending').length;
        if (pendingCount > 0) {
            showToast(`Please make a decision for all ${pendingCount} pending entitlements before submitting.`, 'warning');
            return;
        }

        // Use custom confirmation for submitting overall review
        showConfirmation(
            'Confirm Review Submission',
            `Are you sure you want to submit the review for <strong>${currentEmployeeInModal.employeeName}</strong>?`,
            () => {
                currentEmployeeInModal.overallComment = modalOverallComment.value;

                // Simulate successful submission by filtering out processed employee
                employeeReviewsData = employeeReviewsData.filter(emp =>
                    emp.employeeId !== currentEmployeeInModal.employeeId ||
                    emp.entitlements.some(e => e.decision === 'pending')
                );

                showToast(`Review for ${currentEmployeeInModal.employeeName} submitted successfully!`, 'success');

                closeReviewDetailModal(); // This will re-render the list
            },
            'Submit Review'
        );
    });

    modalRequestMoreInfoBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;
        const comment = modalOverallComment.value.trim();
        if (!comment) {
            showToast('Please add a comment explaining what information is needed.', 'warning');
            return;
        }
        showToast(`Information requested for ${currentEmployeeInModal.employeeName}.`, 'info');
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
    // These now trigger a reset of lazy load state and re-application of filters
    reviewSearchInput.addEventListener('input', () => {
        applyFiltersAndLoadEmployees();
    });
    filterDueDate.addEventListener('change', () => {
        applyFiltersAndLoadEmployees();
    });
    filterApplication.addEventListener('change', () => {
        applyFiltersAndLoadEmployees();
    });
    filterRiskLevel.addEventListener('change', () => {
        applyFiltersAndLoadEmployees();
    });
    filterDepartment.addEventListener('change', () => {
        applyFiltersAndLoadEmployees();
    });

    // --- Select All Employees Feature ---
    selectAllEmployeesCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        // Apply selection to ALL currently filtered employees in the data source
        currentFilteredEmployees.forEach(employee => {
            employee.isSelected = isChecked;
        });

        // Update UI checkboxes for currently displayed employees
        // This is necessary because currentFilteredEmployees might contain more than displayedEmployees
        const visibleCheckboxes = employeeReviewList.querySelectorAll('.employee-review-card-checkbox');
        visibleCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });

        updateBulkActionsBar();
        updateSelectAllCheckboxState(); // Ensure the "select all" checkbox state is immediately updated
    });

    function updateSelectAllCheckboxState() {
        const totalFilteredCount = currentFilteredEmployees.length;
        // Count only those selected employees that still have pending entitlements,
        // as they are the ones relevant for bulk actions.
        const selectedFilteredCount = currentFilteredEmployees.filter(emp => emp.isSelected && emp.entitlements.some(e => e.decision === 'pending')).length;

        if (totalFilteredCount === 0) {
            selectAllEmployeesCheckbox.checked = false;
            selectAllEmployeesCheckbox.indeterminate = false;
            return;
        }

        if (selectedFilteredCount === totalFilteredCount) {
            selectAllEmployeesCheckbox.checked = true;
            selectAllEmployeesCheckbox.indeterminate = false;
        } else if (selectedFilteredCount > 0) {
            // Some, but not all, are selected
            selectAllEmployeesCheckbox.checked = false;
            selectAllEmployeesCheckbox.indeterminate = true;
        } else {
            // None are selected
            selectAllEmployeesCheckbox.checked = false;
            selectAllEmployeesCheckbox.indeterminate = false;
        }
    }


    // --- Bulk Actions ---
    function updateBulkActionsBar() {
        // Count selected employees from the CURRENTLY FILTERED data source
        // This ensures the count reflects all selected employees that match current filters,
        // even if not all are currently visible.
        const selectedEmployeesCount = currentFilteredEmployees.filter(employee => employee.isSelected && employee.entitlements.some(e => e.decision === 'pending')).length;
        if (selectedEmployeesCount > 0) {
            selectedCountSpan.textContent = selectedEmployeesCount;
            bulkActionsBar.classList.add('active');
        } else {
            selectedCountSpan.textContent = 0;
            bulkActionsBar.classList.remove('active');
        }
    }

    bulkApproveBtn.addEventListener('click', () => {
        const selectedEmployeesToProcess = currentFilteredEmployees.filter(emp => emp.isSelected && emp.entitlements.some(e => e.decision === 'pending'));
        if (selectedEmployeesToProcess.length === 0) {
            showToast('No employees selected for bulk approval or no pending entitlements for selected.', 'warning');
            return;
        }

        // Use custom confirmation for bulk approve
        showConfirmation(
            'Confirm Bulk Approval',
            `Are you sure you want to approve ALL pending entitlements for <strong>${selectedEmployeesToProcess.length}</strong> selected employees?`,
            () => {
                selectedEmployeesToProcess.forEach(employee => {
                    employee.entitlements.forEach(ent => {
                        if (ent.decision === 'pending') {
                            ent.decision = 'approved';
                            ent.comment = 'Approved via bulk action.';
                        }
                    });
                    employee.overallComment = 'All entitlements approved via bulk action.';
                    showToast(`All entitlements for ${employee.employeeName} approved!`, 'success');
                    employee.isSelected = false; // Deselect after processing
                });
                // After bulk action, re-filter and re-load to reflect changes
                applyFiltersAndLoadEmployees();
                updateBulkActionsBar(); // Update after render
                updateSelectAllCheckboxState(); // Update select all checkbox state
            },
            'Approve Selected'
        );
    });

    bulkDenyBtn.addEventListener('click', () => {
        const selectedEmployeesToProcess = currentFilteredEmployees.filter(emp => emp.isSelected && emp.entitlements.some(e => e.decision === 'pending'));
        if (selectedEmployeesToProcess.length === 0) {
            showToast('No employees selected for bulk denial or no pending entitlements for selected.', 'warning');
            return;
        }

        // For bulk denial, we need to prompt for a reason.
        // This custom confirmation doesn't currently support an input field.
        // For a true enterprise-grade solution, you'd extend the confirmation modal
        // to include a text area for comments, or use a separate, dedicated "Deny Reason" modal.
        // For now, we'll use a basic prompt here, acknowledging this is an area for further enhancement.
        const comment = prompt(`Are you sure you want to deny ALL pending entitlements for ${selectedEmployeesToProcess.length} selected employees? Please provide a mandatory reason for bulk denial:`);
        if (comment !== null && comment.trim() !== '') {
            selectedEmployeesToProcess.forEach(employee => {
                employee.entitlements.forEach(ent => {
                    if (ent.decision === 'pending') {
                        ent.decision = 'denied';
                        ent.comment = comment;
                    }
                });
                employee.overallComment = `All entitlements denied via bulk action: ${comment}`;
                showToast(`All entitlements for ${employee.employeeName} denied!`, 'danger');
                employee.isSelected = false; // Deselect after processing
            });
            // After bulk action, re-filter and re-load to reflect changes
            applyFiltersAndLoadEmployees();
            updateBulkActionsBar(); // Update after render
            updateSelectAllCheckboxState(); // Update select all checkbox state
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

    // --- NEW: Enterprise-Grade Confirmation Modal Functions ---
    function showConfirmation(title, message, onConfirmCallback, confirmBtnText = 'Confirm') {
        confirmationTitle.innerHTML = title;
        confirmationMessage.innerHTML = message;
        confirmActionButton.textContent = confirmBtnText;
        // Optionally change button class based on action type (e.g., btn-deny for denial)
        confirmActionButton.classList.remove('btn-deny'); // Ensure previous class is removed
        if (confirmBtnText.toLowerCase().includes('deny')) {
            confirmActionButton.classList.add('btn-deny');
        } else {
            confirmActionButton.classList.add('btn-approve');
        }

        pendingConfirmationAction = onConfirmCallback; // Store the callback
        confirmationModal.classList.add('active'); // Show the modal
    }

    function hideConfirmation() {
        confirmationModal.classList.remove('active'); // Hide the modal
        pendingConfirmationAction = null; // Clear the callback
        pendingConfirmationData = null; // Clear any stored data
    }

    // Add event listeners for the new confirmation modal buttons
    confirmActionButton.addEventListener('click', () => {
        if (pendingConfirmationAction) {
            pendingConfirmationAction(pendingConfirmationData); // Execute the stored callback
        }
        hideConfirmation();
    });

    cancelActionButton.addEventListener('click', hideConfirmation);
    confirmCloseButton.addEventListener('click', hideConfirmation);
    // Close modal if user clicks outside of modal content
    window.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
            hideConfirmation();
        }
    });

    // Current setup: Dashboard is default. When user clicks "Pending Reviews", the logic above handles it.
});