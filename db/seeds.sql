INSERT INTO departments (department_name) VALUES
    ('HR'),
    ('Engineering'),
    ('Sales');

INSERT INTO roles (job_title, salary, department_id) VALUES
    ('HR Manager', 80000, 1),
    ('Software Engineer', 90000, 2),
    ('Sales Representative', 60000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Mike', 'Johnson', 3, 1);
