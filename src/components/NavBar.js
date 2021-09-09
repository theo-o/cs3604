import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class NavBar extends Component {
  buildListItems() {
    let listItems = [];
    let sitePageItems = JSON.parse(this.props.site.sitePages);

    const sitePages = {};
    Object.keys(sitePageItems)
      .sort()
      .forEach(function(key) {
        sitePages[key] = sitePageItems[key];
      });

    for (const [key, page] of Object.entries(sitePages)) {
      listItems.push(this.topLevelItem(key, page));
    }
    return listItems;
  }

  topLevelItem(key, page) {
    const hasChildClass = page.children ? "nav-item dropdown" : "nav-item";
    const link = page.children ? (
      <>
        <NavLink className="nav-link inline" to={page.local_url}>
          {page.text.toUpperCase()}
        </NavLink>
        <a
          id="navbarDropdownMenuLink"
          href="/about"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-label={`${page.text} menu`}
        >
          <i class="fa fa-chevron-down" aria-hidden="true"></i>
        </a>
      </>
    ) : (
      <NavLink className="nav-link" to={page.local_url}>
        {page.text.toUpperCase()}
      </NavLink>
    );
    const listItem = (
      <li key={page.text} className={hasChildClass}>
        {link}
        {this.childList(page)}
      </li>
    );
    return listItem;
  }

  childList(page) {
    let childList = <></>;
    if (page.children) {
      const ulID = `${page.text.toLowerCase()}_submenu`;
      const ariaLabel = `${page.text} Submenu`;
      childList = (
        <div className="dropdown-menu" id={ulID} aria-label={ariaLabel}>
          {this.childItems(page)}
        </div>
      );
    }
    return childList;
  }

  childItems(parentPage) {
    const parentKey = parentPage.text;
    let childItems = [];
    for (const [childKey, page] of Object.entries(parentPage.children)) {
      const liKey = `${parentKey}.${childKey}`;
      const item = (
        <NavLink
          className="dropdown-item"
          key={liKey}
          to={page.local_url}
          tabIndex="-1"
        >
          {page.text}
        </NavLink>
      );
      childItems.push(item);
    }
    return childItems;
  }

  render() {
    const additionalListItems = this.buildListItems();
    return (
      <nav
        className="navbar navbar-expand-md top-navbar bg-light"
        role="navigation"
        aria-label="Pages in Site"
      >
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink className="nav-link" to="/">
              HOME
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/collections">
              BROWSE COLLECTIONS
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/search">
              SEARCH
            </NavLink>
          </li>
          {additionalListItems}
        </ul>
      </nav>
    );
  }
}

export default NavBar;
