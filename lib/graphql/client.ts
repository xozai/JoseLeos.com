import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL ?? "https://cms.joseLeos.com";

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: `${wpUrl}/graphql`, fetch }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: "no-cache" },
  },
});
