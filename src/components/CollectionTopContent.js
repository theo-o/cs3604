import React, { Component } from "react";
import { addNewlineInDesc } from "../lib/MetadataRenderer";

import { getFile } from "../lib/fetchTools";
import "../css/CollectionsShowPage.scss";

class CollectionTopContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptionTruncated: true,
      collectionThumbnail: ""
    };
  }

  getDescription() {
    let description = this.props.description;
    if (description && this.state.descriptionTruncated) {
      description = description.substr(0, this.props.TRUNCATION_LENGTH);
    }
    return addNewlineInDesc(description);
  }

  moreLessButtons(text) {
    let moreLess = <></>;
    if (text && text.length >= this.props.TRUNCATION_LENGTH) {
      moreLess = (
        <span>
          <button
            onClick={e => this.onMoreLessClick(e)}
            className="more"
            type="button"
            aria-controls="collection-description"
            aria-expanded="false"
          >
            . . .[more]
          </button>
          <button
            onClick={e => this.onMoreLessClick(e)}
            className="less"
            type="button"
            aria-controls="collection-description"
            aria-expanded="true"
          >
            . . .[less]
          </button>
        </span>
      );
    }
    return moreLess;
  }

  onMoreLessClick(e) {
    e.preventDefault();
    let truncated = true;
    if (this.state.descriptionTruncated) {
      truncated = false;
    }
    this.setState({ descriptionTruncated: truncated }, function() {
      this.render();
    });
  }

  creatorDates(creator) {
    if (creator) {
      return <span className="creator">Created by: {creator}</span>;
    } else {
      return <span></span>;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.collectionImg !== prevProps.collectionImg) {
      getFile(this.props.collectionImg, "image", this, "collectionThumbnail");
    }
  }

  componentDidMount() {
    if (this.props.collectionImg) {
      getFile(this.props.collectionImg, "image", this, "collectionThumbnail");
    }
  }

  render() {
    return (
      <div
        className="top-content-row row"
        role="region"
        aria-labelledby="collection-page-title"
      >
        <div className="collection-img-col col-sm-4">
          <img src={this.state.collectionThumbnail} alt="" />
        </div>
        <div className="collection-details-col col-sm-8">
          <h1 className="collection-title" id="collection-page-title">
            {this.props.collectionTitle}
          </h1>
          <div className="post-heading">
            {this.creatorDates(this.props.creator)}
            <span className="last-updated">
              Last updated: {new Date(this.props.updatedAt).toString()}
            </span>
          </div>
          <div
            className={`description ${
              this.state.descriptionTruncated ? "trunc" : "full"
            }`}
            id="collection-description"
          >
            <div>
              <h2 className="introduction">Introduction</h2>
              {this.getDescription()}{" "}
              {this.moreLessButtons(this.props.description)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CollectionTopContent;
