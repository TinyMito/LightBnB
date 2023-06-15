SELECT properties.id, title, cost_per_night, AVG(rating) AS average_rating
FROM properties FULL JOIN property_reviews ON property_id = properties.id
WHERE city LIKE '%ancouve%'
GROUP BY properties.id, title, cost_per_night
HAVING avg(rating) >= 4
ORDER BY cost_per_night
LIMIT 10;