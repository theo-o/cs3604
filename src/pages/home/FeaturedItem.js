import React, { Component } from "react";
import { getFile } from "../../lib/fetchTools";

class FeaturedItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: null
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.tile && this.props !== prevProps) {
      const imgUrl = this.props.tile.src;
      getFile(imgUrl, "image", this);
    }
  }

  render() {
    if (this.props.tile && this.state.copy) {
      return (
        <div
          className="col-md-6 col-lg-3"
          role="group"
          aria-roledescription="slide"
          aria-label={`${this.props.position} of ${this.props.length}`}
          style={
            this.props.tile.active ? { display: "block" } : { display: "none" }
          }
        >
          <a href={this.props.tile.link}>
            <div className="card">
              <img className="card-img-top" src={this.state.copy} alt="" />
              <div className="card-body">
                <h3 className="card-title crop-text-4">
                  {this.props.tile.cardTitle}
                </h3>
              </div>
            </div>
          </a>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default FeaturedItem;
