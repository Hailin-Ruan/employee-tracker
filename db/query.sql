UPDATE employees AS e
LEFT JOIN employees AS m ON e.manager_id = m.employee_id
SET e.manager_id = NULL
WHERE m.employee_id IS NULL;
