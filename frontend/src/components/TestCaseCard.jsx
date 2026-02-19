import React, { useState } from 'react'

function TestCaseCard({ testCase }) {
  const [isOpen, setIsOpen] = useState(false)

  const getCategoryClass = (category) => {
    const classes = {
      happy_path: 'tc-number-pass',
      edge_case: 'tc-number-edge',
      boundary: 'tc-number-edge',
      negative: 'tc-number-fail',
      performance: 'tc-number-pass'
    }
    return classes[category] || 'tc-number-pass'
  }

  const getTagClass = (tag) => {
    const classes = {
      happy_path: 'tc-tag-happy',
      edge_case: 'tc-tag-edge',
      boundary: 'tc-tag-boundary',
      negative: 'tc-tag-negative',
      performance: 'tc-tag-performance'
    }
    return classes[tag] || 'tc-tag-happy'
  }

  return (
    <div className={`test-case-card ${isOpen ? 'tc-card-open' : ''}`}>
      <div className="tc-header" onClick={() => setIsOpen(!isOpen)}>
        <div className={`tc-number ${getCategoryClass(testCase.category)}`}>
          {testCase.id}
        </div>
        <div className="tc-info">
          <div className="tc-name">{testCase.name}</div>
          <div className="tc-meta">
            fn: {testCase.function_name} &nbsp;·&nbsp; {testCase.category.replace('_', ' ')}
          </div>
        </div>
        <div className="tc-tags">
          {testCase.tags.map(tag => (
            <span key={tag} className={`tc-tag ${getTagClass(tag)}`}>
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
        <span className="tc-chevron">▾</span>
      </div>
      {isOpen && (
        <div className="tc-body open">
          <div className="tc-grid">
            <div className="tc-field tc-field-full">
              <label>Description</label>
              <div className="tc-value">{testCase.description}</div>
            </div>
            <div className="tc-field">
              <label>Input / Preconditions</label>
              <div className="tc-value">
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--accent)' }}>
                  {testCase.input}
                </div>
              </div>
            </div>
            <div className="tc-field">
              <label>Expected Output</label>
              <div className="tc-value">
                <div className="result-row">
                  <span className="result-label">Expected:</span>
                  <span className="result-value result-expected">{testCase.expected_output}</span>
                </div>
              </div>
            </div>
            <div className="tc-field tc-field-full">
              <label>Test Code</label>
              <div className="tc-code" data-lang="pytest">
                {testCase.test_code}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestCaseCard
