import React, { Component } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Form } from "semantic-ui-react";
import { getSite } from "../../lib/fetchTools";
import { updatedDiff } from "deep-object-diff";
import { API, Auth } from "aws-amplify";
import * as mutations from "../../graphql/mutations";

const initialFormState = {
  link: "",
  mediaEmbed: "",
  title: "",
  text: ""
};

class MediaSectionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "view",
      site: null
    };
  }

  async loadSite() {
    const site = await getSite();
    if (site && site.homePage) {
      const homePage = JSON.parse(site.homePage);
      if (homePage.mediaSection) {
        const mediaSection = homePage.mediaSection;
        let siteInfo = {};
        try {
          siteInfo = {
            link: mediaSection.link || "",
            mediaEmbed: mediaSection.mediaEmbed || "",
            title: mediaSection.title || false,
            text: mediaSection.text || ""
          };
        } catch (error) {
          console.error(error);
        }

        this.setState({
          formState: siteInfo,
          prevFormState: siteInfo,
          site: site
        });
      }
    }
  }

  updateInputValue = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState(prevState => {
      return {
        formState: { ...prevState.formState, [name]: value }
      };
    });
  };

  handleSubmit = async () => {
    this.setState({ viewState: "view" });
    const siteID = this.state.site.id;
    let homePage = JSON.parse(this.state.site.homePage);
    homePage.mediaSection = this.state.formState;
    let siteInfo = { id: siteID, homePage: JSON.stringify(homePage) };
    await API.graphql({
      query: mutations.updateSite,
      variables: { input: siteInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
    const newData = updatedDiff(this.state.prevFormState, this.state.formState);
    const oldData = updatedDiff(this.state.formState, this.state.prevFormState);
    const eventInfo = Object.keys(newData).reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          old: oldData[key],
          new: newData[key]
        }
      };
    }, {});
    const userInfo = await Auth.currentUserPoolUser();
    let historyInfo = {
      groups: userInfo.signInUserSession.accessToken.payload["cognito:groups"],
      userEmail: userInfo.attributes.email,
      siteID: siteID,
      event: JSON.stringify(eventInfo)
    };

    await API.graphql({
      query: mutations.createHistory,
      variables: { input: historyInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
  };

  handleChange = (e, { value }) => {
    this.setState({ viewState: value });
  };

  clearValues = event => {
    event.preventDefault();
    this.setState({
      formState: initialFormState
    });
  };

  editForm = () => {
    return (
      <div>
        <h2>{`Edit Homepage Media Section Top with SiteId: ${process.env.REACT_APP_REP_TYPE.toLowerCase()}`}</h2>
        <Form id="homepage-media-form">
          <section className="homepage-media-section">
            <h3>Homepage Media Section</h3>
            <Form.Input
              label="Link"
              value={this.state.formState.link}
              name="link"
              placeholder="Enter Link"
              onChange={this.updateInputValue}
            />
            <Form.TextArea
              label="Media Embed"
              value={this.state.formState.mediaEmbed}
              name="mediaEmbed"
              placeholder="Enter media embed"
              onChange={this.updateInputValue}
            />
            <Form.Input
              label="Title"
              value={this.state.formState.title}
              name="title"
              placeholder="Enter Title"
              onChange={this.updateInputValue}
            />
            <Form.Input
              label="Text"
              value={this.state.formState.text}
              name="text"
              placeholder="Enter Text"
              onChange={this.updateInputValue}
            />
          </section>
          <div id="clear-values" onClick={this.clearValues}>
            Clear values
          </div>
          <button className="submit" onClick={this.handleSubmit}>
            Update Config
          </button>
        </Form>
      </div>
    );
  };

  view = () => {
    if (this.state.site && this.state.formState) {
      return (
        <div className="view-section">
          <div>
            <h3>Homepage Media Section</h3>
            <p>
              <span className="key">Link:</span>{" "}
              <span className="link-value">{this.state.formState.link}</span>
            </p>
            <p>
              <span className="key">Media Embed:</span>{" "}
              <span className="media-embed-value">
                {this.state.formState.mediaEmbed}
              </span>
            </p>
            <p>
              <span className="key">Title:</span>{" "}
              <span className="title-value">{this.state.formState.title}</span>
            </p>
            <p>
              <span className="key">Text:</span>{" "}
              <span className="text-value">{this.state.formState.text}</span>
            </p>
          </div>
        </div>
      );
    } else {
      return <div>Error fetching site configurations......</div>;
    }
  };

  componentDidMount() {
    this.loadSite();
  }

  render() {
    return (
      <div className="col-lg-9 col-sm-12 admin-content">
        <Form>
          <Form.Group inline>
            <label>Current mode:</label>
            <Form.Radio
              label="Edit"
              name="viewRadioGroup"
              value="edit"
              checked={this.state.viewState === "edit"}
              onChange={this.handleChange}
            />
            <Form.Radio
              label="View"
              name="viewRadioGroup"
              value="view"
              checked={this.state.viewState === "view"}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>
        {this.state.viewState === "view" ? this.view() : this.editForm()}
      </div>
    );
  }
}

export default withAuthenticator(MediaSectionForm);
