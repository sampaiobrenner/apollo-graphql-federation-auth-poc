const { ApolloServer } = require('apollo-server');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');

const gateway = new ApolloGateway({
    serviceList: [
        {name: "users", url: "http://localhost:4001/graphql" },
        {name: "posts", url: "http://localhost:4002/graphql" },
        {name: "comments", url: "http://localhost:4003/graphql" },
    ],
    buildService({ url}) {
        return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
                // Only add the token if a token exists
                if(context.token) {
                    // Split header string by space and pick token
                    request.http.headers.set('jwt', context.token.split(" ")[1]);
                }
            },
        });
    },
});

(async () => {
    const {schema, executor} = await gateway.load();

    const server = new ApolloServer({
        schema,
        executor,
        context: ({ req }) => {
            const token = req.headers.authorization || null;
            return {token: token}
        }
    });

    server.listen().then(({url}) => {
        console.log(`🚀 Server ready at ${url}`);
    });
})();
