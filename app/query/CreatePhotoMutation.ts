const createPhotoMutation = `
  mutation CreatePhotoMutation($input: CreatePhotoInput) {
    createPhoto(input: $input) {
      photo {
        legacyId
        uploader {
          legacyId
        }
      }
      clientMutationId
      directUpload {
        url
        fields
      }
      keywordKey
    }
  }
`;

export default createPhotoMutation;
