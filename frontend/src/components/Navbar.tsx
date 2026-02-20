import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  showBackButton?: boolean;
}

export default function Navbar({ showBackButton = false }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate('/');
  };

  const handleNavClick = (item: string) => {
    const routes: { [key: string]: string } = {
      'Generator': '/',
      'Subscription': '/subscription',
      'Docs': '/docs',
      'Templates': '/templates',
      'History': '/history'
    };
    
    navigate(routes[item]);
  };

  const getActiveItem = () => {
    const pathToItem: { [key: string]: string } = {
      '/': 'Generator',
      '/subscription': 'Subscription',
      '/docs': 'Docs',
      '/templates': 'Templates',
      '/history': 'History'
    };
    return pathToItem[location.pathname] || 'Generator';
  };

  return (
    <nav className="sticky top-0 z-[100] bg-[rgba(10,12,16,0.85)] backdrop-blur-[20px] border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {showBackButton ? (
          <button 
            onClick={handleBack}
            className="flex items-center gap-2.5 no-underline hover:opacity-80 transition-opacity"
          >
            <span className="text-xl">←</span>
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center text-lg">⚙</div>
            <span className="text-2xl font-extrabold text-text">Test<span className="text-accent">Genie</span></span>
          </button>
        ) : (
          <a href="#" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center text-lg">⚙</div>
            <span className="text-2xl font-extrabold text-text">Test<span className="text-accent">Genie</span></span>
          </a>
        )}
        <div className="flex gap-1">
          {['Generator', 'Subscription', 'Docs', 'Templates', 'History'].map(item => (
            <button 
              key={item} 
              className={`nav-pill ${item === getActiveItem() ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
