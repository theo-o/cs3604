import React, { Component } from "react";
import SiteNavigationLinks from "./SiteNavigationLinks";
import HeaderBreadcrumbs from "./HeaderBreadcrumbs";

class Header extends Component {
  onNavClick() {
    window.navToggle();
  }
  onAccessClick() {
    window.accessToggle();
  }
  render() {
    return (
      <div id="vt_theme_one" className="vt-home norightcol home-page">
        <header className="header">
          <nav aria-label="Skip Links">
            <ul className="vt-skip-nav">
              <li className="vt-skip-navItem">
                <a className="vt-skip-navLink" href="#vt_main">
                  Skip to main content
                </a>
              </li>
            </ul>
          </nav>

          <div className="row vt-one-headerRow">
            <div className="col header-col">
              <div id="vt_logo" className="vt-logo">
                <a href="https://lib.vt.edu/" className="vt-logo-link">
                  <img
                    alt=""
                    className="vt-logo-image"
                    src="https://www.assets.cms.vt.edu/images/maroonVTonWhite.svg"
                    focusable="false"
                    aria-hidden="true"
                  />

                  <span
                    className="vt-logo-divider"
                    focusable="false"
                    aria-hidden="true"
                  ></span>
                  <span className="vt-logo-text">University Libraries</span>
                </a>
              </div>
              {/*
                <!-- ///////////////////////////////////////////// -->
                <!-- MAIN NAVIGATION -->
                <!-- ///////////////////////////////////////////// -->
              */}
              <nav className="col" id="vt_nav" aria-label="Site Menu">
                <div className="linkWrapper">
                  <button
                    className="vt-nav-toggle"
                    aria-controls="vt_offcanvas_nav"
                    aria-expanded="false"
                    onClick={this.onNavClick}
                  >
                    <span className="vt-nav-toggleLabel">Menu</span>
                    <svg
                      className="svg-inline--fa fa-bars fa-w-14 menu-open"
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      data-prefix="far"
                      data-icon="bars"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      data-fa-i2svg=""
                    >
                      <path
                        fill="currentColor"
                        d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"
                      ></path>
                    </svg>
                    {/* <span className="far fa-bars menu-open" aria-hidden="true" focusable="false" role="presentation"></span>*/}
                    <svg
                      className="svg-inline--fa fa-times fa-w-10 menu-close d-none"
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      data-prefix="far"
                      data-icon="times"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                      data-fa-i2svg=""
                    >
                      <path
                        fill="currentColor"
                        d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"
                      ></path>
                    </svg>
                    {/* <span className="far fa-times menu-close d-none" aria-hidden="true" focusable="false" role="presentation"></span> */}
                  </button>
                </div>
                <div
                  id="vt_offcanvas_nav"
                  aria-label="Main Menu Drawer"
                  aria-hidden="true"
                  tabIndex="-1"
                >
                  <ol
                    id="vt_parent_org"
                    className="vt-parent-org"
                    aria-label="Parent Organization and Current Site"
                  >
                    <li className="vt-currentSiteTitle">
                      <a
                        className="vt-currentSiteTitle-link"
                        href="https://lib.vt.edu/"
                        tabIndex="-1"
                      >
                        University Libraries
                      </a>
                    </li>
                  </ol>

                  <SiteNavigationLinks site={this.props.site} />
                </div>
              </nav>
            </div>
          </div>
          {/* !-- end vt_nav --> */}
          {/*
                    <!-- ///////////////////////////////////////////// -->
                    <!-- END MAIN NAVIGATION -->
                    <!-- ///////////////////////////////////////////// -->
                  */}
        </header>
        {/* <!-- end vt-one-headerRow --> */}
        {/*
          <!-- ///////////////////////////////////////////// -->
          <!-- END HEADER -->
          <!-- ///////////////////////////////////////////// -->
        */}
        <nav aria-label="Page Context" className="vt-page-path row">
          <div className="gateway">
            <HeaderBreadcrumbs
              site={this.props.site}
              location={this.props.location}
            />
          </div>
        </nav>
      </div>
    );
  }
}

export default Header;
