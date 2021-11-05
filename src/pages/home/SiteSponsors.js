import React, { Component } from "react";
import { getImgUrl } from "../../lib/fetchTools";

import "../../css/SiteSponsors.scss";

class SiteSponsors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sponsorImgs: []
    };
  }

  componentDidMount() {
    if (this.props.sponsors && this.props.sponsors.length !== 0) {
      this.props.sponsors.map(sponsor => {
        return getImgUrl(sponsor.src).then(src => {
          const imgUrls = this.state.sponsorImgs.slice();
          imgUrls.push(src);
          this.setState({ sponsorImgs: imgUrls });
        });
      });
    }
  }

  render() {
    if (
      this.props.sponsors &&
      this.props.sponsors.length !== 0 &&
      this.props.sponsors.length === this.state.sponsorImgs.length
    ) {
      return (
        <div
          className={
            this.props.style
              ? `container home-sponsors-section sponsors-${this.props.style}`
              : "container home-sponsors-section"
          }
          role="region"
          aria-label="Sponsors"
        >
          <div className="row home-sponsors-wrapper">
            {this.props.sponsors.map((sponsor, index) => (
              <div
                key={index}
                className="col-6 col-md-4 col-lg-3 sponsor-wrapper"
              >
                <a
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={this.state.sponsorImgs[index]}
                    alt={sponsor.alt}
                    className="img-fluid"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default SiteSponsors;
