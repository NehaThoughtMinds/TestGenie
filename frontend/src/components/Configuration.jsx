import React from 'react'

function Configuration() {
  return (
    <div className="config-row">
      <div className="config-item">
        <label>Test Framework</label>
        <select className="config-select">
          <option>pytest (Python)</option>
          <option>unittest (Python)</option>
          <option>Jest (JavaScript)</option>
          <option>Mocha (JavaScript)</option>
          <option>JUnit (Java)</option>
          <option>NUnit (.NET)</option>
          <option>Go testing</option>
        </select>
      </div>
      <div className="config-item">
        <label>Coverage Depth</label>
        <select className="config-select">
          <option>Standard — Happy + Edge</option>
          <option>Deep — Full boundary analysis</option>
          <option>Minimal — Happy path only</option>
          <option>Security — Injection & overflow</option>
        </select>
      </div>
      <div className="config-item">
        <label>Output Style</label>
        <select className="config-select">
          <option>Human Readable + Code</option>
          <option>Code Only</option>
          <option>Specification Only</option>
          <option>BDD (Given/When/Then)</option>
        </select>
      </div>
    </div>
  )
}

export default Configuration
