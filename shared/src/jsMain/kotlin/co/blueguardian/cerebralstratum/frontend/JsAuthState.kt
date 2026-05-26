package co.blueguardian.cerebralstratum.frontend

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@OptIn(ExperimentalJsExport::class)
@JsExport
class JsAuthState : AuthStateProvider {
    private var token: String? = null

    fun updateToken(newToken: String) {
        token = newToken
    }

    fun clearToken() {
        token = null
    }

    override fun getToken(): String? = token

    override fun isAuthenticated(): Boolean = token != null
}
