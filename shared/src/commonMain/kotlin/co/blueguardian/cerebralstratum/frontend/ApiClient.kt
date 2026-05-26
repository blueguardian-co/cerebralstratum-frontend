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
