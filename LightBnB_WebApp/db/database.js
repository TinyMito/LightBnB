const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const queryData = (query, parameters) => {
  return pool
    .query(query, parameters)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const userQuery = `
  SELECT *
  FROM users
  WHERE email = $1;
  `;
  return queryData(userQuery, [ email ])
    .then((rows) => {
      return rows[0];
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const idQuery = `
  SELECT *
  FROM users
  WHERE id = $1;
  `;
  return queryData(idQuery, [ id ]);
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const addUserQuery = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `;
  return queryData(addUserQuery, [ user.name, user.email, user.password ]);

};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(id, limit = 10) {
  const reservationQuery = `
  SELECT reservations.*, properties.*, avg(property_reviews.rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON reservations.id = property_reviews.reservation_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.id
  LIMIT $2;
  `;
  return queryData(reservationQuery, [ id, limit ]);
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  const queryParams = []; // Declare constant for options parameters into array

  // BASE SQL Query for getAllProperties
  let propertyQuery = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  /**
   * Query Building
   * Below code to work dynamically with the search form, instead of forcing user
   * to input all required field. They can just partially enter search information.
   * Check if there are input from search query, if so append WHERE and build the Query.
   */
  if (Object.keys(options).length > 0) {
    propertyQuery += `WHERE `;
  }
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    propertyQuery += `properties.owner_id = $${queryParams.length} `;
  }
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    propertyQuery += `properties.city LIKE $${queryParams.length} `;
  }
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    if (options.city) {
      propertyQuery += `AND `;
    }
    propertyQuery += `properties.cost_per_night BETWEEN $${queryParams.length} `;
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    propertyQuery += `AND $${queryParams.length} `;
  } else if (options.minimum_price_per_night || options.maximum_price_per_night) {
    if (options.minimum_price_per_night) {
      queryParams.push(`${options.minimum_price_per_night * 100}`);
      if (options.city) {
        propertyQuery += `AND `;
      }
      propertyQuery += `properties.cost_per_night >= $${queryParams.length} `;
    }

    if (options.maximum_price_per_night) {
      queryParams.push(`${options.maximum_price_per_night * 100}`);
      if (options.city) {
        propertyQuery += `AND `;
      }
      propertyQuery += `properties.cost_per_night <= $${queryParams.length} `;
    }
  }
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    if (options.city || options.minimum_price_per_night || options.maximum_price_per_night) {
      propertyQuery += `AND `;
    }
    propertyQuery += `property_reviews.rating >= $${queryParams.length} `;
  }

  // Query closure
  queryParams.push(limit);
  propertyQuery += `
  GROUP BY properties.id
  ORDER BY properties.cost_per_night
  LIMIT $${queryParams.length};
  `;

  // Execute the query with paramenters
  return queryData(propertyQuery, queryParams);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const addPropertyQuery = `
  INSERT INTO properties (title, description, number_of_bedrooms, number_of_bathrooms, parking_spaces, cost_per_night, thumbnail_photo_url, cover_photo_url, street, country, city, province, post_code, owner_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;
  return queryData(addPropertyQuery, [property.title, property.description, property.number_of_bedrooms, property.number_of_bathrooms, property.parking_spaces, property.cost_per_night, property.thumbnail_photo_url, property.cover_photo_url, property.street, property.country, property.city, property.province, property.post_code, property.owner_id]);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
