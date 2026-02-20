import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-text font-sans">
      <Navbar />
      
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-4">Documentation</h1>
          <p className="text-text-dim text-lg">Learn how to use TestGenie effectively</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <h2 className="text-2xl font-semibold text-text mb-4">Getting Started</h2>
              <ul className="space-y-3 text-text-dim">
                <li className="flex items-start gap-3">
                  <span className="text-accent">▸</span>
                  <span>Upload your source code file</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent">▸</span>
                  <span>Select test coverage depth</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent">▸</span>
                  <span>Generate comprehensive tests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent">▸</span>
                  <span>Download test files</span>
                </li>
              </ul>
            </div>

            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <h2 className="text-2xl font-semibold text-text mb-4">Supported Languages</h2>
              <div className="grid grid-cols-2 gap-3">
                {['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP'].map(lang => (
                  <div key={lang} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    <span className="text-text">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <h2 className="text-2xl font-semibold text-text mb-4">Test Categories</h2>
              <ul className="space-y-3 text-text-dim">
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <div>
                    <strong className="text-text">Happy Path:</strong> Normal flow scenarios
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">⚡</span>
                  <div>
                    <strong className="text-text">Edge Cases:</strong> Boundary conditions
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">✗</span>
                  <div>
                    <strong className="text-text">Negative Tests:</strong> Error scenarios
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500">◯</span>
                  <div>
                    <strong className="text-text">Boundary Tests:</strong> Limit values
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <h2 className="text-2xl font-semibold text-text mb-4">Features</h2>
              <ul className="space-y-3 text-text-dim">
                <li className="flex items-start gap-3">
                  <span className="text-accent">⚡</span>
                  <span>AI-powered test generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent">📊</span>
                  <span>Coverage analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent">🔧</span>
                  <span>Multiple test frameworks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent">📝</span>
                  <span>Human-readable code</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-accent text-bg rounded-lg font-semibold hover:bg-[#33eaff] transition-colors"
          >
            Try TestGenie Now
          </button>
        </div>
      </main>
    </div>
  );
}
