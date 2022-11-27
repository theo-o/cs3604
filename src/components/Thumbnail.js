import React, { Component } from "react";

import { getFile } from "../lib/fetchTools";
import "../css/Thumbnail.scss";

class Thumbnail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      thumbnailImg: null
    };
  }

  labelDisplay() {
    if (this.props.label) {
      return (
        <div className={`${this.props.category}-label`}>
          {this.props.category === "collection" ? "Collection" : "Item"}
        </div>
      );
    } else {
      return <></>;
    }
  }



  componentDidMount() {
    const imgUrl = this.props.imgURL || this.props.item.thumbnail_path;

    if (imgUrl) {
      getFile(imgUrl, "image", this, "thumbnailImg");
    }
  }

  render() {
    return (
      <div className="image-container">
        {this.labelDisplay()}
        <img
          className={this.props.className}
          src={this.state.thumbnailImg}
          alt={this.props.altText ? this.props.item.title : ""}
        />
      </div>
    );
  }
}

export default Thumbnail;
