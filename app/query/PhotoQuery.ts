const photoQuery = `
  query PhotoQueryRendererQuery($photoLegacyId: ID!, $resourceType: String!) {
    photo: nodeByLegacyId(legacyId: $photoLegacyId, resourceType: $resourceType) {
      ... on Photo {
        id
        legacyId
        name
        canonicalPath
        width
        height
        images(sizes: [33, 35]) {
          id
          url
        }
        uploader {
          id
          username
          displayName
        }
        contentStreams {
          __typename
          ...on ContentStreamEditorsChoice {
            selectedBy {
              type
            }
          }
        }
      }
    }
  }
`;

export default photoQuery;
