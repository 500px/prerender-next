const photoAwardQuery = `
  query PhotoAwardQueryRendererQuery($photoLegacyId: ID!, $resourceType: String!) {
    photo: nodeByLegacyId(legacyId: $photoLegacyId, resourceType: $resourceType) {
      ... on Photo {
        id
        legacyId
        name
        canonicalPath
        width
        height
        images(sizes: [33]) {
          id
          url
        }
        uploader {
          id
          username
          displayName
          avatar {
            images(sizes: [MEDIUM]) {
              url
            }
          }
        }
        pulse {
          highest
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

export default photoAwardQuery;
