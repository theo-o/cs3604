import React, { Component } from "react";
import { getFile } from "../lib/fetchTools";

import "../css/AdditionalPages.scss";

class AdditionalPages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: ""
    };
  }

  componentDidMount() {
    let copyObj = JSON.parse(this.props.site.sitePages)[this.props.parentKey];
    if (copyObj.children && this.props.childKey) {
      copyObj = copyObj.children[this.props.childKey];
    }
    const copyUrl = copyObj.data_url;
    getFile(copyUrl, "html", this);
  }

  render() {
    return (
      <div
        className="additional-pages-wrapper"
        dangerouslySetInnerHTML={{ __html: this.state.copy }}
      ></div>
    );
  }
}

export default AdditionalPages;
