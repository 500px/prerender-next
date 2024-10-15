const graphqlQuery = async (query = "", variables = {}) => {
  const res = await fetch("http://graphql-gateway/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": "",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const result = await res.json();
  return result.data;
};

export default graphqlQuery;
