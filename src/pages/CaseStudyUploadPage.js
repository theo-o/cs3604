import React, { Component } from "react";
import SiteTitle from "../components/SiteTitle";
import UploadSection from "../components/UploadSection";
import { getFile } from "../lib/fetchTools";

import "../css/TermsPage.scss";
class CaseStudyUploadPage extends Component {
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

  render() {
    return (
      <>
        <div className="row terms-page-wrapper">
          <div className="col-12 terms-heading">
            <SiteTitle
              siteTitle={this.props.site.siteTitle}
              pageTitle="Permissions"
            />
            <h1 id="permissions-heading">Case Study Student Upload</h1>
          </div>
          <UploadSection />
        </div>
      </>
    );
  }
}

export default CaseStudyUploadPage;
