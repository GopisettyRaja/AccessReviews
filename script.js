document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('.sidebar nav ul li a'); // Check this selector carefully with your HTML
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
    const modalApproveAllBtn = document.getElementById('modalApproveAllBtn'); // This is now "Approve All Low Risk"
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
    const sortEmployees = document.getElementById('sortEmployees'); // NEW: Sort dropdown
    let currentSortOrder = 'name-asc'; // Default sort order

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

    // Confirmation Modal Elements
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationTitle = document.getElementById('confirmationTitle');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmActionButton = document.getElementById('confirmActionButton');
    const cancelActionButton = document.getElementById('cancelActionButton');
    const confirmCloseButton = confirmationModal.querySelector('.close-button');

    // Prompt Modal Elements (for denial comments)
    const promptModal = document.getElementById('promptModal');
    const promptTitle = document.getElementById('promptTitle');
    const promptMessage = document.getElementById('promptMessage');
    const promptInput = document.getElementById('promptInput');
    const promptConfirmButton = document.getElementById('promptConfirmButton');
    const promptCancelButton = document.getElementById('promptCancelButton');
    const promptCloseButton = promptModal.querySelector('.close-button');

    // Variables to store context for confirmation and prompt
    let pendingConfirmationAction = null; // Stores the function to call on confirmation
    let pendingConfirmationData = null; // Stores data needed by the function
    let pendingPromptAction = null; // Stores the function to call with prompt input

    // --- Mock Data ---
    let employeeReviewsData = [];
    // Generate 50 dummy employees for lazy loading demonstration
    for (let i = 1; i <= 50; i++) {
        const employeeName = `Employee ${i} ${String.fromCharCode(65 + (i % 26))}`;
        const departmentOptions = ['Sales', 'Engineering', 'HR', 'Finance', 'IT', 'Marketing', 'Operations'];
        const department = departmentOptions[i % departmentOptions.length];
        const riskLevelOptions = ['Low', 'Medium', 'High'];

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
                reasonForAccess: `Standard access for ${employeeName} in ${department}. This is a more detailed reason for access that might need to be hidden sometimes.`,
                provisionedDate: provisionedDate.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                riskLevel: riskLevelOptions[Math.floor(Math.random() * riskLevelOptions.length)],
                lastLogin: `2025-05-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 09:00 AM`,
                lastActivity: `2025-05-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 09:30 AM`,
                activityFrequency: ['Daily', 'Weekly', 'Infrequent', 'Never Used'][Math.floor(Math.random() * 4)],
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

    // --- NEW: Function to populate dynamic filter options ---
    function populateFilterOptions() {
        const applications = new Set();
        const departments = new Set();

        employeeReviewsData.forEach(employee => {
            departments.add(employee.department);
            employee.entitlements.forEach(ent => {
                applications.add(ent.application);
            });
        });

        // Populate Application filter
        filterApplication.innerHTML = '<option value="">All Applications</option>';
        Array.from(applications).sort().forEach(app => {
            const option = document.createElement('option');
            option.value = app;
            option.textContent = app;
            filterApplication.appendChild(option);
        });

        // Populate Department filter
        filterDepartment.innerHTML = '<option value="">All Departments</option>';
        Array.from(departments).sort().forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            filterDepartment.appendChild(option);
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
    // IMPORTANT: Check your HTML for the .sidebar nav ul li a structure if this isn't working
    console.log("Nav Links found:", navLinks); // Debugging: Check if elements are found
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
                populateFilterOptions(); // Populate filters when navigating to this page
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
        let tempFilteredEmployees = employeeReviewsData.filter(employee => {
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

        // Apply Sorting
        currentFilteredEmployees = sortEmployeesData(tempFilteredEmployees, currentSortOrder);

        // After filtering and sorting, reset lazy load state and load the first batch
        resetLazyLoadState();
        loadMoreEmployees();
    }

    // --- NEW: Sort Function ---
    function sortEmployeesData(employees, sortOrder) {
        return employees.sort((a, b) => {
            const getEarliestDueDate = (emp) => {
                const pending = emp.entitlements.filter(e => e.decision === 'pending');
                return pending.length > 0 ? new Date(pending.reduce((min, ent) => ent.dueDate < min ? ent.dueDate : min, '2099-12-31')) : null;
            };

            const getPendingEntitlementCount = (emp) => {
                return emp.entitlements.filter(e => e.decision === 'pending').length;
            };

            switch (sortOrder) {
                case 'name-asc':
                    return a.employeeName.localeCompare(b.employeeName);
                case 'name-desc':
                    return b.employeeName.localeCompare(a.employeeName);
                case 'due-date-asc':
                    const dateA_asc = getEarliestDueDate(a);
                    const dateB_asc = getEarliestDueDate(b);
                    if (!dateA_asc) return 1; // null dates go to end
                    if (!dateB_asc) return -1;
                    return dateA_asc - dateB_asc;
                case 'due-date-desc':
                    const dateA_desc = getEarliestDueDate(a);
                    const dateB_desc = getEarliestDueDate(b);
                    if (!dateA_desc) return 1; // null dates go to end
                    if (!dateB_desc) return -1;
                    return dateB_desc - dateA_desc;
                case 'department-asc':
                    return a.department.localeCompare(b.department);
                case 'department-desc':
                    return b.department.localeCompare(a.department);
                case 'pending-entitlements-asc':
                    return getPendingEntitlementCount(a) - getPendingEntitlementCount(b);
                case 'pending-entitlements-desc':
                    return getPendingEntitlementCount(b) - getPendingEntitlementCount(a);
                default:
                    return 0;
            }
        });
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
                // Only allow selection if the employee still has pending entitlements
                checkbox.checked = employee.isSelected && employee.entitlements.some(e => e.decision === 'pending');
                checkbox.disabled = !employee.entitlements.some(e => e.decision === 'pending'); // Disable if no pending
                checkbox.dataset.id = employee.employeeId;
                cardWrapper.appendChild(checkbox);

                const card = document.createElement('div');
                card.classList.add('employee-review-card');
                card.dataset.id = employee.employeeId;

                // Determine overall status and due date for the employee card
                let employeeStatus = 'Pending';
                let earliestDueDate = null;
                let highestRisk = 'Low'; // Track highest risk among pending entitlements
                let pendingEntitlementCount = 0; // For progress indicator

                employee.entitlements.filter(e => e.decision === 'pending').forEach(entitlement => {
                    pendingEntitlementCount++;
                    const entDueDate = new Date(entitlement.dueDate);
                    if (!earliestDueDate || entDueDate < earliestDueDate) {
                        earliestDueDate = entDueDate;
                    }
                    const riskOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                    if (riskOrder[entitlement.riskLevel.toLowerCase()] > riskOrder[highestRisk.toLowerCase()]) {
                        highestRisk = entitlement.riskLevel;
                    }
                });

                if (pendingEntitlementCount === 0) {
                    employeeStatus = 'Completed'; // All entitlements reviewed
                } else if (earliestDueDate) {
                    const todayForStatus = new Date();
                    todayForStatus.setHours(0, 0, 0, 0);
                    const statusClass = getStatusClass(earliestDueDate.toISOString().split('T')[0], todayForStatus);
                    if (statusClass === 'status-overdue') employeeStatus = 'Overdue';
                    else if (statusClass === 'status-due-soon') employeeStatus = 'Due Soon';
                    else employeeStatus = 'Pending';
                } else {
                    employeeStatus = 'N/A'; // Should not happen if pendingEntitlementCount > 0
                }

                const totalEntitlements = employee.entitlements.length;
                const completedEntitlements = totalEntitlements - pendingEntitlementCount;
                const progressPercentage = totalEntitlements > 0 ? (completedEntitlements / totalEntitlements) * 100 : 100;
                const progressBarClass = progressPercentage === 100 ? 'progress-complete' : '';

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
                        <span><i class="fas fa-cubes"></i> ${pendingEntitlementCount} Entitlement(s) Pending</span>
                        <span><i class="fas fa-calendar-alt"></i> Earliest Due: ${earliestDueDate ? earliestDueDate.toLocaleDateString() : 'N/A'}</span>
                        <span class="badge ${riskBadgeClass}"><i class="fas fa-exclamation-triangle"></i> ${highestRisk} Risk</span>
                    </div>
                    <div class="review-progress-bar-container">
                        <div class="review-progress-bar ${progressBarClass}" style="width: ${progressPercentage}%"></div>
                        <div class="review-progress-text">${completedEntitlements}/${totalEntitlements} Reviewed</div>
                    </div>
                    <p class="employee-review-summary">Review all active access for ${employee.employeeName} to ensure compliance and security.</p>
                    <div class="employee-review-actions">
                        <button class="btn btn-outline view-details-btn" data-id="${employee.employeeId}"><i class="fas fa-eye"></i> Review Access</button>
                        <button class="btn btn-approve quick-approve-btn" data-id="${employee.employeeId}" ${pendingEntitlementCount === 0 ? 'disabled' : ''}><i class="fas fa-check"></i> Quick Approve Low Risk</button>
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


    // --- Quick Approve All function for individual card button (NOW LOW RISK ONLY) ---
    function handleQuickApproveAllAction(employeeId) {
        const employee = employeeReviewsData.find(emp => emp.employeeId === employeeId);

        if (!employee) {
            console.error('Employee not found for quick approve:', employeeId);
            showToast('Error: Employee not found.', 'danger');
            return;
        }

        const lowRiskPendingEntitlements = employee.entitlements.filter(ent => ent.decision === 'pending' && ent.riskLevel.toLowerCase() === 'low');

        if (lowRiskPendingEntitlements.length === 0) {
            showToast('No pending Low Risk entitlements for this employee to quick approve.', 'info');
            return;
        }

        showConfirmation(
            'Confirm Quick Approval (Low Risk Only)',
            `Are you sure you want to quick approve **ALL PENDING LOW RISK** entitlements for <strong>${employee.employeeName}</strong>? (${lowRiskPendingEntitlements.length} found)`,
            () => {
                lowRiskPendingEntitlements.forEach(ent => {
                    ent.decision = 'approved';
                    ent.comment = 'Approved via Quick Approve Low Risk button.';
                });

                // Update overall comment if all entitlements are now processed, or just low risk ones
                const allPending = employee.entitlements.some(e => e.decision === 'pending');
                if (!allPending) {
                    employee.overallComment = 'All entitlements processed. Low risk approved via quick action.';
                } else {
                    employee.overallComment = `Low risk entitlements approved. Still ${employee.entitlements.filter(e => e.decision === 'pending').length} pending.`;
                }

                showToast(`Low risk entitlements for ${employee.employeeName} approved!`, 'success');

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
                // Only allow selection if the employee still has pending entitlements
                if (employee.entitlements.some(e => e.decision === 'pending')) {
                    employee.isSelected = e.target.checked;
                } else {
                    // If no pending entitlements, ensure they are not selected
                    employee.isSelected = false;
                    e.target.checked = false; // Visually update if somehow checked
                }
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

    // --- MODIFIED: renderEntitlementsTable to work with individual row updates and always visible usage data ---
    function renderEntitlementsTable(entitlements) {
        entitlementsTableBody.innerHTML = '';
        entitlements.forEach(entitlement => {
            const row = entitlementsTableBody.insertRow();
            row.dataset.entitlementId = entitlement.entitlementId;
            // Initially set class based on current decision
            row.classList.add(`entitlement-status-${entitlement.decision}`);

            const riskClass = `risk-${entitlement.riskLevel.toLowerCase()}`;
            const statusBadgeClass = `entitlement-status-badge status-${entitlement.decision}`;

            // Check if reasonForAccess exists and is long enough to warrant a toggle
            // For now, let's always put it behind a toggle for consistency if it's there
            const hasReasonForAccess = entitlement.reasonForAccess && entitlement.reasonForAccess.trim() !== '';

            row.innerHTML = `
                <td>
                    <strong>${entitlement.application}</strong><br>
                    <small>${entitlement.entitlementName}</small>
                    <div class="usage-details-summary">
                        <span class="detail-item"><i class="fas fa-sign-in-alt"></i> Last Login: ${entitlement.lastLogin || 'N/A'}</span>
                        <span class="detail-item"><i class="fas fa-chart-line"></i> Last Activity: ${entitlement.lastActivity || 'N/A'}</span>
                        <span class="detail-item"><i class="fas fa-calendar-check"></i> Freq: ${entitlement.activityFrequency || 'N/A'}</span>
                    </div>
                </td>
                <td>${new Date(entitlement.provisionedDate).toLocaleDateString()}</td>
                <td>${new Date(entitlement.dueDate).toLocaleDateString()}</td>
                <td><span class="badge ${riskClass}">${entitlement.riskLevel}</span></td>
                <td>
                    ${hasReasonForAccess ? `<button class="original-reason-toggle" type="button" data-ent-id="${entitlement.entitlementId}">Show Original Reason</button>` : ''}
                    <div class="original-reason-details" id="original-reason-${entitlement.entitlementId}">
                        <p><strong>Original Reason:</strong> ${entitlement.reasonForAccess || 'N/A'}</p>
                    </div>
                    <textarea class="entitlement-comment" placeholder="Add comment (optional for Low Risk approval, mandatory for High/Medium approval/denial)" data-ent-id="${entitlement.entitlementId}">${entitlement.comment}</textarea>
                </td>
                <td>
                    <div class="entitlement-action-btns">
                        <button class="btn btn-approve entitlement-approve-btn" data-ent-id="${entitlement.entitlementId}" ${entitlement.decision !== 'pending' ? 'disabled' : ''}>Approve</button>
                        <button class="btn btn-deny entitlement-deny-btn" data-ent-id="${entitlement.entitlementId}" ${entitlement.decision !== 'pending' ? 'disabled' : ''}>Deny</button>
                    </div>
                </td>
                <td><span class="${statusBadgeClass}">${entitlement.decision}</span></td>
            `;
            // Add event listener for the new original reason toggle
            if (hasReasonForAccess) {
                row.querySelector('.original-reason-toggle').addEventListener('click', (event) => {
                    const toggleButton = event.target;
                    const detailsDiv = document.getElementById(`original-reason-${toggleButton.dataset.entId}`);
                    detailsDiv.classList.toggle('active');
                    toggleButton.textContent = detailsDiv.classList.contains('active') ? 'Hide Original Reason' : 'Show Original Reason';
                });
            }
        });
    }

    function updateModalDecisionSummary() {
        if (!currentEmployeeInModal) return;
        const total = currentEmployeeInModal.entitlements.length;
        const approved = currentEmployeeInModal.entitlements.filter(e => e.decision === 'approved').length;
        const denied = currentEmployeeInModal.entitlements.filter(e => e.decision === 'denied').length;
        const pending = total - approved - denied;
        modalDecisionSummary.textContent = `${approved} Approved, ${denied} Denied, ${pending} Pending (out of ${total})`;

        // Re-evaluate modalApproveAllBtn disabled state based on remaining pending LOW risk
        const pendingLowRisk = currentEmployeeInModal.entitlements.filter(e => e.decision === 'pending' && e.riskLevel.toLowerCase() === 'low').length;
        modalApproveAllBtn.disabled = pendingLowRisk === 0;

        modalDenyAllBtn.disabled = pending === 0;
        // Make the submit review button enable only when no pending entitlements
        modalSubmitReviewBtn.disabled = pending > 0;
        // Adjust submit button text for clarity if all are processed
        if (pending === 0) {
            modalSubmitReviewBtn.textContent = 'Submit Completed Review';
            modalSubmitReviewBtn.classList.remove('btn-outline');
            modalSubmitReviewBtn.classList.add('btn-primary');
        } else {
            modalSubmitReviewBtn.textContent = 'Submit Review';
            modalSubmitReviewBtn.classList.remove('btn-primary');
            modalSubmitReviewBtn.classList.add('btn-outline');
        }

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

    // --- MODIFIED: Event delegation for individual entitlement actions in modal ---
    entitlementsTableBody.addEventListener('click', (e) => {
        const entId = e.target.dataset.entId;
        if (!entId || !currentEmployeeInModal) return;

        const entitlement = currentEmployeeInModal.entitlements.find(e => e.entitlementId === entId);
        if (!entitlement) return;

        const row = e.target.closest('tr'); // Get the parent row of the clicked button
        const commentInput = row.querySelector(`textarea[data-ent-id="${entId}"]`);
        const statusBadge = row.querySelector('.entitlement-status-badge');
        const approveBtn = row.querySelector('.entitlement-approve-btn');
        const denyBtn = row.querySelector('.entitlement-deny-btn');

        if (e.target.classList.contains('entitlement-approve-btn')) {
            // --- NEW LOGIC: Enforce comment for Medium/High Risk approval ---
            if (entitlement.riskLevel.toLowerCase() === 'medium' || entitlement.riskLevel.toLowerCase() === 'high') {
                showPromptModal(
                    'Reason for Approval',
                    `Please provide a mandatory reason for approving <strong>${entitlement.application} - ${entitlement.entitlementName}</strong> (Risk: ${entitlement.riskLevel}):`,
                    (comment) => {
                        if (!comment.trim()) {
                            showToast('A comment is required for approving Medium/High risk entitlements.', 'warning');
                            return false; // Prevent modal from closing if comment is empty
                        }
                        entitlement.decision = 'approved';
                        entitlement.comment = comment;
                        commentInput.value = comment; // Update the textarea in the main modal

                        // Update UI elements directly for this row
                        row.classList.remove('entitlement-status-pending', 'entitlement-status-denied');
                        row.classList.add('entitlement-status-approved');
                        statusBadge.textContent = 'approved';
                        statusBadge.classList.remove('status-pending', 'status-denied');
                        statusBadge.classList.add('status-approved');
                        approveBtn.disabled = true;
                        denyBtn.disabled = true;

                        showToast(`Entitlement ${entitlement.application} - ${entitlement.entitlementName} Approved (Risk: ${entitlement.riskLevel})`, 'success');
                        updateModalDecisionSummary(); // Update summary after successful approval
                        return true; // Allow modal to close
                    },
                    commentInput.value // Pre-fill prompt input if there's an existing comment
                );
                return; // Exit here, updateModalDecisionSummary is called by the prompt callback
            } else { // Low risk approval remains optional comment
                entitlement.decision = 'approved';
                entitlement.comment = commentInput.value || 'Approved.'; // Comment optional for low risk approve

                // Update UI elements directly for this row
                row.classList.remove('entitlement-status-pending', 'entitlement-status-denied');
                row.classList.add('entitlement-status-approved');
                statusBadge.textContent = 'approved';
                statusBadge.classList.remove('status-pending', 'status-denied');
                statusBadge.classList.add('status-approved');
                approveBtn.disabled = true;
                denyBtn.disabled = true;

                showToast(`Entitlement ${entitlement.application} - ${entitlement.entitlementName} Approved`, 'success');
            }
        } else if (e.target.classList.contains('entitlement-deny-btn')) {
            // --- Deny still uses prompt modal ---
            showPromptModal(
                'Reason for Denial',
                `Please provide a mandatory reason for denying <strong>${entitlement.application} - ${entitlement.entitlementName}</strong> (Risk: ${entitlement.riskLevel}):`,
                (comment) => {
                    if (!comment.trim()) {
                        showToast('A comment is required for denying this entitlement.', 'warning');
                        return false; // Prevent modal from closing if comment is empty
                    }

                    entitlement.decision = 'denied';
                    entitlement.comment = comment;
                    commentInput.value = comment; // Update the textarea in the main modal

                    // Update UI elements directly for this row
                    row.classList.remove('entitlement-status-pending', 'entitlement-status-approved');
                    row.classList.add('entitlement-status-denied');
                    statusBadge.textContent = 'denied';
                    statusBadge.classList.remove('status-pending', 'status-approved');
                    statusBadge.classList.add('status-denied');
                    approveBtn.disabled = true;
                    denyBtn.disabled = true;

                    showToast(`Entitlement ${entitlement.application} - ${entitlement.entitlementName} Denied`, 'danger');
                    updateModalDecisionSummary(); // Update summary after successful denial
                    return true; // Allow modal to close
                },
                commentInput.value // Pre-fill prompt input if there's an existing comment
            );
            return; // Exit here, updateModalDecisionSummary is called by the prompt callback
        }

        // Only update summary if an action other than a prompt-requiring one occurred
        // (prompt callbacks handle their own summary updates)
        if (!e.target.classList.contains('entitlement-approve-btn') || entitlement.riskLevel.toLowerCase() === 'low') {
            updateModalDecisionSummary();
        }
    });

    // --- MODIFIED: Bulk actions within the modal (Approve All now Low Risk Only) ---
    modalApproveAllBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;

        const lowRiskPendingEntitlements = currentEmployeeInModal.entitlements.filter(ent => ent.decision === 'pending' && ent.riskLevel.toLowerCase() === 'low');

        if (lowRiskPendingEntitlements.length === 0) {
            showToast('No pending Low Risk entitlements to approve for this employee.', 'info');
            return;
        }

        showConfirmation(
            'Confirm Approve All Low Risk',
            `Are you sure you want to approve **ALL PENDING LOW RISK** entitlements for <strong>${currentEmployeeInModal.employeeName}</strong>? (${lowRiskPendingEntitlements.length} found)`,
            () => {
                lowRiskPendingEntitlements.forEach(ent => {
                    ent.decision = 'approved';
                    ent.comment = 'Approved as part of "Approve All Low Risk" action.';
                });
                renderEntitlementsTable(currentEmployeeInModal.entitlements); // Re-render table to reflect changes
                updateModalDecisionSummary();
                showToast(`All pending Low Risk entitlements for ${currentEmployeeInModal.employeeName} approved!`, 'success');
            },
            'Approve All'
        );
    });

    // --- MODIFIED: modalDenyAllBtn to use the new prompt modal ---
    modalDenyAllBtn.addEventListener('click', () => {
        if (!currentEmployeeInModal) return;

        const pendingCount = currentEmployeeInModal.entitlements.filter(e => e.decision === 'pending').length;
        if (pendingCount === 0) {
            showToast('No pending entitlements to deny.', 'warning');
            return;
        }

        showPromptModal(
            'Reason for Denying All',
            `Please provide a mandatory reason for denying all ${pendingCount} pending entitlements for <strong>${currentEmployeeInModal.employeeName}</strong>:`,
            (comment) => {
                if (!comment.trim()) {
                    showToast('Bulk denial requires a reason.', 'warning');
                    return false; // Prevent modal from closing if comment is empty
                }

                currentEmployeeInModal.entitlements.forEach(ent => {
                    if (ent.decision === 'pending') {
                        ent.decision = 'denied';
                        ent.comment = comment;
                    }
                });
                renderEntitlementsTable(currentEmployeeInModal.entitlements); // Re-render table to reflect changes
                updateModalDecisionSummary();
                showToast(`All pending entitlements for ${currentEmployeeInModal.employeeName} denied!`, 'danger');
                return true; // Allow modal to close
            }
        );
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
                // This logic ensures that if an employee had ALL their entitlements processed
                // and approved/denied, they are removed from the main list.
                // If they still have pending entitlements (e.g., if a new one was added after review started),
                // they remain in the list.
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

    // --- NEW: Sort Event Listener ---
    sortEmployees.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        applyFiltersAndLoadEmployees(); // Re-apply filters which will also apply sorting
    });

    // --- Select All Employees Feature ---
    selectAllEmployeesCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        // Apply selection to ALL currently filtered employees in the data source
        currentFilteredEmployees.forEach(employee => {
            // Only allow selection if the employee still has pending entitlements
            // This prevents selecting employees who are already fully reviewed
            if (employee.entitlements.some(e => e.decision === 'pending')) {
                employee.isSelected = isChecked;
            } else {
                // If no pending entitlements, ensure they are not selected
                employee.isSelected = false;
            }
        });

        // Update UI checkboxes for currently displayed employees
        const visibleCheckboxes = employeeReviewList.querySelectorAll('.employee-review-card-checkbox');
        visibleCheckboxes.forEach(checkbox => {
            const empId = checkbox.dataset.id;
            const employee = currentFilteredEmployees.find(emp => emp.employeeId === empId);
            if (employee) {
                checkbox.checked = employee.isSelected;
            }
        });

        updateBulkActionsBar();
        updateSelectAllCheckboxState(); // Ensure the "select all" checkbox state is immediately updated
    });

    function updateSelectAllCheckboxState() {
        const totalFilteredPendingCount = currentFilteredEmployees.filter(emp => emp.entitlements.some(e => e.decision === 'pending')).length;
        const selectedFilteredPendingCount = currentFilteredEmployees.filter(emp => emp.isSelected && emp.entitlements.some(e => e.decision === 'pending')).length;

        if (totalFilteredPendingCount === 0) {
            selectAllEmployeesCheckbox.checked = false;
            selectAllEmployeesCheckbox.indeterminate = false;
            selectAllEmployeesCheckbox.disabled = true; // Disable if no pending employees to select
            return;
        }

        selectAllEmployeesCheckbox.disabled = false; // Enable if there are pending employees

        if (selectedFilteredPendingCount === totalFilteredPendingCount) {
            selectAllEmployeesCheckbox.checked = true;
            selectAllEmployeesCheckbox.indeterminate = false;
        } else if (selectedFilteredPendingCount > 0) {
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

        // --- MODIFIED: Bulk approve now only processes LOW risk items for selected employees ---
        let totalLowRiskApproved = 0;
        let employeesWithHighMediumRisk = 0;

        selectedEmployeesToProcess.forEach(employee => {
            let employeeHadLowRiskPending = false;
            employee.entitlements.forEach(ent => {
                if (ent.decision === 'pending' && ent.riskLevel.toLowerCase() === 'low') {
                    ent.decision = 'approved';
                    ent.comment = 'Approved via bulk action (Low Risk).';
                    totalLowRiskApproved++;
                    employeeHadLowRiskPending = true;
                }
            });
            if (employeeHadLowRiskPending) {
                // If employee had any low risk items approved, deselect them.
                // If they still have high/medium risk items, they remain in the filtered list.
                employee.isSelected = false; // Deselect after processing their low risk
                // Update overall comment if all entitlements are now processed, or just low risk ones
                const allPending = employee.entitlements.some(e => e.decision === 'pending');
                if (!allPending) {
                    employee.overallComment = 'All entitlements processed. Low risk approved via bulk action.';
                } else {
                    employee.overallComment = `Low risk entitlements approved via bulk action. Still ${employee.entitlements.filter(e => e.decision === 'pending').length} pending (High/Medium risk).`;
                    employeesWithHighMediumRisk++;
                }
                showToast(`Low risk entitlements for ${employee.employeeName} approved!`, 'success');
            }
        });

        if (totalLowRiskApproved > 0) {
            showConfirmation(
                'Confirm Bulk Approval (Low Risk Only)',
                `Are you sure you want to approve **ALL PENDING LOW RISK** entitlements for <strong>${selectedEmployeesToProcess.length}</strong> selected employees? (${totalLowRiskApproved} entitlements will be approved).`,
                () => {
                    // This logic is already done above. We just need to refresh UI.
                    applyFiltersAndLoadEmployees();
                    updateBulkActionsBar();
                    updateSelectAllCheckboxState();
                    if (employeesWithHighMediumRisk > 0) {
                        showToast(`Bulk approval completed for Low Risk items. ${employeesWithHighMediumRisk} selected employees still have High/Medium risk pending entitlements.`, 'info', 5000);
                    }
                },
                'Approve Selected'
            );
        } else {
            showToast('No pending Low Risk entitlements found among selected employees.', 'warning');
        }
    });

    // --- MODIFIED: bulkDenyBtn to use the new prompt modal ---
    bulkDenyBtn.addEventListener('click', () => {
        const selectedEmployeesToProcess = currentFilteredEmployees.filter(emp => emp.isSelected && emp.entitlements.some(e => e.decision === 'pending'));
        if (selectedEmployeesToProcess.length === 0) {
            showToast('No employees selected for bulk denial or no pending entitlements for selected.', 'warning');
            return;
        }

        showPromptModal(
            'Reason for Bulk Denial',
            `Please provide a mandatory reason for denying ALL pending entitlements for <strong>${selectedEmployeesToProcess.length}</strong> selected employees:`,
            (comment) => {
                if (!comment.trim()) {
                    showToast('Bulk denial requires a reason.', 'warning');
                    return false; // Prevent modal from closing if comment is empty
                }

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
                return true; // Allow modal to close
            }
        );
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
    function showConfirmation(title, message, onConfirmCallback, confirmBtnText = 'Confirm', duration = 3000) {
        confirmationTitle.innerHTML = title;
        confirmationMessage.innerHTML = message;
        confirmActionButton.textContent = confirmBtnText;
        // Optionally change button class based on action type (e.g., btn-deny for denial)
        confirmActionButton.classList.remove('btn-deny', 'btn-approve'); // Ensure previous class is removed
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


    // --- NEW: General Purpose Prompt Modal Functions (for mandatory comments) ---
    function showPromptModal(title, message, onConfirmCallback, initialValue = '') {
        promptTitle.innerHTML = title;
        promptMessage.innerHTML = message;
        promptInput.value = initialValue;
        pendingPromptAction = onConfirmCallback; // Store the callback

        promptModal.classList.add('active');
        promptInput.focus(); // Focus on the input field
    }

    function hidePromptModal() {
        promptModal.classList.remove('active');
        promptInput.value = ''; // Clear input
        pendingPromptAction = null;
    }

    promptConfirmButton.addEventListener('click', () => {
        if (pendingPromptAction) {
            const comment = promptInput.value;
            // Execute the callback. If it returns true, close the modal.
            // This allows the callback to enforce validation (e.g., non-empty comment).
            if (pendingPromptAction(comment)) {
                hidePromptModal();
            }
        } else {
            hidePromptModal(); // If no action, just close
        }
    });

    promptCancelButton.addEventListener('click', hidePromptModal);
    promptCloseButton.addEventListener('click', hidePromptModal);
    window.addEventListener('click', (event) => {
        if (event.target === promptModal) {
            hidePromptModal();
        }
    });


    // Initial setup: Dashboard is default. If you intend for "Pending Reviews" to be the default page
    // on load, you can change the initial 'active' class assignment in your HTML, or uncomment/adjust
    // the following lines.
    // Ensure populateFilterOptions() and applyFiltersAndLoadEmployees() are called
    // when the pending-reviews-page is the initial active page, or when navigated to.
    if (document.getElementById('pending-reviews-page').classList.contains('active')) {
        populateFilterOptions();
        applyFiltersAndLoadEmployees();
        pageContent.addEventListener('scroll', handleScroll);
    }
});