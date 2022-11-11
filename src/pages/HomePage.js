import React, { Component } from "react";
import FeaturedStaticImage from "./home/FeaturedStaticImage";
import SearchBar from "../components/SearchBar";
import HomeStatement from "./home/HomeStatement";
import SiteTitle from "../components/SiteTitle";
import MultimediaSection from "./home/MultimediaSection";
import SiteSponsors from "./home/SiteSponsors";
import CollectionHighlights from "./home/CollectionHighlights";

import "../css/HomePage.scss";

class HomePage extends Component {
  getStyles = styles => {
    let titleStyle = {
      fontFamily: styles.titleFont || "crimson-text, serif",
      textTransform: styles.textStyle || "uppercase"
    };
    return titleStyle;
  };

  render() {
    let homeStatement = null;
    let staticImage = null;
    let mediaSection = null;
    let sponsors = null;
    let sponsorsStyle = null;
    let collectionHighlights = null;
    try {
      const homePageInfo = JSON.parse(this.props.site.homePage);
      homeStatement = homePageInfo["homeStatement"];
      staticImage = homePageInfo["staticImage"];
      mediaSection = homePageInfo["mediaSection"];
      sponsors = homePageInfo["sponsors"];
      sponsorsStyle = homePageInfo["sponsorsStyle"];
      collectionHighlights = homePageInfo["collectionHighlights"];
    } catch (error) {
      console.error("Error setting config property");
    }
    return (
      <>
        <SiteTitle siteTitle={this.props.site.siteTitle} pageTitle="Home" />
        <div className="home-wrapper">
          <div className="home-featured-image-wrapper">
            <FeaturedStaticImage staticImage={staticImage} />
            <div id="home-site-title-wrapper">
              <h1 style={this.getStyles(staticImage)}>
                {this.props.site.siteName}
              </h1>
            </div>
          </div>
          <div className="home-search-wrapper">
            <SearchBar
              view="gallery"
              searchField="title"
              q=""
              setPage={this.props.setPage}
            />
          </div>
          <HomeStatement homeStatement={homeStatement} />
          <div className="home-nav-links">
            <a href="/search">Browse All Case Studies</a>
            <a href="/collections">Browse Case Studies by Topic</a>
          </div>
          <MultimediaSection mediaSection={mediaSection} />
          <SiteSponsors sponsors={sponsors} style={sponsorsStyle} />
          <CollectionHighlights collectionHighlights={collectionHighlights} />
        </div>
      </>
    );
  }
}

export default HomePage;
