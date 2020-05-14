import React from 'react';
import { NavLink } from 'react-router-dom';
import { withUser } from './Auth/withUser';
import apiHandler from '../api/apiHandler';

import '../styles/NavBar.scss';

const NavBar = (props) => {
  const { context } = props;

  function handleLogout() {
    apiHandler
      .logout()
      .then(() => {
        context.removeUser();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <nav className="Nav">
      <NavLink className="Nav__link" exact to="/">
        <h3 className="Nav__logo">
          Shark <br></br> Attack
        </h3>
        <span role="img" aria-label="shark-emoji">
          🦈
        </span>
      </NavLink>
      <ul className="Nav__list">
        <li className="Nav__item">
          <NavLink className="Nav__link" to="/profile">
            <img src="media/avatar.png" alt="avatar" />
          </NavLink>
        </li>
        {context.isLoggedIn && (
          <React.Fragment>
            <li className="Nav__item">
              <NavLink className="Nav__link" to="/profile">
                {context.user && context.user.email}
              </NavLink>
            </li>
            <li className="Nav__item">
              <p onClick={handleLogout}>Logout</p>
            </li>
          </React.Fragment>
        )}
        {!context.isLoggedIn && (
          <React.Fragment>
            <li className="Nav__item">
              <NavLink className="Nav__link" to="/signin">
                Log in
              </NavLink>
            </li>
            <li className="Nav__item">
              <NavLink to="/signup">Create account</NavLink>
            </li>
          </React.Fragment>
        )}
      </ul>
    </nav>
  );
};

export default withUser(NavBar);
