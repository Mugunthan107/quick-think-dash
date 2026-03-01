import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: Page not found: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 relative z-10">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl font-semibold text-muted-foreground mb-2">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">The page <span className="font-mono text-accent">{location.pathname}</span> doesn't exist.</p>
        <Link
          to="/"
          className="text-accent font-semibold hover:underline underline-offset-4 transition-colors"
        >
          Return to Home →
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
