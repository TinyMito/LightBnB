const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

const properties = `
SELECT *
FROM properties
LIMIT $1;
`;

const users = `
SELECT *
FROM users
WHERE email = $1;
`;

const ids = `
SELECT *
FROM users
WHERE id = $1;
`;

const reservations = `
SELECT *
FROM reservations
JOIN properties ON reservations.property_id = properties.id
WHERE reservations.guest_id = $1
LIMIT $2;
`;

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {

  return pool
    .query(users, [ email ])
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
const getUserWithId = function (id) {

  return pool
    .query(ids, [ id ])
    .then((result) => {
      //console.log('getUserWithId', result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    })
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {

  //console.log("INPUT: ", user)

  return pool
    .query(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
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
const getAllReservations = function (guest_id, limit = 10) {

  return pool
    .query(reservations, [ guest_id, limit ])
      .then((result) => {
        console.log('getAllReservations: ', result.rows);
        return result.rows;
      })
      .catch((err) => {
        console.log('ERROR: ', err.message);
      })

  //return getAllProperties(null, 2);
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  
  return pool
    .query(properties, [ limit ])
    .then((result) => {
      //console.log('getAllProperties', result.rows);
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
const addProperty = function (property) {
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
