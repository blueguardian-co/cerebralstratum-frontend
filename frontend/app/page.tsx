import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'

import wretch from "wretch"

import styles from '../styles/Home.module.css'
import * as csapi from '../scripts/api'

const inter = Inter({ subsets: ['latin'] })

let csApiHost = process.env.CS_API_HOST;

if (csApiHost === undefined) {
  const message = 'CS_API_HOST environment variable is not defined. Using `localhost`';
  console.log(message)
  csApiHost = 'localhost';
}
const api =
  wretch(`http://${csApiHost}:6443`) // BaseURL
  .errorType("json")
  .resolve(r => r.json());

export default async function Home() {
  const apiStatus = await csapi.pingApi(api);
  let apiUp:string = "unreachable";
  if (apiStatus.ping == "pong") {
    apiUp = "reachable";
  }
  return (
    <>
      <main className={styles.main}>
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
          </div>
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
            <p>API: <strong>{apiUp}</strong></p>
          </div>
          </footer>
      </main>
    </>
  )
}
