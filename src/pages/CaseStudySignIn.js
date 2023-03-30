import React, { Component } from "react";
import SiteTitle from "../components/SiteTitle";
import UploadSection from "../components/UploadSection";
import { getFile } from "../lib/fetchTools";

import "../css/TermsPage.scss";
class CaseStudySignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: ""
    };
  }

  componentDidMount() {
    const htmlUrl = JSON.parse(this.props.site.sitePages)[this.props.parentKey]
      .data_url;
    getFile(htmlUrl, "html", this);
  }

  signIn() {
    const authConfig = Auth.configure();
    const {
      domain,
      redirectSignIn,
      redirectSignOut,
      responseType
    } = authConfig.oauth;

    const clientId = config.AWS_COGNITO_CLIENT_ID;
    const url = `https://${domain}/oauth2/authorize?identity_provider=${config.AWS_COGNITO_IDP_NAME}&redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

    console.log("Signin.signIn() sign url: ", url);
    // Launch hosted UI
    window.location.assign(url);
  }

  render() {
    return (
      <>
        <div className="row terms-page-wrapper">
          <div className="col-12 terms-heading">
            <SiteTitle
              siteTitle={this.props.site.siteTitle}
              pageTitle="Permissions"
            />
            <h1 id="permissions-heading">Case Study Sign In</h1>
          </div>
          <div className="col-12 upload-section">
            <Button content="Signin" onClick={this.signIn} />
          </div>
        </div>
      </>
    );
  }
}

export default CaseStudyUploadPage;
