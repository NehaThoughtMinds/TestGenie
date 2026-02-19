import React from 'react'
import './ResultsSection.css'
import TestCaseCard from './TestCaseCard'

function ResultsSection({ testCases }) {
  return (
    <section className="results-section">
      <div className="wrapper">
        <div className="summary-bar">
          <div className="summary-title">
            <div className="status-dot"></div>
            Generated {testCases.length} test cases for <code>math_utils.py</code>
          </div>
          <div className="summary-chips">
            <div className="chip chip-cyan">⚡ {testCases.length} Tests</div>
            <div className="chip chip-green">✓ {testCases.filter(tc => tc.category === 'happy_path').length} Happy Path</div>
            <div className="chip chip-amber">⚠ {testCases.filter(tc => tc.category === 'edge_case').length} Edge Cases</div>
            <div className="chip chip-purple">✦ {testCases.filter(tc => tc.category === 'negative').length} Negative</div>
          </div>
        </div>

        <div className="test-cases">
          {testCases.map((testCase) => (
            <TestCaseCard key={testCase.id} testCase={testCase} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResultsSection
