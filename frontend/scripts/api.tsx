// API v1 functions
import wretch from "wretch"

export async function pingApi(api: object) {
  try {
    const apiPing =  await api.get("/api/v1/ping");
    return apiPing
  }
  catch (error) {
    console.log(error);
    var errorDict = {"status": "offline"};
    return errorDict
  }
}