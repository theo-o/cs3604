import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../graphql/queries";
import { arkLinkFormatted } from "../lib/MetadataRenderer";
import { NavLink } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Thumbnail from "./Thumbnail.js";
import "../css/RelatedItems.scss";

class RelatedItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: null
    };
  }

  async getItems(collection_id, item_limit) {
    const items = await API.graphql(
      graphqlOperation(queries.searchArchives, {
        filter: {
          heirarchy_path: { eq: collection_id },
          visibility: { eq: true }
        },
        sort: {
          field: "identifier",
          direction: "asc"
        },
        limit: item_limit
      })
    );
    return items.data.searchArchives.items;
  }

  formatArray(item_list) {
    let uniqueItems = item_list
      .filter(
        (item, index, array) => array.findIndex(i => i.id === item.id) === index
      )
      .filter(value => value.identifier !== this.props.collection.identifier);
    return uniqueItems;
  }

  async buildList() {
    let i = this.props.collection.heirarchy_path.length - 1;
    let item_list = [];
    let limit = 11;
    while (item_list.length < 10 && i >= 0) {
      let collection_id = this.props.collection.heirarchy_path[i];
      let collection_items = await this.getItems(collection_id, limit);
      item_list.push(...collection_items);
      item_list = this.formatArray(item_list);
      i--;
      limit = limit + 10;
    }
    if (item_list.slice(0, 10).length > 0) {
      this.setState({
        items: item_list.slice(0, 10)
      });
    }
  }

  componentDidMount() {
    this.buildList();
  }

  render() {
    if (this.state.items != null) {
      const featuredItems = this.state.items.map((item, idx) => {
        return (
          <div key={item.custom_key}>
            <NavLink to={`/archive/${arkLinkFormatted(item.custom_key)}`}>
              <div className="card">
                <Thumbnail
                  item={item}
                  className={"card-img-top"}
                  altText={item.title}
                />
                <div className="card-body">
                  <h4 className="card-title crop-text-4">{item.title}</h4>
                </div>
              </div>
            </NavLink>
          </div>
        );
      });

      var settings = {
        dots: false,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        swipeToSlide: true,
        responsive: [
          {
            breakpoint: 500,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1
            }
          }
        ]
      };

      return (
        <div
          className="related-items-wrapper"
          role="region"
          aria-roledescription="carousel"
          aria-label="Related Items"
        >
          <div className="related-items-heading">
            <h2>Related Items</h2>
          </div>
          <Slider {...settings}>{featuredItems}</Slider>
        </div>
      );
    } else {
      return <></>;
    }
  }
}
export default RelatedItems;
