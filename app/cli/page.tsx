import Image from 'next/image'
import Script from 'next/script'
import { Inter } from "next/font/google"
import styles from '../../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

function Cli() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Tracker CLI
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

        <div className={styles.terminal} id="terminal">
          <Script src="hterm_all.js" />
          <Script src="cli.js" />
        </div>

        <footer>
          <div className={styles.center}>
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

export default Cli
