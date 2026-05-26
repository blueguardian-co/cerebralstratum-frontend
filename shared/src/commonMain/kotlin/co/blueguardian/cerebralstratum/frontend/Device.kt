package co.blueguardian.cerebralstratum.frontend

import kotlinx.serialization.Serializable
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@OptIn(ExperimentalJsExport::class)
@JsExport
@Serializable
data class DeviceStatus(
    val summary: String,
    val overall: String,
    val battery: Int
)

@OptIn(ExperimentalJsExport::class)
@JsExport
@Serializable
data class Device(
    val uuid: String,
    val name: String?,
    val description: String?,
    val keycloak_user_id: String,
    val keycloak_org_id: String?,
    val image_path: String?,
    val status: DeviceStatus
)
