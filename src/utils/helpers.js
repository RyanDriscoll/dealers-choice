export const handleResponse = data => {
  if (data.error) {
    //TODO handle error
    console.log("ERROR: ", data.error);
  }
  if (data.success) {
    const { gameId } = data;
    console.log("SUCCESSFUL CARD ACTION");
  }
};
