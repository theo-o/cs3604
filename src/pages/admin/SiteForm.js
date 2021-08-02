import React, { Component } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Form } from "semantic-ui-react";
import { updatedDiff } from "deep-object-diff";
import { API, Auth } from "aws-amplify";
import { getSite } from "../../lib/fetchTools";
import * as mutations from "../../graphql/mutations";
import { ContactForm, Contacts } from "./ContactFields";

const initialFormState = {
  analyticsID: "",
  siteColor: "",
  siteName: "",
  siteTitle: "",
  contact: []
};

class SiteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "viewSite",
      site: null
    };
  }

  async loadSite() {
    const site = await getSite();
    if (site) {
      let options = null;
      try {
        options = JSON.parse(site.siteOptions);
      } catch (error) {
        console.log("error parsing siteOptions");
      }
      let siteInfo = {
        analyticsID: site.analyticsID || "",
        siteColor: site.siteColor || "",
        siteName: site.siteName,
        siteTitle: site.siteTitle,
        contact: site.contact.length
          ? site.contact.map(contact => {
              return JSON.parse(contact);
            })
          : [],
        redirectURL: options ? options.redirectURL : ""
      };
      this.setState({
        formState: siteInfo,
        prevFormState: siteInfo,
        site: site
      });
    }
  }

  componentDidMount() {
    this.loadSite();
  }

  updateInputValue = event => {
    const { name, value } = event.target;
    this.setState(prevState => {
      return {
        formState: { ...prevState.formState, [name]: value }
      };
    });
  };

  formatData = siteInfo => {
    let site = siteInfo;
    site.contact = site.contact.map(contact => {
      return JSON.stringify(contact);
    });
    return site;
  };

  handleSubmit = async () => {
    const { siteTitle, siteName } = this.state.formState;
    if (!siteTitle || !siteName) return;

    if (this.state.formState.redirectURL.length) {
      const options = this.state.formState.siteOptions || {};
      options.redirectURL = this.state.formState.redirectURL;
      this.state.formState.siteOptions = JSON.stringify(options);
    }

    this.setState({ viewState: "viewSite" });
    const siteID = this.state.site.id;
    let siteInfo = { id: siteID, ...this.state.formState };
    siteInfo = this.formatData(siteInfo);
    delete siteInfo.redirectURL;

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

  updateContactValue = event => {
    const { name, value, dataset } = event.target;
    const index = dataset.index;
    this.setState(prevState => {
      let contactArray = [...prevState.formState.contact];
      let contact = { ...contactArray[index], [name]: value };
      contactArray[index] = contact;
      return { formState: { ...prevState.formState, contact: contactArray } };
    });
  };

  contactFields = () => {
    const fields = this.state.formState.contact.map((obj, index) => {
      return (
        <div key={`field_${index}`}>
          <p>Contact {index + 1}</p>
          <p>Title: {obj.title}</p>
          <p>Email: {obj.email}</p>
          <p>Group: {obj.group}</p>
          <p>Department: {obj.department}</p>
          <p>Street Address: {obj.streetAddress}</p>
          <p>City, State, Zip: {obj.cityStateZip}</p>
          <p>Phone: {obj.phone}</p>
        </div>
      );
    });
    return fields;
  };

  addContact = () => {
    this.setState(prevState => {
      let contactArray = [...prevState.formState.contact];
      let newContact = {
        title: "",
        email: "",
        group: "",
        department: "",
        streetAddress: "",
        cityStateZip: "",
        phone: ""
      };
      contactArray.push(newContact);
      return {
        formState: { ...prevState.formState, contact: contactArray }
      };
    });
  };

  removeContact = event => {
    const index = event.target.dataset.index;
    this.setState(prevState => {
      let contactArray = [...prevState.formState.contact];
      contactArray.splice(index, 1);
      return {
        formState: { ...prevState.formState, contact: contactArray }
      };
    });
  };

  editSiteForm = () => {
    return (
      <div>
        <h2>{`Edit Site with SiteId: ${process.env.REACT_APP_REP_TYPE.toLowerCase()}`}</h2>
        <Form>
          <Form.Input
            label="Analytics ID"
            value={this.state.formState.analyticsID}
            name="analyticsID"
            placeholder="Enter Analytics ID"
            onChange={this.updateInputValue}
          />
          <Form.Input
            label="Site Color"
            value={this.state.formState.siteColor}
            name="siteColor"
            placeholder="Enter Site Color"
            onChange={this.updateInputValue}
          />
          <Form.TextArea
            label="Site Name"
            value={this.state.formState.siteName}
            name="siteName"
            placeholder="Enter Site Name"
            onChange={this.updateInputValue}
          />
          <Form.Input
            label="Site Title"
            value={this.state.formState.siteTitle}
            name="siteTitle"
            placeholder="Enter Site Title"
            onChange={this.updateInputValue}
          />
          <Form.Input
            label="Redirection URL"
            value={this.state.formState.redirectURL}
            name="redirectURL"
            placeholder="Enter Redirection URL"
            onChange={this.updateInputValue}
          />
          <ContactForm
            contactList={this.state.formState.contact}
            updateContactValue={this.updateContactValue}
            addContact={this.addContact}
            removeContact={this.removeContact}
          />
        </Form>
        <button onClick={this.handleSubmit}>Update Site</button>
      </div>
    );
  };

  viewSite = () => {
    if (this.state.site) {
      return (
        <div>
          <div>
            <p>SiteId: {this.state.site.siteId} </p>
            <p>Analytics ID: {this.state.formState.analyticsID}</p>
            <p>Site Color: {this.state.formState.siteColor}</p>
            <p>Site Name: {this.state.formState.siteName}</p>
            <p>Site Title: {this.state.formState.siteTitle}</p>
            <p>Redirect URL: {this.state.formState.redirectURL}</p>
            <p>Contacts</p>
            <Contacts contactList={this.state.formState.contact} />
          </div>
        </div>
      );
    } else {
      return <div>Error fetching site configurations......</div>;
    }
  };

  render() {
    return (
      <div className="col-lg-9 col-sm-12 admin-content">
        <Form>
          <Form.Group inline>
            <label>Current mode:</label>
            <Form.Radio
              label="Edit"
              name="viewStateRadioGroup"
              value="editSite"
              checked={this.state.viewState === "editSite"}
              onChange={this.handleChange}
            />

            <Form.Radio
              label="View"
              name="viewStateRadioGroup"
              value="viewSite"
              checked={this.state.viewState === "viewSite"}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>
        {this.state.viewState === "viewSite"
          ? this.viewSite()
          : this.editSiteForm()}
      </div>
    );
  }
}

export default withAuthenticator(SiteForm);
