import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ScrollToTop from "./lib/ScrollToTop";
import { fetchSiteDetails } from "./lib/fetchTools";
import AnalyticsConfig from "./components/AnalyticsConfig";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { buildRoutes } from "./lib/CustomPageRoutes";
import HomePage from "./pages/HomePage";
import SiteAdmin from "./pages/admin/SiteAdmin";

import CollectionsListLoader from "./pages/collections/CollectionsListLoader";
import CollectionsShowLoader from "./pages/collections/CollectionsShowLoader";

import SearchLoader from "./pages/search/SearchLoader";
import ArchivePage from "./pages/archives/ArchivePage";
import { getSite } from "./lib/fetchTools";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      siteDetails: null,
      site: null,
      paginationClick: null
    };
  }

  async loadSite() {
    const site = await getSite();
    this.setState({ site: site });
  }

  setColor(color) {
    if (color) {
      document.documentElement.style.setProperty(
        "--themeHighlightColor",
        color
      );
    }
  }

  setPaginationClick(event) {
    this.setState({ paginationClick: event });
  }

  componentDidMount() {
    fetchSiteDetails(this, process.env.REACT_APP_REP_TYPE);
    this.loadSite();
  }

  render() {
    if (this.state.siteDetails && this.state.site) {
      this.setColor(this.state.siteDetails.siteColor);
      const customRoutes = buildRoutes(this.state.siteDetails, this.state.site);
      return (
        <Router>
          <AnalyticsConfig analyticsID={this.state.siteDetails.analyticsID} />
          <ScrollToTop paginationClick={this.state.paginationClick} />
          <Header
            siteDetails={this.state.siteDetails}
            site={this.state.site}
            location={window.location}
          />
          <main style={{ minHeight: "500px", padding: "1em 1em 0 1em" }}>
            <div id="content-wrapper" className="container p-0">
              <Switch>
                {customRoutes}
                <Route
                  path="/"
                  exact
                  render={props => (
                    <HomePage
                      siteDetails={this.state.siteDetails}
                      site={this.state.site}
                    />
                  )}
                />
                <Route
                  path="/collections"
                  exact
                  render={props => (
                    <CollectionsListLoader
                      scrollUp={this.setPaginationClick.bind(this)}
                      siteDetails={this.state.siteDetails}
                      site={this.state.site}
                    />
                  )}
                />
                <Route
                  path="/collection/:customKey"
                  render={props => (
                    <CollectionsShowLoader
                      siteDetails={this.state.siteDetails}
                      site={this.state.site}
                      customKey={props.match.params.customKey}
                    />
                  )}
                />
                <Route
                  path="/search"
                  exact
                  render={props => (
                    <SearchLoader
                      scrollUp={this.setPaginationClick.bind(this)}
                      siteDetails={this.state.siteDetails}
                      site={this.state.site}
                    />
                  )}
                />
                <Route
                  path="/archive/:customKey"
                  exact
                  render={props => (
                    <ArchivePage
                      siteDetails={this.state.siteDetails}
                      site={this.state.site}
                      customKey={props.match.params.customKey}
                    />
                  )}
                />
                <Route path="/siteAdmin" exact component={SiteAdmin} />
              </Switch>
            </div>
          </main>
          <Footer />
        </Router>
      );
    } else {
      return <div>Error fetching site details from config</div>;
    }
  }
}

export default App;
