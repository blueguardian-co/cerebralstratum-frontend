package co.blueguardian.cerebralstratum.frontend

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.promise

@OptIn(ExperimentalJsExport::class)
@JsExport
class JsApiClient(baseUrl: String, authState: JsAuthState) {
    private val apiClient = ApiClient(baseUrl, authState)

    @OptIn(DelicateCoroutinesApi::class)
    fun getDevices(): kotlin.js.Promise<Array<Device>> = GlobalScope.promise {
        apiClient.getDevices().toTypedArray()
    }

    @OptIn(DelicateCoroutinesApi::class)
    fun getHealthCheck(): kotlin.js.Promise<Boolean> = GlobalScope.promise {
        apiClient.getHealthCheck()
    }
}
