# Weird Salads

## Initial observations

The first thing I've noticed is the requirement that this needs to run locally on different OS’ such as Windows, macOS, and Linux. Therefore I have decided to use Docker to run this locally.  

Given the different relationships required between the initial data spreadsheet and from the requirements a relational database makes most sense in this case.  I have opted for Postgres as this database type has feature such as JSON data support, matches the text stack at Nory, and has more extensive querying capacities (which could be useful for reporting). However, given the low volumes of traffic here a MySQL DB would be perfectly fine also.

As the behaviours of this app are client based, I’ve decided to use Next.js and React on the frontend.  I’ve opted to also use Node/Next.js to interact with the database as this is something I’m more familiar with.  From a performance perspective the may cause problems if this were to be put in a high-performance hosted environment as Node isn’t as fast Go, Rust, or Python.  I’ve abstracted this logic into an API so that the backend could be rewritten at a later date without needing to also refactor the frontend logic.

As this application is only accessible locally, we don't need to be as concerned about all of the security practices and measures that we put in place.  Therefore, additional mechanisms such as API authentication or firewall filtering have been de-scoped for now.

Selling orders and accepting deliveries are the critical requirements in the day-to-day operation of any branch so that was my main focus to deliver.  I prioritised the tasks in the following order: 

1. Sell items
2. Accept deliveries
3. Take stock
4. Pull reports

## Getting to work…

The first thing I am doing is putting on some Liquid DnB to focus then looking at the data provided.

## Database

I setup a Postgres environment using docker compose.  With a working DB and the spreadsheet provided I am importing the data from into the default database.  

I’m taking the data from the provided spreadsheet and exporting each sheet as a CSV file that I can import into tables of my DB. 

Looking at the data I don’t like how the data from the modifiers and recipes tables are storing keyed data as individual rows.  So, I am converting them to keyed with the entries as jsonb columns.

I’ve also added a table for orders and deliveries so that we can track this info for reporting later on

I then exported this as an .sql file so that I could seed it into the docker container.

I also added a .gitignore so that .env files etc. aren’t committed 

## Next.js

I installed Next.js Typescript with Tailwind, Prisma and shadcn/ui along with some base components.

## Prisma

I am configuring the Prisma schema for API routes later on.  To do this prisma reads the database configuration and creates a schema for TS to infer.

## Adding API endpoints

### Menu

I’ve created the menu API GET route which 
- looks up the menu for a location 
- then gets the recipes
- Then the ingredients 
- It formats the data into a json array 
- And checks each ingredient  to set if it’s stock or not

While I don’t have support for modifiers which I believe to be a way for customers to add ingredients to a recipe, I’ve added the functionality for if contains allergens to be exposed via the API.

### Ingredients

I’ve created the ingredients API GET and POST routes which
- looks up the menu for a location 
- then gets the recipes
- Gets all ingredients and formats it into an array
- Allows for the array to be posted back and update each ingredient about

### Delivery

I’ve created the delivery API POST route which:
- Adds an entry to the delivery table to track what’s been added
- Add update the ingredients table amounts (adds)

### Order

I’ve created the order API POST route which:
- Adds an entry to the delivery table to track what’s been added
- Add updates the ingredients table amounts (subtracts)

### Fetches

I’ve abstracted the fetch requests so that they can be easily updated at a later date should a backend be changed or swapped out.

### Hooks

I created to hooks to get the menu data and ingredients data client-side

### POS

Based on the location, I created a grid of salads for the ones that are available to the branch with the price for that branch.  If it contains allergens I’ve displayed a warning to the cashier.  If there is enough stock there is an order button.  However if there isn’t then the button is hidden.  On ordering an order is added to the DB the stocks are adjusted and then the data and page refreshes.

### Stock/Delivery pages

I want to list the ingredients as a table with their amounts for the delivery and stock pages. As the behaviour are most the same I’ve created a shared component that overrides an amount of the ingredients entirely (adjusting) or add to the existing amount (deliveries)

## Descoped items

* Pull reports
* Modifiers


Both of these seem to be not business critical and there is a workaround.  A developer could reports on a monthly basis for the time being.  Modifiers could be manually adjusted in the stock levels afterwards.

* RBAC

This could be implemented at later stage but as the computers are on a local network there is less of a risk for this being open.
