import React, { Component } from "react";
import { API, Auth } from "aws-amplify";
import * as mutations from "../../graphql/mutations";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import { getSite } from "../../lib/fetchTools";
import SiteForm from "./SiteForm";
import SitePagesForm from "./SitePagesForm";
import ContentUpload from "./ContentUpload";
import HomepageForm from "./HomepageForm";
import SearchPageForm from "./SearchPageForm";
import BrowseCollectionsForm from "./BrowseCollectionsForm";
import DisplayedAttributesForm from "./DisplayedAttributesForm";
import MediaSectionForm from "./MediaSectionForm";
import IdentifierForm from "./ArchiveCollectionEdit/IdentifierForm";
import SiteContext from "./SiteContext";
import PodcastDeposit from "./PodcastDeposit";

import "../../css/SiteAdmin.scss";

class SiteAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorized: false,
      form: "site",
      site: null,
      groups: [],
      userEmail: ""
    };
  }

  async checkGroup() {
    try {
      const data = await Auth.currentUserPoolUser();
      const groups =
        data.signInUserSession.accessToken.payload["cognito:groups"];
      this.setState({ groups: groups });
      this.setState({ userEmail: data.attributes.email });
      const repo_type = process.env.REACT_APP_REP_TYPE;
      if (
        groups &&
        groups.indexOf(repo_type) !== -1 &&
        groups.indexOf("SiteAdmin") !== -1
      ) {
        this.setAuthorized(true);
      } else {
        this.setAuthorized(false);
      }
    } catch (err) {
      console.log("error: ", err);
      this.setAuthorized(false);
    }
  }

  async loadSite() {
    try {
      const site = await getSite();
      this.setState({ site: site });
    } catch (e) {
      console.error("Error fetch site config");
    }
  }

  setAuthorized(authorized) {
    this.setState({ authorized: authorized });
  }

  setForm = form => {
    this.setState({ form: form });
  };

  getForm = () => {
    const formProps = {
      site: this.state.site,
      updateSite: this.updateSiteHandler
    };
    switch (this.state.form) {
      case "site":
        return <SiteForm />;
      case "contentUpload":
        return <ContentUpload {...formProps} />;
      case "sitePages":
        return <SitePagesForm {...formProps} />;
      case "homepage":
        return <HomepageForm {...formProps} />;
      case "searchPage":
        return <SearchPageForm {...formProps} />;
      case "browseCollections":
        return <BrowseCollectionsForm {...formProps} />;
      case "displayedAttributes":
        return <DisplayedAttributesForm />;
      case "mediaSection":
        return <MediaSectionForm />;
      case "updateArchive":
        return <IdentifierForm type="archive" identifier={null} />;
      case "collectionForm":
        return <IdentifierForm type="collection" identifier={null} />;
      case "podcastDeposit":
        return <PodcastDeposit />;
      default:
        return <SiteForm />;
    }
  };

  updateSiteHandler = async (updateEvent, field = null, content = null) => {
    if (field) {
      this.setState(prevState => {
        return {
          site: { ...prevState.site, [field]: content }
        };
      });
      const siteConfig = {
        id: this.state.site.id,
        [field]: content
      };
      await API.graphql({
        query: mutations.updateSite,
        variables: { input: siteConfig },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
    }

    const historyInfo = {
      groups: this.state.groups,
      userEmail: this.state.userEmail,
      siteID: this.state.site.id,
      event: JSON.stringify(updateEvent)
    };
    await API.graphql({
      query: mutations.createHistory,
      variables: { input: historyInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
  };

  componentDidMount() {
    this.checkGroup();
    this.loadSite();
  }

  render() {
    return (
      <div className="row admin-wrapper">
        <div className="col-lg-3 col-sm-12 admin-sidebar">
          <ul>
            <li className={this.state.form === "site" ? "admin-active" : ""}>
              <Link onClick={() => this.setForm("site")} to={"/siteAdmin"}>
                General Site Config
              </Link>
            </li>
            <li
              className={this.state.form === "sitePages" ? "admin-active" : ""}
            >
              <Link onClick={() => this.setForm("sitePages")} to={"/siteAdmin"}>
                Site Pages Config
              </Link>
            </li>
            <li
              className={
                this.state.form === "contentUpload" ? "admin-active" : ""
              }
            >
              <Link
                onClick={() => this.setForm("contentUpload")}
                to={"/siteAdmin"}
              >
                Upload Site Content
              </Link>
            </li>
            <li
              className={this.state.form === "homepage" ? "admin-active" : ""}
            >
              <Link onClick={() => this.setForm("homepage")} to={"/siteAdmin"}>
                Homepage Config
              </Link>
            </li>
            <li
              className={this.state.form === "searchPage" ? "admin-active" : ""}
            >
              <Link
                onClick={() => this.setForm("searchPage")}
                to={"/siteAdmin"}
              >
                Search Page Config
              </Link>
            </li>
            <li
              className={
                this.state.form === "browseCollections" ? "admin-active" : ""
              }
            >
              <Link
                onClick={() => this.setForm("browseCollections")}
                to={"/siteAdmin"}
              >
                Browse Collections Page
              </Link>
            </li>
            <li
              className={
                this.state.form === "displayedAttributes" ? "admin-active" : ""
              }
            >
              <Link
                onClick={() => this.setForm("displayedAttributes")}
                to={"/siteAdmin"}
              >
                Displayed Attributes
              </Link>
            </li>
            <li
              className={
                this.state.form === "mediaSection" ? "admin-active" : ""
              }
            >
              <Link
                onClick={() => this.setForm("mediaSection")}
                to={"/siteAdmin"}
              >
                Homepage media section
              </Link>
            </li>
            <li
              className={
                this.state.form === "updateArchive" ? "admin-active" : ""
              }
            >
              <Link
                onClick={() => this.setForm("updateArchive")}
                to={"/siteAdmin"}
              >
                New / Update Item
              </Link>
            </li>
            <li
              className={`collectionFormLink ${
                this.state.form === "collectionForm" ? " admin-active" : ""
              }`}
            >
              <Link
                onClick={() => this.setForm("collectionForm")}
                to={"/siteAdmin"}
              >
                New / Update Collection
              </Link>
            </li>
            {this.state.site && this.state.site.siteId === "podcasts" && (
              <li
                className={
                  this.state.form === "podcastDeposit" ? "admin-active" : ""
                }
              >
                <Link
                  onClick={() => this.setForm("podcastDeposit")}
                  to={"/siteAdmin"}
                >
                  Add Podcast Episode
                </Link>
              </li>
            )}
          </ul>
          <hr className="auth-divider" />
          <Authenticator>
            {({ signOut, user }) => (
              <div className="auth-dialog">
                <p>{user.username} successfully logged in.</p>
                <button onClick={signOut}>Sign out</button>
              </div>
            )}
          </Authenticator>
        </div>
        <SiteContext.Provider
          value={{
            site: this.state.site,
            updateSite: this.updateSiteHandler
          }}
        >
          {this.state.authorized && this.state.site ? (
            this.getForm()
          ) : (
            <h1>"Not authorized to access this page!"</h1>
          )}
        </SiteContext.Provider>
      </div>
    );
  }
}

export default withAuthenticator(SiteAdmin);
