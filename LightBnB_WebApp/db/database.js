const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})


const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {

  return pool
    .query(`
      SELECT *
      FROM users
      WHERE email = $1;
      `,
      [ email ])
    .then((result) => {
      //console.log('getUserWithEmail', result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });


/*   let resolvedUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user?.email.toLowerCase() === email?.toLowerCase()) {
      resolvedUser = user;
    }
  }
  return Promise.resolve(resolvedUser); */
};


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {

  return pool
    .query(`
      SELECT *
      FROM users
      WHERE id = $1;
      `,
      [ id ])
    .then((result) => {
      //console.log('getUserWithId', result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });

  //return Promise.resolve(users[id]);
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (name, email, password) {

  return pool
    .query(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [ name, email, password ])
    .then((result) => {
      console.log('addUser: ', result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log('ERROR: ', err.message);
    });
};

console.log(addUser('Add User 2', 'email2@mailemail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'));


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
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
    .query(`
      SELECT *
      FROM properties
      LIMIT $1;
      `,
      [ limit ])
    .then((result) => {
      //console.log('getAllProperties', result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/* const getAllProperties = function (options, limit = 10) {
  const limitedProperties = {};
  for (let i = 1; i <= limit; i++) {
    limitedProperties[i] = properties[i];
  }
  return Promise.resolve(limitedProperties);
}; */

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
