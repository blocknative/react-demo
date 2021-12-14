import React from 'react'
import { version, dependencies } from '../../../package.json'

import './Footer.css'

const Footer = () => {
  const staging = process.env.REACT_Footer_STAGING;

  return (
    <section className="footer">
      <div className="versioning">
        <span>
          React Demo version: <i>{staging ? 'NEXT' : version}</i>
        </span>
        <span>
          Onboard version:{' '}
          <i>{staging ? 'NEXT' : dependencies['bnc-onboard'].slice(1)}</i>
        </span>
        <span>
          Notify version:{' '}
          <i>{staging ? 'NEXT' : dependencies['bnc-notify'].slice(1)}</i>
        </span>
      </div>
      <section className="footer-links">
        <span className="social-links">
          <a
            className="footer-icon github"
            href="https://github.com/blocknative/onboard"
            target="_blank"
            rel="noopener noreferrer"
            title="Github"
          >
            <p> </p>
          </a>
          <span>Onboard Github</span>
        </span>
        <span className="social-links">
          <a
            className="footer-icon discord"
            href="https://discord.gg/FNn2HXX8"
            target="_blank"
            rel="noopener noreferrer"
            title="Discord"
          >
            <p> </p>
          </a>
          <span>Join our Discord</span>
        </span>
        <span className="social-links">
          <a
            className="footer-icon twitter"
            href="https://twitter.com/blocknative"
            target="_blank"
            rel="noopener noreferrer"
            title="Twitter"
          >
            <p> </p>
          </a>
          <span>Blocknative Twitter</span>
        </span>
      </section>
      <section className="tech-links">
        <button className="bn-demo-button">Onboard Blog</button>
        <button className="bn-demo-button">View API Docs</button>
        <section className="terms-privacy">
          <a
            href="https://www.blocknative.com/terms-conditions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
          <span className="terms-privacy-divider">|</span>
          <a
            href="https://www.blocknative.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
        </section>
      </section>
    </section>
  )
}

export default Footer
