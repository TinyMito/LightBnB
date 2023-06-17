const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

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

  return pool
    .query(userQuery, [ email ])
    .then((result) => {
      console.log('getUserWithEmail', result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
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

  return pool
    .query(idQuery, [ id ])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
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

  return pool
    .query(addUserQuery,
      [ user.name, user.email, user.password ])
    .then((result) => {
      console.log('addUser: ', result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log('ERROR: ', err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(id, limit = 10) {

  const reservationQuery = `
  SELECT *
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  WHERE reservations.guest_id = $1
  LIMIT $2;
  `;

  return pool
    .query(reservationQuery, [ id, limit ])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log('ERROR: ', err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  
  console.log(options);

  // Declare constant for options parameters into array
  const queryParams = [];

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
    if (options.maximum_price_per_night) {
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

  // Query Check Debug
  console.log(propertyQuery, queryParams);

  // Execute the query with paramenters

  return pool
    .query(propertyQuery, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
