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
        images(sizes: [33]) {
          id
          url
        }
        uploader {
          id
          username
          displayName
        }
      }
    }
  }
`;

export default photoQuery;
