import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { updatedDiff } from "deep-object-diff";
import FileUploadField from "../../components/FileUploadField";
import { FeaturedItemsForm, FeaturedItems } from "./FeaturedItemsFields";
import { SponsorForm, Sponsors } from "./SponsorFields";
import {
  CollectionHighlightsForm,
  CollectionHighlights
} from "./CollectionHighlightsFields";
import * as sanitizeHtml from "sanitize-html";

const initialFormState = {
  homeStatementHeading: "",
  homeStatement: "",
  staticImageSrc: "",
  staticImageAltText: "",
  staticImageTitleFont: "",
  staticImageTitleSize: "",
  staticImageTextStyle: "",
  sponsors: [],
  sponsorsColor: "",
  sponsorsStyle: "",
  featuredItems: [],
  collectionHighlights: []
};

class HomepageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "view"
    };
  }

  cleanHTML = value => {
    const cleaned = sanitizeHtml(value, {
      allowedTags: ["b", "i", "em", "strong", "a"],
      allowedAttributes: {
        a: ["href"]
      }
    });
    return cleaned;
  };

  updateItemValue = (property, index) => event => {
    const { name, value } = event.target;
    this.setState(prevState => {
      let itemArray = [...prevState.formState[property]];
      let item = { ...itemArray[index], [name]: value };
      itemArray[index] = item;
      return {
        formState: { ...prevState.formState, [property]: itemArray }
      };
    });
  };

  addItem = property => event => {
    this.setState(prevState => {
      let itemArray = [...prevState.formState[property]];
      let newItem = {};
      itemArray.push(newItem);
      return {
        formState: { ...prevState.formState, [property]: itemArray }
      };
    });
  };

  removeItem = (property, index) => event => {
    this.setState(prevState => {
      let itemArray = [...prevState.formState[property]];
      itemArray.splice(index, 1);
      return {
        formState: { ...prevState.formState, [property]: itemArray }
      };
    });
  };

  loadSite() {
    const site = this.props.site;
    if (site && site.homePage) {
      const homepage = JSON.parse(site.homePage);
      let siteInfo = {};
      try {
        siteInfo = {
          homeStatementHeading: homepage.homeStatement.heading || "",
          homeStatement: homepage.homeStatement.statement,
          staticImageSrc: homepage.staticImage.src || "",
          staticImageAltText: homepage.staticImage.altText || "",
          staticImageTitleFont:
            homepage.staticImage.titleFont || "crimson-text, serif",
          staticImageTitleSize: homepage.staticImage.titleSize || "40px",
          staticImageTextStyle: homepage.staticImage.textStyle || "uppercase",
          sponsors: homepage.sponsors || [],
          sponsorsColor: homepage.sponsorsColor || "#75787b",
          sponsorsStyle: homepage.sponsorsStyle || "solid",
          featuredItems: homepage.featuredItems || [],
          collectionHighlights: homepage.collectionHighlights || []
        };
      } catch (error) {
        console.error(error);
      }

      this.setState({
        formState: siteInfo,
        prevFormState: siteInfo
      });
    }
  }

  updateInputValue = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const property_index = target.name.split("_");
    let name = "";
    let index = 0;
    if (property_index.length === 2) {
      [name, index] = property_index;
      this.setState(prevState => {
        let itemArray = [...prevState.formState[name]];
        let item = { ...itemArray[index], src: value };
        itemArray[index] = item;
        return {
          formState: { ...prevState.formState, [name]: itemArray }
        };
      });
    } else if (property_index.length === 1) {
      [name] = property_index;
      this.setState(prevState => {
        return {
          formState: { ...prevState.formState, [name]: value }
        };
      });
    }
  };

  handleSubmit = async () => {
    this.setState({ viewState: "view" });
    let homePage = JSON.parse(this.props.site.homePage);
    homePage.homeStatement.heading = this.state.formState.homeStatementHeading;
    homePage.homeStatement.statement = this.cleanHTML(
      this.state.formState.homeStatement
    );
    homePage.staticImage.src = this.state.formState.staticImageSrc;
    homePage.staticImage.altText = this.state.formState.staticImageAltText;
    homePage.staticImage.titleFont = this.state.formState.staticImageTitleFont;
    homePage.staticImage.titleSize = this.state.formState.staticImageTitleSize;
    homePage.staticImage.textStyle = this.state.formState.staticImageTextStyle;
    homePage.sponsors = this.state.formState.sponsors;
    homePage.sponsorsColor = this.state.formState.sponsorsColor;
    homePage.sponsorsStyle = this.state.formState.sponsorsStyle;
    homePage.featuredItems = this.state.formState.featuredItems;
    homePage.collectionHighlights = this.state.formState.collectionHighlights;
    const initialHomePage = JSON.parse(this.props.site.homePage);
    const newData = updatedDiff(initialHomePage, homePage);
    const oldData = updatedDiff(homePage, initialHomePage);
    const eventInfo = Object.keys(newData).reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          old: oldData[key],
          new: newData[key]
        }
      };
    }, {});
    this.props.updateSite(eventInfo, "homePage", JSON.stringify(homePage));
  };

  handleChange = (e, { value }) => {
    this.setState({ viewState: value });
  };

  fileUploadLabel(staticImageSrc) {
    let hasValue = "";
    if (staticImageSrc) {
      hasValue = "to change ";
    }
    return `Upload file ${hasValue} (Image or HTML file only):`;
  }

  editForm = () => {
    return (
      <div>
        <h2>{`Edit Homepage Top with SiteId: ${process.env.REACT_APP_REP_TYPE.toLowerCase()}`}</h2>
        <Form>
          <section className="homepage-statement">
            <h3>Homepage Statement</h3>
            <Form.Input
              label="Heading"
              value={this.state.formState.homeStatementHeading}
              name="homeStatementHeading"
              placeholder="Enter Heading"
              onChange={this.updateInputValue}
            />
            <Form.TextArea
              label="Statement"
              value={this.state.formState.homeStatement}
              name="homeStatement"
              placeholder="Enter Statement"
              onChange={this.updateInputValue}
            />
          </section>
          <section className="static-image">
            <h3>Homepage Image and Title</h3>
            <h4>Cover Image</h4>
            <FileUploadField
              value={this.state.formState.staticImageSrc}
              label={this.fileUploadLabel(this.state.formState.staticImageSrc)}
              input_id="static_img_src"
              name="staticImageSrc"
              placeholder="Enter Src"
              site={this.props.site}
              setSrc={this.updateInputValue}
              fileType="image"
            />
            <Form.Input
              label="Alt Text"
              value={this.state.formState.staticImageAltText}
              name="staticImageAltText"
              placeholder="Enter Alt Text"
              onChange={this.updateInputValue}
            />
            <h4>Style Site Title</h4>
            <div className="form-group">
              <label htmlFor="staticImageTitleFont">Font</label>
              <select
                className="form-control"
                id="staticImageTitleFont"
                name="staticImageTitleFont"
                value={this.state.formState.staticImageTitleFont}
                placeholder="Choose a font"
                onChange={this.updateInputValue}
              >
                <option value="Acherus, sans-serif">Acherus</option>
                <option value="crimson-text, serif">Crimson</option>
                <option value="gineso-condensed, sans-serif">Gineso</option>
              </select>
            </div>
            <Form.Input
              label="Font Size"
              name="staticImageTitleSize"
              value={this.state.formState.staticImageTitleSize}
              placeholder="40px"
              onChange={this.updateInputValue}
            />
            <div className="form-group">
              <label htmlFor="staticImageTextStyle">Text Style</label>
              <select
                className="form-control"
                id="staticImageTextStyle"
                name="staticImageTextStyle"
                value={this.state.formState.staticImageTextStyle}
                placeholder="Choose a font"
                onChange={this.updateInputValue}
              >
                <option value="capitalize">Capitalize each word</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="none">None</option>
              </select>
            </div>
          </section>
        </Form>
        <FeaturedItemsForm
          itemList={this.state.formState.featuredItems}
          updateItemValue={this.updateItemValue}
          updateInputValue={this.updateInputValue}
          addItem={this.addItem}
          removeItem={this.removeItem}
          site={this.props.site}
        />
        <SponsorForm
          sponsorsList={this.state.formState.sponsors}
          updateItemValue={this.updateItemValue}
          updateInputValue={this.updateInputValue}
          addItem={this.addItem}
          removeItem={this.removeItem}
          site={this.props.site}
        />
        <Form>
          <section>
            <h3>Style Sponsors Section</h3>
            <div className="form-group">
              <label htmlFor="sponsorsColor">Background Color</label>
              <select
                className="form-control"
                id="sponsorsColor"
                name="sponsorsColor"
                value={this.state.formState.sponsorsColor}
                placeholder="Choose a color"
                onChange={this.updateInputValue}
              >
                <option value="#861f41">Maroon</option>
                <option value="#E87722">Orange</option>
                <option value="#FFFFFF">White</option>
                <option value="#75787B">Gray</option>
                <option value="#D7D2CB">Light Gray</option>
                <option value="#508590">Teal</option>
                <option value="#CE0058">Pink</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sponsorsStyle">Background Style</label>
              <select
                className="form-control"
                id="sponsorsStyle"
                name="sponsorsStyle"
                value={this.state.formState.sponsorsStyle}
                placeholder="Choose a style"
                onChange={this.updateInputValue}
              >
                <option value="solid">Solid Background</option>
                <option value="divider">Divider Line</option>
              </select>
            </div>
          </section>
        </Form>
        <CollectionHighlightsForm
          highlightsList={this.state.formState.collectionHighlights}
          updateItemValue={this.updateItemValue}
          updateInputValue={this.updateInputValue}
          addItem={this.addItem}
          removeItem={this.removeItem}
          site={this.props.site}
        />
        <button className="submit" onClick={this.handleSubmit}>
          Update Config
        </button>
      </div>
    );
  };

  view = () => {
    if (this.props.site && this.state.formState) {
      return (
        <div className="view-section">
          <div>
            <h3>Homepage Statement</h3>
            <p>
              <span className="key">Heading:</span>{" "}
              {this.state.formState.homeStatementHeading}
            </p>
            <p>
              <span className="key">Statement:</span>{" "}
              {this.cleanHTML(this.state.formState.homeStatement)}
            </p>
            <h3>Static Image</h3>
            <p>
              <span className="key">Src:</span>{" "}
              {this.state.formState.staticImageSrc}
            </p>
            <p>
              <span className="key">Alt text:</span>{" "}
              {this.state.formState.staticImageAltText}
            </p>
            <p>
              <span className="key">Title Font:</span>{" "}
              {this.state.formState.staticImageTitleFont}
            </p>
            <p>
              <span className="key">Title Font Size:</span>{" "}
              {this.state.formState.staticImageTitleSize}
            </p>
            <p>
              <span className="key">Title Text Style:</span>{" "}
              {this.state.formState.staticImageTextStyle}
            </p>
            <h3>Featured Items</h3>
            <FeaturedItems itemList={this.state.formState.featuredItems} />
            <h3>Sponsors</h3>
            <p>
              <span className="key">Background Color:</span>{" "}
              {this.state.formState.sponsorsColor}
            </p>
            <p>
              <span className="key">Background Style:</span>{" "}
              {this.state.formState.sponsorsStyle}
            </p>
            <Sponsors sponsorsList={this.state.formState.sponsors} />
            <h3>Collection Highlights</h3>
            <CollectionHighlights
              highlightsList={this.state.formState.collectionHighlights}
            />
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

export default HomepageForm;
