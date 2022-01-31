import React, { Component } from "react";
import {
  EmailShareButton,
  FacebookShareButton,
  PinterestShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  PinterestIcon,
  RedditIcon,
  TwitterIcon,
  WhatsappIcon
} from "react-share";
import "../css/SocialButtons.scss";

class SocialButtons extends Component {
  shareButtons = {
    Email: EmailShareButton,
    Facebook: FacebookShareButton,
    Pinterest: PinterestShareButton,
    Reddit: RedditShareButton,
    Twitter: TwitterShareButton,
    Whatsapp: WhatsappShareButton
  };

  shareIcons = {
    Email: EmailIcon,
    Facebook: FacebookIcon,
    Pinterest: PinterestIcon,
    Reddit: RedditIcon,
    Twitter: TwitterIcon,
    Whatsapp: WhatsappIcon
  };

  getButtons = () => {
    let buttons = this.props.buttons.socialMedia.map(item => {
      const Tag = this.shareButtons[item];
      const Icon = this.shareIcons[item];
      return (
        <Tag
          key={item}
          url={this.props.url}
          subject={this.props.title}
          children={this}
          media={this.props.media}
        >
          <Icon size={35} round />
        </Tag>
      );
    });
    return buttons;
  };

  render() {
    return this.props.buttons &&
      this.props.buttons.socialMedia &&
      this.props.buttons.socialMedia.length ? (
      <div className="social-buttons-section">
        <div className="line"></div>
        <h3 className={this.props.viewOption === "listView" ? "d-none" : ""}>
          Share
        </h3>
        {this.getButtons()}
      </div>
    ) : (
      <></>
    );
  }
}
export default SocialButtons;
