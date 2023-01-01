import Image from 'next/image'
import Link from 'next/link'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default async function Home() {
  const apiStatus = await getApiStatus();
  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Welcome to BlueGuardian's Tracker&nbsp;
            <code className={styles.code}>login or signup</code>
          </p>
          <Link
            href="/cli"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              CLI<span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Use our commandline interface to interact with your devices
            </p>
          </Link>
          <p>API Status: <strong>{apiStatus.status}</strong></p>
          <div>
            <a
              href="https://blueguardian.co/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{' '}
              <Image
                src="/blueguardian.svg"
                alt="BlueGuardian Logo"
                className={styles.blueguardianLogo}
                width={55}
                height={50}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/tracker.svg"
            alt="Tracker Logo"
            height={150}
            width={100}
            priority
          />
        </div>
        <footer>
        <div className={styles.grid}>
          <a
            href="https://tracker.blueguardian.co/docs"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs<span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Tracker features and&nbsp;API.
            </p>
          </a>
          <a
              href="https://github.com/blueguardian-co"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className={inter.className}>
                Our Code is Open! <span>-&gt;</span>
              </h2>
              <p className={inter.className}>
                View our the source code for Tracker!
              </p>
            </a>
          </div>
          </footer>
      </main>
    </>
  )
}


async function getApiStatus() {
  const res = await fetch('http://localhost:6443/api/v2/healthz');
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}
