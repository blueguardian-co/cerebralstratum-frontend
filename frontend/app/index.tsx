import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

function Home({ healthz }) {
  return (
    <>
      <Head>
        <title>Tracker - BlueGuardian</title>
        <meta name="description" content="Tracker web application developed by BlueGuardian" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Welcome to BlueGuardian's Track&nbsp;
            <code className={styles.code}>login or signup</code>
          </p>
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

        <div className={styles.center}>
          <p>API Status: <strong>{healthz.status}</strong></p>
        </div>

        <div className={styles.grid}>
          <a
            href="https://tracker.blueguardian.co/docs"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Tracker features and&nbsp;API.
            </p>
          </a>
        </div>
        <footer>
          <div className={styles.center}>
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

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:6443/api/v2/healthz`)
  const healthz = await res.json()
  if (! healthz) {
    return { props: {"status": "offline"} }
  }
  // Pass data to the page via props
  return { props: { healthz } }
}

export default Home
