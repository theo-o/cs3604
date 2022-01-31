import React, { Component } from "react";
import CollectionMetadataSection from "../../components/CollectionMetadataSection";
import CollectionItemsLoader from "./CollectionItemsLoader";
import SocialButtons from "../../components/SocialButtons";
import { Accordion, Icon } from "semantic-ui-react";

class CollectionsListView extends Component {
  constructor() {
    super();
    this.state = {
      isSocialActive: true,
      isMetadataActive: true
    };
  }

  setValues = () => {
    if (window.innerWidth < 992) {
      this.setState({
        isSocialActive: false,
        isMetadataActive: false
      });
    }
  };

  componentDidMount() {
    this.setValues();
    window.addEventListener("resize", this.setValues);
  }

  render() {
    return (
      <div className="mid-content-row list-view row">
        <div className="col-12 col-lg-4 mb-5">
          <div className="social-buttons-wrapper-box">
            <Accordion>
              <Accordion.Title
                active={this.state.isSocialActive}
                index={0}
                onClick={() => {
                  this.setState(prevState => ({
                    isSocialActive: !prevState.isSocialActive
                  }));
                }}
              >
                <Icon name="dropdown" />
                Share
              </Accordion.Title>
              <Accordion.Content active={this.state.isSocialActive}>
                <SocialButtons
                  buttons={JSON.parse(this.props.site.siteOptions)}
                  url={window.location.href}
                  title={this.props.title}
                  media={this.props.media}
                  viewOption={this.props.viewOption}
                />
              </Accordion.Content>
            </Accordion>
          </div>
          <Accordion>
            <Accordion.Title
              active={this.state.isMetadataActive}
              index={0}
              onClick={() => {
                this.setState(prevState => ({
                  isMetadataActive: !prevState.isMetadataActive
                }));
              }}
              id="collection-details-section-header"
            >
              <Icon name="dropdown" />
              {this.props.metadataTitle}
            </Accordion.Title>
            <Accordion.Content active={this.state.isMetadataActive}>
              <CollectionMetadataSection
                key="collection-metadata-section"
                site={this.props.site}
                languages={this.props.languages}
                collection={this.props.collection}
                metadataTitle={this.props.metadataTitle}
                subCollectionDescription={this.props.subCollectionDescription}
                collectionCustomKey={this.props.collectionCustomKey}
                sectionsSizes={["col-12", "col-12"]}
                viewOption={this.props.viewOption}
              />
            </Accordion.Content>
          </Accordion>
        </div>
        <CollectionItemsLoader
          key="collection-items-section"
          parent={this.props.parent}
          collection={this.props.collection}
          updateCollectionArchives={this.props.updateCollectionArchives}
          sectionSize="col-12 col-lg-8"
          view={this.props.viewOption}
          site={this.props.site}
        />
      </div>
    );
  }
}

export default CollectionsListView;
