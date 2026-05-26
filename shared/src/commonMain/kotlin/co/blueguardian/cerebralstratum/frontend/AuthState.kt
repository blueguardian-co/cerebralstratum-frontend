package co.blueguardian.cerebralstratum.frontend

interface AuthStateProvider {
    fun getToken(): String?
    fun isAuthenticated(): Boolean
}
