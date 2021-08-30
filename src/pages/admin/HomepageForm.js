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
  staticImageSrc: "",
  staticImageAltText: "",
  staticImageShowTitle: false,
  homeStatementHeading: "",
  homeStatement: "",
  sponsors: [],
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
          staticImageSrc: homepage.staticImage.src || "",
          staticImageAltText: homepage.staticImage.altText || "",
          staticImageShowTitle: homepage.staticImage.showTitle || false,
          homeStatementHeading: homepage.homeStatement.heading || "",
          homeStatement: homepage.homeStatement.statement,
          sponsors: homepage.sponsors || [],
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
    homePage.staticImage.showTitle = this.state.formState.staticImageShowTitle;
    homePage.sponsors = this.state.formState.sponsors;
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
            <h3>Static Image</h3>
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
            <label>
              Show title:
              <input
                className="showTitleCheckbox"
                name="staticImageShowTitle"
                type="checkbox"
                checked={this.state.formState.staticImageShowTitle}
                onChange={this.updateInputValue}
              />
            </label>
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

  showTitleFormatted() {
    let title = "false";
    try {
      title = this.state.formState.staticImageShowTitle.toString();
    } catch (error) {
      console.error(error);
    }
    return title;
  }

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
              <span className="key">Show title:</span>{" "}
              {this.showTitleFormatted()}
            </p>
            <h3>Featured Items</h3>
            <FeaturedItems itemList={this.state.formState.featuredItems} />
            <h3>Sponsors</h3>
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
