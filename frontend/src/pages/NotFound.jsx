import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function NotFound() {
  return (
    <div className="empty">
      <Helmet>
        <title>Page not found | StayFinder</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to hotels
      </Link>
    </div>
  );
}

export default NotFound;
