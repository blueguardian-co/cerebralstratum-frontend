import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'

import wretch from "wretch"
import dynamic from 'next/dynamic'

import styles from '../styles/Home.module.css'
import * as csapi from '../scripts/api'

const inter = Inter({ subsets: ['latin'] })

let csApiHost = process.env.CS_API_HOST;
if (csApiHost === undefined) {
  const message = 'CS_API_HOST environment variable is not defined. Using `localhost`';
  console.log(message)
  csApiHost = 'localhost';
}
const api = wretch(`http://${csApiHost}:6443`)
.errorType("json")
.resolve(r => r.json());

const Map = dynamic(() => import("../scripts/map"), {
  loading: () => "Loading...",
  ssr: false
});

export default async function Home() {
  const apiStatus = await csapi.pingApi(api);
  return (
    <>
      <main className={styles.main}>
        <header>
          <div className={styles.description}>
            <p>
              Welcome to BlueGuardian's Tracker&nbsp;
              <code className={styles.code}>login or signup</code>
            </p>
              <div className={styles.grid}>
              <Link
                href="/cli"
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className={inter.className}>
                  CLI<span>-&gt;</span>
                </h2>
              </Link>
              <Link
                href="https://tracker.blueguardian.co/docs"
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className={inter.className}>
                  Docs<span>-&gt;</span>
                </h2>
              </Link>
              <Link
                  href="https://github.com/blueguardian-co"
                  className={styles.card}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2 className={inter.className}>
                    Code<span>-&gt;</span>
                  </h2>
                </Link>
                <a
                href="https://blueguardian.co/about"
                target="_blank"
                rel="noopener noreferrer"
              >
                Powered By{' '}
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
        </header>

        <div className={styles.map}>
        <Map />
        </div>

        <footer>
          <div className={styles.grid}>
          <Link
              href="https://blueguardian.co/contact-us"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>
                Contact us
              </p>
            </Link>
            <Link
              href="https://blueguardian.co/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>
                About Us
              </p>
            </Link>
            <p>API Ping: <strong>{apiStatus.response}</strong></p>
          </div>
          </footer>
      </main>
    </>
  )
}
