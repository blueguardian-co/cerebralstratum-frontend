// API v1 functions

export async function pingApi(api: object) {
  try {
    const apiPing =  await api.get("/api/v1/ping");
    return apiPing
  }
  catch (error) {
    console.log(error);
    var errorDict = {"response": "unreachable"};
    return errorDict
  }
}