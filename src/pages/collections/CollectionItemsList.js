import React, { Component } from "react";
import Thumbnail from "../../components/Thumbnail";
import { arkLinkFormatted } from "../../lib/MetadataRenderer";

import "../../css/CollectionsShowPage.scss";

class CollectionItemsList extends Component {
  render() {
    let retVal = null;
    if (this.props.items.length) {
      retVal = (
        <div
          className="collection-items-grid"
          role="group"
          aria-roledescription="Collection items"
        >
          {this.props.items.map(item => (
            <div className="collection-item" key={item.identifier}>
              <div className="collection-item-wrapper">
                <a href={`/archive/${arkLinkFormatted(item.custom_key)}`}>
                  <div className="item-image">
                    <Thumbnail item={item} category="archive" />
                  </div>
                  <div className="item-info">
                    <h3>{item.title}</h3>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      retVal = <div></div>;
    }
    return retVal;
  }
}

export default CollectionItemsList;
