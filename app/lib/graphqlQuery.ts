const graphqlQuery = async (query = "", variables = {}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (!apiUrl) {
    throw new Error("REACT_APP_API_URL is not defined");
  }
  const res = await fetch(apiUrl + "/graphql", {
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
