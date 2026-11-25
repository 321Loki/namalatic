import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          Nest<span>Quest</span>
        </Link>
        <nav className="navbar__links">
          <NavLink to="/" end>
            Hotels
          </NavLink>
          <NavLink to="/hotels/new" className="btn btn-light btn-sm">
            + Add Hotel
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
