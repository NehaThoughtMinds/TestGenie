import React from 'react'
import './Navbar.css'

function Navbar() {
  return (
    <nav>
      <div className="nav-inner">
        <a className="logo" href="#">
          <div className="logo-icon">⚙</div>
          <span className="logo-text">Test<span>Forge</span></span>
        </a>
        <div className="nav-pills">
          <button className="nav-pill active">Generator</button>
          <button className="nav-pill">History</button>
          <button className="nav-pill">Templates</button>
          <button className="nav-pill">Docs</button>
        </div>
        <button className="nav-cta">→ API Access</button>
      </div>
    </nav>
  )
}

export default Navbar
