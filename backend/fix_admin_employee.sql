-- Fix: Add Employee record for admin user (idUser = 8)
-- This will allow the chat to display the correct employee name

USE `store_management`;

-- Check if employee record already exists
-- If not, insert new employee record for admin user
INSERT INTO `employees` (
    `id_user`,
    `employee_name`,
    `hire_date`,
    `phone_number`,
    `address`,
    `base_salary`,
    `created_at`,
    `updated_at`
)
SELECT 
    8,                          -- id_user (admin)
    'Admin System',             -- employee_name
    CURDATE(),                  -- hire_date
    NULL,                       -- phone_number
    NULL,                       -- address
    0.00,                       -- base_salary
    NOW(),                      -- created_at
    NOW()                       -- updated_at
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `employees` WHERE `id_user` = 8
);

-- Verify the insert
SELECT 
    e.id_employee,
    e.id_user,
    e.employee_name,
    u.username,
    u.email
FROM 
    employees e
    INNER JOIN users u ON e.id_user = u.id_user
WHERE 
    e.id_user = 8;
