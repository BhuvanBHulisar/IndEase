-- Demo Producer Account
INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_verified)
VALUES ('producer_demo@example.com', 'demo_hash', 'Producer', 'Demo', 'producer', '1234567890', TRUE);

-- Demo Consumer Account
INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_verified)
VALUES ('consumer_demo@example.com', 'demo_hash', 'Consumer', 'Demo', 'consumer', '0987654321', TRUE);

-- Link demo accounts with a service request
INSERT INTO machines (owner_id, name, oem, model_year, machine_type)
SELECT u.id, 'Demo Machine', 'Demo OEM', 2022, 'demo_type' FROM users u WHERE u.email = 'consumer_demo@example.com';

INSERT INTO service_requests (machine_id, consumer_id, producer_id, issue_description, status, quoted_cost)
SELECT m.id, u_consumer.id, u_producer.id, 'Demo issue', 'broadcast', 1000
FROM machines m, users u_consumer, users u_producer
WHERE m.name = 'Demo Machine' AND u_consumer.email = 'consumer_demo@example.com' AND u_producer.email = 'producer_demo@example.com';

-- Create a demo transaction
INSERT INTO transactions (request_id, transaction_ref, amount, currency, status)
SELECT sr.id, 'order_demo_123', 1000, 'INR', 'pending'
FROM service_requests sr
WHERE sr.issue_description = 'Demo issue';
