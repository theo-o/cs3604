import React, { Component } from "react";
import CollectionMetadataSection from "../../components/CollectionMetadataSection";
import CollectionItemsLoader from "./CollectionItemsLoader";
import SocialButtons from "../../components/SocialButtons";

class CollectionsListView extends Component {
  render() {
    return (
      <div className="mid-content-row list-view row">
        <div className="col-12 col-lg-4 mb-5">
          <div className="social-buttons-wrapper-box">
            <SocialButtons
              buttons={JSON.parse(this.props.site.siteOptions)}
              url={window.location.href}
              title={this.props.title}
              media={this.props.media}
            />
          </div>
          <CollectionMetadataSection
            key="collection-metadata-section"
            site={this.props.site}
            languages={this.props.languages}
            collection={this.props.collection}
            metadataTitle={this.props.metadataTitle}
            subCollectionDescription={this.props.subCollectionDescription}
            collectionCustomKey={this.props.collectionCustomKey}
            sectionsSizes={["col-12", "col-12"]}
          />
        </div>
        <CollectionItemsLoader
          key="collection-items-section"
          parent={this.props.parent}
          collection={this.props.collection}
          updateCollectionArchives={this.props.updateCollectionArchives}
          sectionSize="col-12 col-lg-8"
          view={this.props.view}
          site={this.props.site}
        />
      </div>
    );
  }
}

export default CollectionsListView;
