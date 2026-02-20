import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-text font-sans">
      <Navbar />
      
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-4">Test History</h1>
          <p className="text-text-dim text-lg">View and manage your previously generated test cases</p>
        </div>

        <div className="bg-bg-secondary rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-2xl text-accent mx-auto mb-4">
            📋
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">No Test History Yet</h3>
          <p className="text-text-dim mb-6">Start generating tests to see your history here</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-accent text-bg rounded-lg font-semibold hover:bg-[#33eaff] transition-colors"
          >
            Generate Tests
          </button>
        </div>
      </main>
    </div>
  );
}
