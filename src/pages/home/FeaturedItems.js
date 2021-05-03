import React, { Component } from "react";
import FeaturedItem from "./FeaturedItem";

import "../../css/FeaturedItems.scss";

class FeaturedItems extends Component {
  constructor() {
    super();
    this.state = {
      startIndex: 0,
      endIndex: 4,
      multiplier: 4
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(start, end) {
    this.setState({
      startIndex: start,
      endIndex: end
    });
  }

  setValues = () => {
    if (window.innerWidth >= 768) {
      if (this.state.startIndex % 4) {
        this.setState({
          startIndex: this.state.startIndex - 2,
          endIndex: this.state.startIndex + 2,
          multiplier: 4
        });
      } else {
        this.setState({
          endIndex: this.state.startIndex + 4,
          multiplier: 4
        });
      }
    } else {
      this.setState({
        endIndex: this.state.startIndex + 2,
        multiplier: 2
      });
    }
  };

  componentDidMount() {
    this.setValues();
    window.addEventListener("resize", this.setValues);
  }

  render() {
    if (this.props.featuredItems && this.props.featuredItems.length > 0) {
      const tiles = this.props.featuredItems
        .slice(this.state.startIndex, this.state.endIndex)
        .map((item, index) => {
          return (
            <FeaturedItem
              key={index}
              tile={item}
              position={this.state.startIndex + index + 1}
              length={this.props.featuredItems.length}
            />
          );
        });

      const Controls = () => {
        let controls = [];
        let count = Math.ceil(
          this.props.featuredItems.length / this.state.multiplier
        );
        for (let i = count; i > 0; i--) {
          controls.push(
            <button
              key={i}
              aria-label={`Slide group ${count - i + 1}`}
              onClick={() =>
                this.handleClick(
                  (count - i) * this.state.multiplier,
                  (count - i) * this.state.multiplier + this.state.multiplier
                )
              }
              type="button"
              aria-disabled={
                this.state.startIndex === (count - i) * this.state.multiplier
                  ? true
                  : false
              }
              aria-controls="slide-row"
            >
              <span
                className={
                  this.state.startIndex === (count - i) * this.state.multiplier
                    ? "dot dot-active"
                    : "dot"
                }
              ></span>
            </button>
          );
        }
        return controls;
      };

      return (
        <div
          className="featured-items-wrapper"
          role="region"
          aria-roledescription="carousel"
          aria-label="Our Featured Items"
        >
          <div className="featured-items-heading">
            <h2>Our Featured Items</h2>
          </div>
          <div
            className="row justify-content-center"
            id="slide-row"
            aria-live="off"
          >
            {tiles}
          </div>
          <div
            className="featured-items-indicators"
            role="group"
            aria-label="Choose slide group"
          >
            <Controls />
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  }
}
export default FeaturedItems;
