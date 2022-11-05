import React, { Component } from "react";
import SiteTitle from "../components/SiteTitle";
import ContactSection from "../components/ContactSection";
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
    let download = "";
    try {
      download = JSON.parse(this.props.site.sitePages)[this.props.parentKey]
        .assets.download;
    } catch (error) {
      console.log("no download link specified");
    }
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
          <UploadPage />
          <div
            className="col-md-8"
            role="region"
            aria-labelledby="permissions-heading"
          >
            <div
              className="terms-details"
              dangerouslySetInnerHTML={{ __html: this.state.copy }}
            ></div>
          </div>
          <div className="col-md-4 contact-section-wrapper">
            <ContactSection
              siteDetails={this.props.site}
              site={this.props.site}
            />
            {download ? (
              <div role="region" aria-labelledby="terms-downloads-section">
                <h2
                  className="terms-downloads-heading"
                  id="terms-downloads-section"
                >
                  Downloadable forms
                </h2>
                <a href={download}>Permission form for image reproductions</a>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }
}

export default CaseStudyUploadPage;
