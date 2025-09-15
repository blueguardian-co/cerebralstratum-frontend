plugins {
    kotlin("multiplatform") version "1.9.20"
    id("com.android.library")
    kotlin("plugin.serialization") version "1.9.20"
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions { jvmTarget = "17" }
        }
    }

    listOf(iosX64(), iosArm64(), iosSimulatorArm64()).forEach {
        it.binaries.framework { baseName = "shared" }
    }

    js(IR) {
        browser {}
        binaries.library()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("io.ktor:ktor-client-core:2.3.5")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
            }
        }
        val androidMain by getting {
            dependencies { implementation("io.ktor:ktor-client-android:2.3.5") }
        }
        val iosMain by getting {
            dependencies { implementation("io.ktor:ktor-client-darwin:2.3.5") }
        }
        val jsMain by getting {
            dependencies { implementation("io.ktor:ktor-client-js:2.3.5") }
        }
    }
}

android {
    namespace = "com.cerebralstratum.shared"
    compileSdk = 34
    defaultConfig {
        minSdk = 24
    }
}