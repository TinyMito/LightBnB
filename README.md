# LightBnB
AirBnB clone uses a server-size Javascript to display the information from queries to web pages via SQL queries.

## Dependencies
- Node.js
- bcrypt
- cookie-session
- Express
- nodemon
- pg

## Installation
1. Clone this repo.
2. Open terminal under `LightBnB` folder.
3. Requires Node Postgres, if you haven't install it. Enter this in terminal `npm install pg`
4. Start Node Postgres with `brew services start postgresql`
5. Enter `psql`
6. Create a user if you haven't with `CREATE ROLE vagrant LOGIN SUPERUSER PASSWORD '123';`
7. Create a new database with `CREATE DATABASE lightbnb;`
8. Enter `\c lightbnb`
9. Setup new tables with `\i migrations/01_schema.sql`
10. Setup the tables with dummy data with `\i seeds/02_seeds.sql`
11. Open a new terminal under `LightBnB` folder.
12. In your terminal enter `cd LightBnB_WebApp/`
13. Make sure npx is installed enter `npm install -g npx`
14. Install all dependencies by entering `npm i`
15. Run `npm run local` to run the app.
16. Go to your browser and enter 'http://localhost:8080'