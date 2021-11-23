import React, { Component } from "react";
import SubCollectionsLoader from "../pages/collections/SubCollectionsLoader";
import { RenderItemsDetailed, addNewlineInDesc } from "../lib/MetadataRenderer";

import "../css/CollectionsShowPage.scss";

const TRUNCATION_LENGTH = 600;

class CollectionMetadataSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collection: null,
      collectionCustomKey: "",
      languages: null,
      descriptionTruncated: true,
      subDescriptionTruncated: true,
      description: "",
      title: "",
      thumbnail_path: "",
      creator: "",
      updatedAt: "",
      titleList: []
    };
    this.onMoreLessClick = this.onMoreLessClick.bind(this);
  }

  updateSubCollections(component, collection, subCollections) {
    collection.subCollection_total =
      subCollections != null ? subCollections.length : 0;
    component.setCollectionState(collection);
  }

  setCollectionState(collection) {
    this.setState({
      collection: collection
    });
  }

  subCollectionDescription() {
    let descriptionSection = <></>;
    let descriptionText = this.props.collection.description;

    if (descriptionText && this.state.subDescriptionTruncated) {
      descriptionText = descriptionText.substr(0, TRUNCATION_LENGTH);
    }
    if (this.props.collection.parent_collection && descriptionText) {
      descriptionSection = (
        <div className="collection-detail-description">
          <div className="collection-detail-key">Description</div>
          <div
            className={`collection-detail-value description ${
              this.state.subDescriptionTruncated ? "trunc" : "full"
            }`}
          >
            {addNewlineInDesc(descriptionText)}
            {this.moreLessButtons(descriptionText, "metadata")}
          </div>
        </div>
      );
    }
    return descriptionSection;
  }

  moreLessButtons(text, section) {
    let moreLess = <></>;
    if (text && text.length >= TRUNCATION_LENGTH) {
      moreLess = (
        <span>
          <button
            onClick={e => this.onMoreLessClick(section, e)}
            className="more"
            type="button"
            aria-controls="collection-description"
            aria-expanded="false"
          >
            . . .[more]
          </button>
          <button
            onClick={e => this.onMoreLessClick(section, e)}
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

  onMoreLessClick(section, e) {
    e.preventDefault();
    let key = "descriptionTruncated";
    if (section === "metadata") {
      key = "subDescriptionTruncated";
    }
    let truncated = true;
    if (this.state[key]) {
      truncated = false;
    }
    let stateObj = {};
    stateObj[key] = truncated;
    this.setState(stateObj, function() {
      this.render();
    });
  }

  render() {
    if (this.props.languages && this.props.collection) {
      return (
        <>
          <div
            className={`${this.props.sectionsSizes[0]} details-section`}
            role="region"
            aria-labelledby="collection-details-section-header"
          >
            <h2
              className="details-section-header"
              id="collection-details-section-header"
            >
              {this.props.metadataTitle}
            </h2>

            <div className="details-section-content-grid">
              {this.props.subCollectionDescription}
              <table aria-label="Collection Metadata">
                <tbody>
                  <RenderItemsDetailed
                    keyArray={
                      JSON.parse(this.props.site.displayedAttributes)[
                        "collection"
                      ]
                    }
                    item={this.props.collection}
                    languages={this.props.languages}
                    collectionCustomKey={this.props.collectionCustomKey}
                    type="table"
                    site={this.props.site}
                  />
                </tbody>
              </table>
            </div>
          </div>
          <div
            className={`${this.props.sectionsSizes[1]} subcollections-section`}
            role="region"
            aria-labelledby="collection-subcollections-section"
          >
            <SubCollectionsLoader
              parent={this}
              collection={this.props.collection}
              updateSubCollections={this.updateSubCollections}
            />
          </div>
        </>
      );
    } else {
      return null;
    }
  }
}

export default CollectionMetadataSection;
