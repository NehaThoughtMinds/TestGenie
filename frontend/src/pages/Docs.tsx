import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="h-screen text-text font-sans overflow-hidden">
      <Navbar />
      
      <main className="h-[calc(100vh-4rem)] max-w-[1280px] mx-auto px-6 py-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">Documentation</h1>
          <p className="text-text-dim">Learn how to use TestGenie effectively</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="text-xl font-semibold text-text mb-3">Getting Started</h2>
              <ul className="space-y-2 text-text-dim text-sm">
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

            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="text-xl font-semibold text-text mb-3">Supported Languages</h2>
              <div className="grid grid-cols-2 gap-2">
                {['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP'].map(lang => (
                  <div key={lang} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    <span className="text-text">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="text-xl font-semibold text-text mb-3">Test Categories</h2>
              <ul className="space-y-2 text-text-dim text-sm">
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

            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="text-xl font-semibold text-text mb-3">Features</h2>
              <ul className="space-y-2 text-text-dim text-sm">
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

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-accent text-bg rounded-lg font-semibold hover:bg-[#33eaff] transition-colors text-sm"
          >
            Try TestGenie Now
          </button>
        </div>
      </main>
    </div>
  );
}
