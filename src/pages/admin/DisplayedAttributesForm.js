import React, { Component } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { NavLink } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { updatedDiff } from "deep-object-diff";
import { API, Auth } from "aws-amplify";
import {
  getSite,
  fetchAvailableDisplayedAttributes
} from "../../lib/fetchTools";
import * as mutations from "../../graphql/mutations";

import "../../css/adminForms.scss";

const initialFormState = [];

class DisplayedAttributesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "view",
      site: null,
      deletedAttributes: [],
      availableAttributes: null,
      selectAttributes: {},
      tempAttributes: {}
    };
  }

  async loadSiteAndAvailableAttributes() {
    const site = await getSite();
    const availableAttributes = await fetchAvailableDisplayedAttributes(site);
    if (site && availableAttributes) {
      const displayedAttributes = JSON.parse(site.displayedAttributes);
      this.setState(
        {
          formState: displayedAttributes,
          prevFormState: displayedAttributes,
          displayedAttributes: displayedAttributes,
          availableAttributes: availableAttributes,
          site: site
        },
        () => {
          this.newAttributeSelect();
        }
      );
    }
  }

  componentDidMount() {
    this.loadSiteAndAvailableAttributes();
  }

  updateInputValue = event => {
    const { name, value } = event.target;
    const nameArray = name.split("#");
    const type = nameArray[0];
    const index = nameArray[1];

    let attributes = JSON.parse(JSON.stringify(this.state.formState));
    attributes[type][index].label = value;

    this.setState({ formState: attributes });
  };

  addNewAttributes(newData) {
    let newAttributes = [];
    const numNewAttributes =
      this.state.formState.length - this.state.prevFormState.length;
    if (numNewAttributes > 0) {
      newAttributes = this.state.formState.slice(
        Math.max(this.state.formState.length - numNewAttributes, 0)
      );
    }
    if (newAttributes.length) {
      for (const idx in newAttributes) {
        newData[Object.keys(newData).length] = newAttributes[idx];
      }
    }
    return newData;
  }

  async recordDeletedAttributes(historyInfo) {
    if (this.state.deletedAttributes.length) {
      let eventInfo = {};
      for (const idx in this.state.deletedAttributes) {
        eventInfo[idx] = {
          old: this.state.deletedAttributes[idx],
          new: "Deleted"
        };
      }
      historyInfo.event = JSON.stringify(eventInfo);
      await API.graphql({
        query: mutations.createHistory,
        variables: { input: historyInfo },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
    }
  }

  handleSubmit = async () => {
    this.setState({ viewState: "view" });
    const siteID = this.state.site.id;
    const siteInfo = {
      id: siteID,
      displayedAttributes: JSON.stringify(this.state.formState)
    };
    await API.graphql({
      query: mutations.updateSite,
      variables: { input: siteInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
    let newData = updatedDiff(this.state.prevFormState, this.state.formState);
    const oldData = updatedDiff(this.state.formState, this.state.prevFormState);

    newData = this.addNewAttributes(newData);

    const userInfo = await Auth.currentUserPoolUser();
    let eventInfo = {};
    eventInfo = Object.keys(newData).reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          old: oldData[key] || "New Attribute",
          new: newData[key]
        }
      };
    }, {});

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

    this.recordDeletedAttributes(historyInfo);
  };

  handleChange = (e, { value }) => {
    this.setState({ viewState: value });
  };

  addAttribute(type) {
    let attributes = JSON.parse(JSON.stringify(this.state.formState));
    if (this.state.tempAttributes[type].length) {
      attributes[type].push({
        field: this.state.tempAttributes[type],
        label: ""
      });
      this.setState({ formState: attributes }, () => {
        this.newAttributeSelect();
      });
    }
  }

  deleteAttribute(type, idx) {
    let attributes = JSON.parse(JSON.stringify(this.state.formState));
    const attribute = attributes[type][idx];
    let deletedArray = JSON.parse(JSON.stringify(this.state.deletedAttributes));
    deletedArray.push(attribute);
    attributes[type].splice(idx, 1);
    this.setState(
      { formState: attributes, deletedAttributes: deletedArray },
      () => {
        this.newAttributeSelect();
      }
    );
  }

  editSitePagesForm = () => {
    return (
      <div>
        <Form
          id="displayedAttributesForm"
          key="displayedAttributesForm"
          onSubmit={this.handleSubmit}
          className="displayedAttributesForm"
        >
          {Object.entries(this.state.formState).map(item => {
            return this.editSitePagesSection(item);
          })}
          <Form.Button>Update Attributes</Form.Button>
        </Form>
      </div>
    );
  };

  formatAssets(input) {
    let assets = input;
    if (typeof input === "object") {
      assets = JSON.stringify(input);
    }
    return assets;
  }

  newAttributeSelect() {
    const displayedAttributes = this.state.formState;
    const availableAttributes = this.state.availableAttributes;
    let selectAttributes = JSON.parse(
      JSON.stringify(this.state.selectAttributes)
    );

    for (const type in displayedAttributes) {
      const typeAttributes = this.state.formState[type].map(
        attribute => attribute.field
      );
      selectAttributes[type] = [];

      for (const attrIdx in availableAttributes[type]) {
        const attribute = availableAttributes[type][attrIdx];
        console.log(attribute);
        if (
          typeAttributes.indexOf(attribute) === -1 &&
          selectAttributes[type].indexOf(attribute) === -1
        ) {
          selectAttributes[type].push(attribute);
        }
      }
    }

    this.setState({ selectAttributes: selectAttributes });
  }

  onDropdownSelect = e => {
    const eventValue = e.target.value;
    let copy = JSON.parse(JSON.stringify(this.state.tempAttributes));
    const type = eventValue.split("#")[0];
    const value = eventValue.split("#")[1];
    copy[type] = value;

    this.setState({ tempAttributes: copy });
  };

  checkRequired(type, item) {
    let required = false;
    try {
      required =
        JSON.parse(this.state.site.siteOptions).requiredAttributes[
          type
        ].indexOf(item) !== -1;
    } catch (error) {
      console.log("Required attributes not found it Site options");
    }
    return required;
  }

  editSitePagesSection = item => {
    return (
      <section id={item[0]} key={item[0]}>
        <fieldset>
          <legend className="admin">{`Displayed Attributes for type: ${item[0]}`}</legend>
          {item[1].map((attribute, idx) => {
            const required = this.checkRequired(item[0], attribute.field);
            return (
              <div id={`${item[0]}_${idx}_wrapper`} key={`${item[0]}_${idx}`}>
                <Form.Input
                  className="attributeLabel"
                  id={`${item[0]}_${idx}`}
                  key={`${item[0]}_${idx}`}
                  label={`Label for ${attribute.field} attribute`}
                  value={attribute.label}
                  name={`${item[0]}#${idx}`}
                  placeholder="Enter Attribute Label"
                  onChange={this.updateInputValue}
                />
                {required && <span className="required">Required</span>}
                {!required && (
                  <NavLink
                    className="delete"
                    to="#"
                    onClick={() => this.deleteAttribute(item[0], idx)}
                  >
                    Delete Attribute
                  </NavLink>
                )}
              </div>
            );
          })}
          <div>
            <select
              className={`add_${item[0]}_attribute`}
              onClick={this.onDropdownSelect}
              onChange={this.onDropdownSelect}
            >
              {this.state.selectAttributes[item[0]] &&
                this.state.selectAttributes[item[0]].map(attr => (
                  <option
                    key={`${item[0]}_${attr}`}
                    value={`${item[0]}#${attr}`}
                  >
                    {attr}
                  </option>
                ))}
            </select>
            <NavLink
              className="add"
              to="#"
              onClick={() => this.addAttribute(item[0])}
            >
              New Attribute
            </NavLink>
            <div className="clear"></div>
          </div>
        </fieldset>
      </section>
    );
  };

  viewSitePages() {
    return (
      <div className="view-section">
        {Object.entries(this.state.formState).map(type => {
          return (
            <section key={type[0]}>
              <h3>{type[0]}</h3>
              <ul>
                {type[1].map(attribute => {
                  return (
                    <li key={`${type[0]}#${attribute.field}`}>
                      <span className="entry">
                        <span className="key">field:</span> {attribute.field}
                      </span>
                      <span className="entry">
                        <span className="key">label:</span> {attribute.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>{`Displayed Attributes for: ${process.env.REACT_APP_REP_TYPE.toLowerCase()}`}</h1>
        <Form>
          <Form.Group inline>
            <label>Current mode:</label>
            <Form.Radio
              label="Edit"
              name="viewDisplayedAttributesRadioGroup"
              value="edit"
              checked={this.state.viewState === "edit"}
              onChange={this.handleChange}
            />

            <Form.Radio
              label="View"
              name="viewDisplayedAttributesRadioGroup"
              value="view"
              checked={this.state.viewState === "view"}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>
        {this.state.viewState === "view"
          ? this.viewSitePages()
          : this.editSitePagesForm()}
      </div>
    );
  }
}

export default withAuthenticator(DisplayedAttributesForm);
