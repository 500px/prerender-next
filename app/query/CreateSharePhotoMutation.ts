const CreateSharePhotoMutation = `
  mutation CreatePhotoMutation($input: CreateSharePhotoInput) {
    createSharePhoto(input: $input) {
      directUpload {
        url
        fields
        overtShareUrl
      }
    }
  }
`;

export default CreateSharePhotoMutation;
