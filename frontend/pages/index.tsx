import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
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
            src="/next.svg"
            alt="Tracker Logo"
            width={180}
            height={37}
            priority
          />
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

          <a
            href="https://github.com/blueguardian"
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
      </main>
    </>
  )
}
