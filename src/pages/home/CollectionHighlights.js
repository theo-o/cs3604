import React, { Component } from "react";
import { getImgUrl } from "../../lib/fetchTools";

import "../../css/CollectionHighlights.scss";

class CollectionHighlights extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightImgs: []
    };
  }

  componentDidMount() {
    if (this.props.collectionHighlights) {
      this.props.collectionHighlights.map(item => {
        return getImgUrl(item.src).then(src => {
          const imgUrls = this.state.highlightImgs.slice();
          imgUrls.push(src);
          this.setState({ highlightImgs: imgUrls });
        });
      });
    }
  }

  render() {
    if (
      this.props.collectionHighlights &&
      this.props.collectionHighlights.length > 0 &&
      this.props.collectionHighlights.length === this.state.highlightImgs.length
    ) {
      const tiles = this.props.collectionHighlights.map((item, index) => {
        return (
          <div
            className="col-md-6 col-lg-3"
            key={index}
            role="group"
            aria-roledescription="category card"
          >
            <a href={item.link}>
              <div
                className="category-container"
                style={{
                  backgroundImage: `url(${this.state.highlightImgs[index]})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }}
              >
                <div className="category-details">
                  <span>{item.itemCount}</span>
                  <h3>{item.title}</h3>
                </div>
                <div className="category-link">
                  <p>
                    Explore<i className="fal fa-arrow-right"></i>
                  </p>
                </div>
              </div>
            </a>
          </div>
        );
      });

      return (
        <div
          className="collection-highlights-wrapper"
          role="region"
          aria-roledescription="Collection highlights"
          aria-label="Collection Highlights"
        >
          <div className="collection-highlights-heading">
            <h2>Collection Highlights</h2>
          </div>
          <div className="row justify-content-center">{tiles}</div>
        </div>
      );
    } else {
      return <> </>;
    }
  }
}

export default CollectionHighlights;
