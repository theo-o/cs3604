import React, { Component } from "react";
import Thumbnail from "../../components/Thumbnail";
import { NavLink } from "react-router-dom";
import { RenderItems, arkLinkFormatted } from "../../lib/MetadataRenderer";

import "../../css/CollectionsShowPage.scss";

class CollectionItemsList extends Component {
  render() {
    let retVal = null;
    if (this.props.items.length) {
      retVal = (
        <div
          className={
            this.props.view === "listView"
              ? "collection-items-list"
              : "collection-items-grid"
          }
          role="group"
          aria-roledescription="Collection items"
        >
          {this.props.items.map(item => {
            if (this.props.view === "listView") {
              return (
                <div key={item.identifier} className="collection-entry">
                  <NavLink to={`/archive/${arkLinkFormatted(item.custom_key)}`}>
                    <div className="collection-img">
                      <Thumbnail item={item} category="archive" />
                    </div>
                    <div className="collection-details">
                      <h3>{item.title}</h3>
                      <RenderItems
                        keyArray={[
                          { field: "description", label: "Description" }
                        ]}
                        item={item}
                        site={this.props.site}
                      />
                    </div>
                  </NavLink>
                </div>
              );
            } else {
              return (
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
              );
            }
          })}
        </div>
      );
    } else {
      retVal = <div></div>;
    }
    return retVal;
  }
}

export default CollectionItemsList;
