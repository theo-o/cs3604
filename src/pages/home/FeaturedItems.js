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
  }

  handleClick = group => {
    let start = (group - 1) * this.state.multiplier;
    let end = start + this.state.multiplier;
    this.setState({
      startIndex: start,
      endIndex: end
    });
  };

  displayItems = items => {
    items.forEach(item => (item.active = false));
    let end =
      this.state.endIndex < items.length ? this.state.endIndex : items.length;
    for (let i = this.state.startIndex; i < end; i++) {
      items[i].active = true;
    }
    return items;
  };

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
      let items = this.displayItems([...this.props.featuredItems]);
      const tiles = items.map((item, index) => {
        return (
          <FeaturedItem
            key={item.src}
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
        for (let i = 1; i <= count; i++) {
          controls.push(
            <button
              key={i}
              aria-label={`Slide group ${i}`}
              onClick={() => this.handleClick(i)}
              type="button"
              aria-disabled={
                this.state.startIndex === (i - 1) * this.state.multiplier
                  ? true
                  : false
              }
              aria-controls="slide-row"
            >
              <span
                className={
                  this.state.startIndex === (i - 1) * this.state.multiplier
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
