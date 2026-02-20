import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Templates() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-text font-sans">
      <Navbar />
      
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-4">Test Templates</h1>
          <p className="text-text-dim text-lg">Pre-built test templates for common scenarios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'API Endpoints', description: 'REST API test templates', icon: '🌐' },
            { title: 'Database Operations', description: 'CRUD operation tests', icon: '🗄️' },
            { title: 'Authentication', description: 'Auth and authorization tests', icon: '🔐' },
            { title: 'File Processing', description: 'File upload/download tests', icon: '📁' },
            { title: 'Data Validation', description: 'Input validation tests', icon: '✅' },
            { title: 'Error Handling', description: 'Exception handling tests', icon: '⚠️' }
          ].map((template, index) => (
            <div key={index} className="bg-bg-secondary rounded-xl border border-border p-6 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-4">{template.icon}</div>
              <h3 className="text-lg font-semibold text-text mb-2">{template.title}</h3>
              <p className="text-text-dim text-sm">{template.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-accent text-bg rounded-lg font-semibold hover:bg-[#33eaff] transition-colors"
          >
            Create Custom Test
          </button>
        </div>
      </main>
    </div>
  );
}
