const express = require('express');
const expressGraphQL = require('express-graphql')

const app = express();

const schema = require('./schema');

app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true // development tool - allows us to make queries against our dev server at /graphql
}));

app.listen(4000, () => {
  console.log("Express-GraphQL listening on port 4000")
})

