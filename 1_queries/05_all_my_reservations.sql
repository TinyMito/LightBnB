SELECT r.id, p.title, r.start_date, p.cost_per_night, avg(pr.rating) as average_rating
FROM reservations r
JOIN properties p ON r.property_id = p.id
JOIN property_reviews pr ON p.id = pr.property_id
WHERE r.guest_id = 1
GROUP BY p.id, r.id
ORDER BY r.start_date
LIMIT 50;