package co.blueguardian.cerebralstratum.frontend

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

class ApiClient(
    private val baseUrl: String,
    private val authState: AuthStateProvider
) {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    suspend fun getDevices(): List<Device> {
        return client.get("$baseUrl/api/v1/devices/mine") {
            authState.getToken()?.let {
                header("Authorization", "Bearer $it")
            }
        }.body()
    }

    // Stop-gap for the delay between initial page load and the first SSE
    // status message: seeds a device's status from the last known value
    // instead of leaving it null (rendered as "Offline"/no battery) until
    // the live stream catches up. Returns null on any failure, including a
    // device that has never reported a status (404) — callers treat that
    // the same as "no status yet".
    suspend fun getLatestDeviceStatus(deviceUuid: String): DeviceStatus? {
        return try {
            client.get("$baseUrl/api/v1/devices/by-id/$deviceUuid/statuses/latest") {
                authState.getToken()?.let {
                    header("Authorization", "Bearer $it")
                }
            }.body()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun getHealthCheck(): Boolean {
        return try {
            val response = client.get("$baseUrl/q/health") {
                authState.getToken()?.let {
                    header("Authorization", "Bearer $it")
                }
            }
            response.status.value == 200
        } catch (e: Exception) {
            false
        }
    }
}
