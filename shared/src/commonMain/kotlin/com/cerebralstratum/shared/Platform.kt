package com.cerebralstratum.shared

import kotlinx.serialization.Serializable

@Serializable
data class AppInfo(val name: String, val version: String)

expect fun platformName(): String

fun greeting(info: AppInfo = AppInfo("Cerebral Stratum", "0.1.0")): String {
    return "Hello from ${'$'}{platformName()} using ${'$'}{info.name} v${'$'}{info.version}!"
}
