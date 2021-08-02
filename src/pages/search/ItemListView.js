import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { RenderItems, arkLinkFormatted } from "../../lib/MetadataRenderer";
import Thumbnail from "../../components/Thumbnail";
import "../../css/SearchResult.scss";
import { fetchLanguages } from "../../lib/fetchTools";

class ItemListView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      languages: null
    };
  }

  componentDidMount() {
    fetchLanguages(this, this.props.site, "abbr");
  }

  render() {
    const keyArray = [
      { field: "description", label: "Description" },
      { field: "tags", label: "Tags" },
      { field: "creator", label: "Creator" }
    ];
    if (this.state.languages !== null) {
      return (
        <div key={this.props.item.id} className="col-12 collection-entry">
          <NavLink
            to={`/${this.props.category}/${arkLinkFormatted(
              this.props.item.custom_key
            )}`}
          >
            <div className="collection-img">
              <Thumbnail
                item={this.props.item}
                category={this.props.category}
                label={this.props.label}
              />
            </div>
            <div className="collection-details">
              <h3>{this.props.item.title}</h3>
              <RenderItems
                keyArray={keyArray}
                item={this.props.item}
                languages={this.state.languages}
                site={this.props.site}
              />
            </div>
          </NavLink>
        </div>
      );
    } else {
      return <></>;
    }
  }
}
export default ItemListView;
