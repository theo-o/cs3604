import React, { Component } from "react";

class LoadingScreen extends Component {
  render() {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img
            alt="loading"
            className="loading-spinner"
            src="/images/loading.gif"
            focusable="false"
            aria-hidden="true"
          />
          <p>Loading</p>
        </div>
      </div>
    );
  }
}

export default LoadingScreen;
