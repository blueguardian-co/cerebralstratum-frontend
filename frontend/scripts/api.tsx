// API v1 functions
import wretch from "wretch"

export async function getApiStatus(api: object) {
  try {
    const apiHealth =  await api.get("/api/v1/healthz");
    return apiHealth
  }
  catch (error) {
    console.log(error);
    var errorDict = {"status": "offline"};
    return errorDict
  }
}