import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ScrollToTop from "./lib/ScrollToTop";
import RouteListener from "./lib/RouteListener";
import AnalyticsConfig from "./components/AnalyticsConfig";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import { buildRoutes } from "./lib/CustomPageRoutes";
import HomePage from "./pages/HomePage";
import SiteAdmin from "./pages/admin/SiteAdmin";
import PodcastDeposit from "./pages/admin/PodcastDeposit";

import CollectionsListLoader from "./pages/collections/CollectionsListLoader";
import CollectionsShowPage from "./pages/collections/CollectionsShowPage";

import SearchLoader from "./pages/search/SearchLoader";
import ArchivePage from "./pages/archives/ArchivePage";
import { getSite } from "./lib/fetchTools";

import "./App.scss";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      site: null,
      paginationClick: null,
      path: "",
      isLoading: true
    };
  }

  setPathname(pathName, context) {
    context.setState({ path: pathName });
  }

  async loadSite() {
    const site = await getSite();
    this.setState({
      site: site,
      isLoading: false
    });
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
    this.loadSite();
  }

  render() {
    if (!this.state.isLoading && this.state.site) {
      this.setColor(this.state.site.siteColor);
      const customRoutes = buildRoutes(this.state.site);
      return (
        <Router>
          <RouteListener setPathname={this.setPathname} context={this} />
          <AnalyticsConfig analyticsID={this.state.site.analyticsID} />
          <ScrollToTop paginationClick={this.state.paginationClick} />
          <Header
            site={this.state.site}
            location={window.location}
            path={this.state.path}
          />
          <main style={{ minHeight: "500px", padding: "1em 1em 0 1em" }}>
            <div className="container p-0">
              <NavBar site={this.state.site} />
            </div>
            <div id="content-wrapper" className="container p-0">
              <Switch>
                {customRoutes}
                <Route
                  path="/"
                  exact
                  render={props => <HomePage site={this.state.site} />}
                />
                <Route
                  path="/collections"
                  exact
                  render={props => (
                    <CollectionsListLoader
                      scrollUp={this.setPaginationClick.bind(this)}
                      site={this.state.site}
                    />
                  )}
                />
                <Route
                  path="/collection/:customKey"
                  render={props => (
                    <CollectionsShowPage
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
                      site={this.state.site}
                    />
                  )}
                />
                <Route
                  path="/archive/:customKey"
                  exact
                  render={props => (
                    <ArchivePage
                      site={this.state.site}
                      customKey={props.match.params.customKey}
                    />
                  )}
                />
                <Route path="/siteAdmin" exact component={SiteAdmin} />
                <Route
                  path="/podcastDeposit"
                  exact
                  component={PodcastDeposit}
                />
              </Switch>
            </div>
          </main>
          <Footer />
        </Router>
      );
    } else {
      return <LoadingScreen />;
    }
  }
}

export default App;
