const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql
const JSON_SERVER = `http://localhost:3000`;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args){
        return axios.get(`${JSON_SERVER}/companies/${parentValue.id}/users`)
        .then( response => response.data)
        .catch( console.error)
      }
    }
  })
});

const UserType = new GraphQLObjectType({ // we're telling GraphQL - "hey, this is what I want a User objest to look like"
  name: "User", // tell's graphQL - "refer to this graphQL object as 'User' internally"
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: 
      { type: CompanyType,
        resolve(parentValue, args){
          console.log(parentValue.companyId)
          return axios.get(`${JSON_SERVER}/companies/${parentValue.companyId}`)
            .then( response => response.data)
            .catch( console.error );
        } 
      }
  }
});


const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ( {
    user: { // this defines a function that we will call with graphQL i.e. user(id: "23"),
      type: UserType, // defines the type as the UserType we gave above.
      args: { id: { type: GraphQLString } }, // this states what the user function requires to find the specific user
      resolve(parentValue, args){ // this function is used to query our database and find the user we are looking for
        // where the user's id will be give in the variable args.
        return axios.get(`${JSON_SERVER}/users/${args.id}`)
          .then( response => response.data)
          .catch( console.error) //walk through users, find a user who's value matches args.id
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args){
        return axios.get(`${JSON_SERVER}/companies/${args.id}`)
        .then( response => response.data)
        .catch( console.error)
      }
    }
  } )
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields:{
    addUser:{
      type: UserType, //refers to the type of data we will return from the RESOLVE function!
      args: {
        firstName: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: GraphQLInt},
        companyId: {type: GraphQLString},
      },
      resolve(parentValue, {firstName, age, companyId}){
        return axios.post(`${JSON_SERVER}/users`, {firstName, age, companyId})
          .then( response => response.data)
          .catch( console.error);
      }
    }
  }
})


module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
}); //exports the query as a GraphQLSchema object for use in expressGraphQL