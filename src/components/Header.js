import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <ul className="nav-links">
          <li><Link to="/users">User Management</Link></li>
          <li><Link to="/products">Product Management</Link></li>
          <li><Link to="/reviews">Review Management</Link></li>
          <li><Link to="/statistics">Statistics</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
