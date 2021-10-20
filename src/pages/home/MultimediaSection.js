import React, { Component } from "react";

import "../../css/MultimediaSection.scss";

class MultimediaSection extends Component {
  hasMediaSection() {
    return !!(
      this.props.mediaSection &&
      this.props.mediaSection.link &&
      this.props.mediaSection.mediaEmbed &&
      this.props.mediaSection.title &&
      this.props.mediaSection.text
    );
  }

  render() {
    if (this.hasMediaSection()) {
      return (
        <div
          className="row media-section-wrapper"
          role="region"
          aria-labelledby="multimedia-region"
        >
          <div className="col-lg-6">
            <div
              className="multimedia-column"
              dangerouslySetInnerHTML={{
                __html: this.props.mediaSection.mediaEmbed
              }}
            ></div>
          </div>
          <div className="col-lg-6">
            <div className="multimedia-text-column">
              <div className="media-section-title-wrapper">
                <h2 id="multimedia-region">{this.props.mediaSection.title}</h2>
              </div>
              <div className="media-section-divider"></div>
              <p className="media-section-text">
                {this.props.mediaSection.text}
              </p>
              <a
                className="media-section-link"
                href={this.props.mediaSection.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default MultimediaSection;
