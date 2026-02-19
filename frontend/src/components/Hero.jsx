import React from 'react'
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="wrapper">
        <div className="hero-badge">✦ AI-Powered Testing Intelligence</div>
        <h1>
          <span className="line1">Generate Unit Tests</span>
          <span className="line2">From Source Code.</span>
          <span className="line3">Instantly.</span>
        </h1>
        <p className="hero-sub">
          Upload your source file and our AI analyzes every function, edge case, and boundary condition
          to produce comprehensive, human-readable test suites.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">98%</div>
            <div className="stat-label">Coverage Rate</div>
          </div>
          <div className="stat">
            <div className="stat-num">&lt;3s</div>
            <div className="stat-label">Generation Time</div>
          </div>
          <div className="stat">
            <div className="stat-num">12+</div>
            <div className="stat-label">Languages</div>
          </div>
          <div className="stat">
            <div className="stat-num">500K+</div>
            <div className="stat-label">Tests Generated</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
