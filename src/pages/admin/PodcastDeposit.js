import React, { Component } from "react";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react";
import { Form } from "semantic-ui-react";
import { updatedDiff } from "deep-object-diff";
import { API, Auth, Storage } from "aws-amplify";
import { getPodcastCollections, mintNOID } from "../../lib/fetchTools";
import * as mutations from "../../graphql/mutations";
import { input } from "../../components/FormFields";
import { v4 as uuidv4 } from "uuid";

import "../../css/adminForms.scss";

const initialFormState = {
  selectedCollectionID: null,
  title: "",
  description: "",
  thumbnail_path: "",
  manifest_url: "",
  owner_email: "",
  owner_name: "",
  source_link: "",
  source_text: "",
  season_number: "",
  episode_number: "",
  publication_date: "",
  visibility: false,
  manifest_file_characterization: {},
  audioTranscript: ""
};

class PodcastDeposit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "edit",
      collections: null,
      valid_email: true,
      email_edited: false,
      valid_source_link: true,
      source_link_edited: false,
      valid_audio_upload: true,
      audio_upload_edited: false,
      archive: {}
    };
  }

  async loadCollections() {
    const collections = await getPodcastCollections();
    if (collections) {
      const stateObj = { formState: {} };
      stateObj["collections"] = collections;
      stateObj.formState["selectedCollectionID"] = collections[0].id;
      this.setState(stateObj);
    }
  }

  getCollectionById(id) {
    let selected = null;
    for (const i in this.state.collections) {
      if (this.state.collections[i].id === id) {
        selected = this.state.collections[i];
      }
    }
    return selected;
  }

  getFolderByName(name) {
    let folder = "";
    switch (name) {
      case "manifest_url":
        folder = "audio";
        break;
      case "audioTranscript":
        folder = "text";
        break;
      case "thumbnail_path":
        folder = "image";
        break;
      default:
        break;
    }
    return folder;
  }

  getFileUrl(name, value) {
    const bucket = Storage._config.AWSS3.bucket;
    const folder = this.getFolderByName(name);
    const pathPrefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
    return `https://${bucket}.s3.amazonaws.com/${pathPrefix}${value}`;
  }

  setFileCharacterization(context, file) {
    let fileDetails = {};
    fileDetails.name = file.name;
    fileDetails.type = file.type;
    fileDetails.size = file.size;
    let audio = new Audio();
    audio.addEventListener(
      "loadedmetadata",
      function() {
        fileDetails.duration = new Date(audio.duration * 1000)
          .toISOString()
          .substr(11, 8);
        let event = { target: {} };
        event.target.name = "manifest_file_characterization";
        event.target.value = JSON.stringify(fileDetails);
        context.updateInputValue(event);
      },
      false
    );
    audio.src = window.URL.createObjectURL(file);
  }

  updateInputValue = event => {
    const { name, type } = event.target;
    let value = type === "checkbox" ? event.target.checked : event.target.value;

    let attributes = JSON.parse(JSON.stringify(this.state.formState));
    if (type === "upload") {
      value = this.getFileUrl(name, value);
      attributes[name] = value;
      this.setState({
        formState: attributes,
        audio_upload_edited: true,
        valid_audio_upload: true
      });
    } else {
      attributes[name] = value;
      this.setState({ formState: attributes });
    }
  };

  sourceLinkFormatted(link, text) {
    return [`<a href="${link}">${text}</a>.`];
  }

  publicationDateFormatted(publication_date) {
    return publication_date
      ? `${publication_date.replaceAll("-", "/")} 00:00:00`
      : null;
  }

  handleSubmit = async () => {
    const id = uuidv4();
    const noid = await mintNOID();
    const customKeyPrefix = "ark:/53696";
    const customKey = `${customKeyPrefix}/${noid}`;

    const selectedCollection = this.getCollectionById(
      this.state.formState.selectedCollectionID
    );

    const modifiedPubDate = this.publicationDateFormatted(
      this.state.formState.publication_date
    );

    let options = {
      audioTranscript: this.state.formState.audioTranscript
    };

    let archive = {
      id: id,
      title: this.state.formState.title,
      identifier:
        selectedCollection.identifier +
        this.state.formState.season_number +
        this.state.formState.episode_number,
      description: this.state.formState.description,
      creator: [selectedCollection.title],
      source: this.sourceLinkFormatted(
        this.state.formState.source_link,
        this.state.formState.source_text
      ),
      language: ["en"],
      custom_key: customKey,
      parent_collection: [selectedCollection.id],
      item_category: "podcasts",
      resource_type: ["podcast"],
      visibility: this.state.formState.visibility || false,
      thumbnail_path: this.state.formState.thumbnail_path,
      manifest_url: this.state.formState.manifest_url,
      manifest_file_characterization: this.state.formState
        .manifest_file_characterization,
      heirarchy_path: selectedCollection.heirarchy_path,
      create_date: modifiedPubDate,
      modified_date: modifiedPubDate,
      archiveOptions: JSON.stringify(options)
    };

    await API.graphql({
      query: mutations.createArchive,
      variables: { input: archive },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });

    this.setState({
      archive: archive,
      viewState: "view"
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

  validateEmail = event => {
    const { value } = event.target;
    const re = /^[^\s@]+@[^\s@]+$/;
    this.setState({ valid_email: !!re.test(value) });
  };

  validateURL = event => {
    const { value } = event.target;
    const re = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );

    this.setState({
      source_link_edited: true,
      valid_source_link: !!re.test(value)
    });
  };

  newPodcastForm = () => {
    return (
      <div>
        <h2>Upload New Podcast Episode</h2>
        <Form>
          <section className="podcast-metadata">
            <h3>Episode Metadata</h3>
            {input(
              {
                label: "Podcast Collection:",
                name: "selectedCollectionID",
                value: this.state.formState.selectedCollectionID,
                onChange: this.updateInputValue,
                entries: this.state.collections.map(collection => {
                  return { id: collection.id, text: collection.title };
                })
              },
              "select"
            )}
            {input({
              label: "Episode title",
              name: "title",
              placeholder: "Enter episode title",
              onChange: this.updateInputValue
            })}
            {input(
              {
                name: "description",
                label: "Episode description",
                placeholder: "Enter episode description",
                onChange: this.updateInputValue
              },
              "textArea"
            )}
            {!this.state.valid_source_link && (
              <span className="validation_msg">
                Please enter a valid URL below
              </span>
            )}
            {input({
              label: "Season Number. E.g, 001",
              name: "season_number",
              placeholder: "Enter Season number",
              onChange: this.updateInputValue
            })}
            {input({
              label: "Episode Number. E.g, 001",
              name: "episode_number",
              placeholder: "Enter episode number",
              onChange: this.updateInputValue
            })}
            {input({
              label: "Website Link",
              name: "source_link",
              placeholder: "Enter Website link",
              onChange: this.updateInputValue,
              onBlur: this.validateURL
            })}
            {input({
              label: "Website Text",
              name: "source_text",
              placeholder: "Enter Website text",
              onChange: this.updateInputValue
            })}
            {input(
              {
                outerClass: "field",
                innerClass: "ui input",
                label: "Publication date:",
                name: "publication_date",
                onChange: this.updateInputValue
              },
              "date"
            )}

            {input(
              {
                outerClass: "field visibility-checkbox",
                label: "Visibility:",
                name: "visibility",
                id: "visibility-checkbox",
                onChange: this.updateInputValue,
                checked: this.state.formState.visibility
              },
              "checkBox"
            )}
          </section>
          <section className="file-uploads">
            <h3>Episode files</h3>
            {input(
              {
                label: "Audio file (required)",
                id: "manifest_url_upload",
                name: "manifest_url",
                placeholder: "Audio file",
                context: this,
                setSrc: this.updateInputValue,
                setFileCharacterization: this.setFileCharacterization,
                fileType: "audio"
              },
              "file"
            )}
            {input(
              {
                label: "HTML audio transcript (optional)",
                id: "audio_transcript_upload",
                name: "audioTranscript",
                placeholder: "Audio transcript",
                setSrc: this.updateInputValue,
                fileType: "text"
              },
              "file"
            )}
            {input(
              {
                label: "Episode image (optional)",
                id: "thumbnail_path_upload",
                name: "thumbnail_path",
                placeholder: "Episode image",
                setSrc: this.updateInputValue,
                fileType: "image"
              },
              "file"
            )}
          </section>
        </Form>
        <button
          disabled={
            !(
              this.state.source_link_edited &&
              this.state.valid_source_link &&
              this.state.audio_upload_edited &&
              this.state.valid_audio_upload
            )
          }
          className="submit"
          onClick={this.handleSubmit}
        >
          Submit Podcast Episode
        </button>
      </div>
    );
  };

  view = () => {
    if (this.state.archive) {
      return (
        <div className="view-section">
          <div>
            <h3>Podcast entry successfully created</h3>
            {Object.keys(this.state.archive).map(key => (
              <div key={key}>
                <span id={`${key}_key`}>{key}:</span>{" "}
                <span id={`${key}_value`}>
                  {this.state.archive[key]
                    ? this.state.archive[key].toString()
                    : "null"}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return <div>Error creating archive</div>;
    }
  };

  componentDidMount() {
    this.loadCollections();
  }

  render() {
    let content = <></>;
    if (this.state.collections) {
      content = (
        <>
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
            {this.state.viewState === "edit"
              ? this.newPodcastForm()
              : this.view()}
          </div>
          <hr class="auth-divider" />
          <div className="signout-wrapper">
            <Authenticator>
              {({ signOut, user }) => (
                <div className="auth-dialog">
                  <p>{user.username} successfully logged in.</p>
                  <button onClick={signOut}>Sign out</button>
                </div>
              )}
            </Authenticator>
          </div>
        </>
      );
    }
    return content;
  }
}

export default withAuthenticator(PodcastDeposit);
