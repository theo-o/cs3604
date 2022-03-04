import React, { useEffect, useState, useContext } from "react";
import { Form } from "semantic-ui-react";
import ViewMetadata from "./ViewMetadata";
import EditMetadata from "./EditMetadata";
import { API, Storage } from "aws-amplify";
import { getArchiveByIdentifier } from "../../../lib/fetchTools";
import {
  validEmbargo,
  loadEmbargo,
  createEmbargoRecord,
  toTitleCase
} from "../../../lib/EmbargoTools";
import { addedDiff, updatedDiff } from "deep-object-diff";
import * as mutations from "../../../graphql/mutations";
import SiteContext from "../SiteContext";
import FileUploadField from "../../../components/FileUploadField";
import { input } from "../../../components/FormFields";

const multiFields = [
  "belongs_to",
  "contributor",
  "creator",
  "format",
  "language",
  "location",
  "medium",
  "provenance",
  "reference",
  "repository",
  "resource_type",
  "related_url",
  "source",
  "subject",
  "tags"
];

const singleFields = [
  "bibliographic_citation",
  "description",
  "display_date",
  "rights_holder",
  "rights_statement",
  "title",
  "thumbnail_path"
];

const booleanFields = ["visibility"];

const embargoFields = [
  "embargo_start_date",
  "embargo_end_date",
  "embargo_note"
];

const editableFields = singleFields
  .concat(multiFields)
  .concat(booleanFields)
  .concat(embargoFields);

let resultMessage = "";

const ArchiveForm = React.memo(props => {
  const { identifier, resetForm } = props;
  const [error, setError] = useState(null);
  const [fullArchive, setFullArchive] = useState(null);
  const [oldArchive, setOldArchive] = useState(null);
  const [archive, setArchive] = useState(null);
  const [archiveId, setArchiveId] = useState(null);
  const [viewState, setViewState] = useState("view");
  const [validForm, setValidForm] = useState(true);
  const [embargo, setEmbargo] = useState(null);

  const siteContext = useContext(SiteContext);

  useEffect(() => {
    async function loadItem() {
      let item;
      let editableArchive = {};
      let item_id = null;
      try {
        item = await getArchiveByIdentifier(identifier);
        setFullArchive(item);
        setError(null);

        if (item.manifest_url) {
          if (
            item.manifest_url.match(/\.(mp3|ogg|wav)$/) ||
            item.manifest_url.match(/\.(mp4|mov)$/)
          ) {
            editableFields.push("audioTranscript");
          }
        }

        const defaultValue = key => {
          let value = null;
          if (singleFields.includes(key)) {
            value = "";
          } else if (multiFields.includes(key)) {
            value = [];
          } else if (booleanFields.includes(key)) {
            value = false;
          }
          return value;
        };

        const inOptions = key => {
          let retVal = null;
          if (item.archiveOptions && item.archiveOptions[key] !== null) {
            const options = JSON.parse(item.archiveOptions);
            retVal = options[key];
          }
          return retVal;
        };

        for (const idx in editableFields) {
          const field = editableFields[idx];
          editableArchive[field] =
            item[field] || inOptions(field) || defaultValue(field);
        }
        item_id = item.id;
      } catch (e) {
        console.error(`Error fetch archive for ${identifier} due to ${e}`);
        setError(`No item found for identifier: ${identifier}!`);
      }

      setOldArchive(editableArchive);
      setArchive(editableArchive);
      setArchiveId(item_id);
    }

    async function init() {
      if (identifier && !fullArchive) {
        await loadItem();
      }
      if (fullArchive) {
        const embargoResponse = await loadEmbargo(fullArchive, setEmbargo);
        setArchive(arch => {
          try {
            arch["embargo_start_date"] =
              arch["embargo_start_date"] || embargoResponse.start_date || "";
            arch["embargo_end_date"] =
              arch["embargo_end_date"] || embargoResponse.end_date || "";
            arch["embargo_note"] =
              arch["embargo_note"] || embargoResponse.note || "";
          } catch (error) {
            console.log("no embargoResponse");
          }
          return arch;
        });
      }
    }

    init();
  }, [identifier, fullArchive, siteContext.site.siteId, viewState]);

  const isRequiredField = attribute => {
    const requiredFields = ["title"];
    return requiredFields.includes(attribute);
  };

  const viewChangeHandler = (e, { value }) => {
    setViewState(value);
  };

  const deleteArchiveHandler = async () => {
    const deleteConfirm = window.confirm(
      "Are you sure you want to delete this record? This action cannot be undone."
    );
    if (deleteConfirm) {
      const archiveId = { id: fullArchive.id };

      await API.graphql({
        query: mutations.deleteArchive,
        variables: { input: archiveId },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
      resetForm();
    }
  };

  const submitArchiveHandler = async event => {
    for (const key in archive) {
      if (isRequiredField(key) && !archive[key]) {
        setValidForm(false);
        return null;
      }
      if (Array.isArray(archive[key])) {
        archive[key] = [...archive[key].filter(val => val !== null)];
        if (archive[key].length === 0) {
          archive[key] = null;
        }
      }
    }

    if (validEmbargo(archive)) {
      await createEmbargoRecord(archive, fullArchive, embargo, "archive");
    } else {
      resultMessage =
        "Embargo not applied to this object. If you wish to apply an embargo you must supply a start date OR end date. If you do not wish to apply an embargo you can safely ignore this message.";
    }
    delete archive.embargo_start_date;
    delete archive.embargo_end_date;
    delete archive.embargo_note;

    let options = null;
    if (archive.archiveOptions) {
      options = JSON.parse(archive.archiveOptions);
      options.audioTranscript = archive.audioTranscript;
    } else {
      options = {
        audioTranscript: archive.audioTranscript
      };
    }
    archive.archiveOptions = JSON.stringify(options);
    delete archive.audioTranscript;

    const archiveInfo = {
      id: archiveId,
      ...archive
    };
    await API.graphql({
      query: mutations.updateArchive,
      variables: { input: archiveInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });

    const addedData = addedDiff(oldArchive, archive);
    const newData = updatedDiff(oldArchive, archive);
    const oldData = updatedDiff(archive, oldArchive);
    const deletedData = addedDiff(archive, oldArchive);
    const updatedData = Object.keys(newData).reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          new: newData[key],
          old: oldData[key]
        }
      };
    }, {});
    const eventInfo = {
      [`archive_${identifier}`]: {
        added: addedData,
        deleted: deletedData,
        updated: updatedData
      }
    };

    siteContext.updateSite(eventInfo);

    archive.audioTranscript = options.audioTranscript;
    setValidForm(true);
    setViewState("view");
  };

  const deleteMetadataHandler = (field, valueIdx) => {
    setArchive(prevArchive => {
      const values = [...prevArchive[field]];
      values.splice(valueIdx, 1);
      return {
        ...prevArchive,
        [field]: values.length === 0 ? null : values
      };
    });
  };

  const addMetadataHandler = field => {
    setArchive(prevArchive => {
      const values = Array.isArray(prevArchive[field])
        ? [...prevArchive[field]]
        : [];
      values.push(`new ${field}`);
      return {
        ...prevArchive,
        [field]: values
      };
    });
  };

  const changeValueHandler = (event, field, valueIdx) => {
    let inputValue = event.target.value;
    if (inputValue.trim() === "") {
      inputValue = null;
    }
    if (booleanFields.indexOf(field) !== -1) {
      inputValue = event.target.checked;
    }
    setArchive(prevArchive => {
      if (valueIdx === undefined) {
        return {
          ...prevArchive,
          [field]: inputValue
        };
      } else {
        const values = [...prevArchive[field]];
        values[valueIdx] = inputValue;
        return {
          ...prevArchive,
          [field]: values
        };
      }
    });
  };

  const getFileUrl = (name, value, type) => {
    const bucket = Storage._config.AWSS3.bucket;
    const pathPrefix = `public/sitecontent/${type}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
    return `https://${bucket}.s3.amazonaws.com/${pathPrefix}${value}`;
  };

  const setSrc = (event, type, field) => {
    const fileUrl = getFileUrl(event.target.name, event.target.value, type);
    event.target.value = fileUrl;
    changeValueHandler(event, field);
  };

  const formElement = (attribute, index) => {
    let element = null;
    if (attribute === "thumbnail_path" || attribute === "audioTranscript") {
      element = (
        <FileUploadField
          key={`${attribute}_${index}`}
          value={archive[`${attribute}`]}
          site={siteContext.site}
          label={
            attribute === "thumbnail_path"
              ? "Thumbnail image"
              : "HTML Audio Transcript"
          }
          input_id={`${attribute}_upload_${index}`}
          name={`${attribute}_upload_${index}`}
          placeholder="Enter source url"
          setSrc={setSrc}
          siteID={siteContext.site.id}
          fileType={attribute === "thumbnail_path" ? "image" : "text"}
          field={attribute}
        />
      );
    } else if (
      attribute === "embargo_start_date" ||
      attribute === "embargo_end_date"
    ) {
      element = (
        <section key={`${attribute}_${index}`}>
          {input(
            {
              outerClass: "field",
              innerClass: "ui input",
              id: attribute,
              name: attribute,
              value: archive[attribute] || "",
              label: toTitleCase(attribute.replace(/_/g, " ")),
              onChange: changeValueHandler
            },
            "date"
          )}
        </section>
      );
    } else if (attribute === "embargo_note") {
      element = (
        <EditMetadata
          key={`edit_${index}`}
          required={isRequiredField(attribute)}
          field={attribute}
          label={toTitleCase(attribute.replace(/_/g, " "))}
          isMulti={multiFields.includes(attribute)}
          isBoolean={booleanFields.includes(attribute)}
          values={archive["embargo_note"]}
          onChangeValue={changeValueHandler}
          onRemoveValue={deleteMetadataHandler}
          onAddValue={addMetadataHandler}
        />
      );
    } else {
      element = (
        <EditMetadata
          key={`edit_${index}`}
          required={isRequiredField(attribute)}
          field={attribute}
          label={toTitleCase(attribute.replace(/_/g, " "))}
          isMulti={multiFields.includes(attribute)}
          isBoolean={booleanFields.includes(attribute)}
          values={archive[attribute]}
          onChangeValue={changeValueHandler}
          onRemoveValue={deleteMetadataHandler}
          onAddValue={addMetadataHandler}
        />
      );
    }
    return element;
  };

  let archiveDisplay = null;
  if (archive) {
    if (embargo) {
      archive["embargo_start_date"] =
        viewState === "view"
          ? embargo.start_date
          : archive.embargo_start_date || embargo.start_date;
      archive["embargo_end_date"] =
        viewState === "view"
          ? embargo.end_date
          : archive.embargo_end_date || embargo.end_date;
      archive["embargo_note"] =
        viewState === "view"
          ? embargo.note
          : archive.embargo_note || embargo.note;
    }
    if (viewState === "view") {
      archiveDisplay = [
        <a
          key="view_custom_key"
          href={`/archive/${fullArchive.custom_key.split("/").pop()}`}
        >
          View Item
        </a>
      ];
      archiveDisplay.push(
        Object.keys(archive).map((entry, index) => {
          const label =
            entry[0].toUpperCase() + entry.substring(1).replace("_", " ");
          const attribute = { label: label, field: entry };
          return archive[attribute.field] !== null &&
            archive[attribute.field] !== "" ? (
            <ViewMetadata
              key={`view_${index}`}
              attribute={attribute}
              isMulti={multiFields.includes(attribute.field)}
              isBoolean={booleanFields.includes(attribute.field)}
              values={archive[attribute.field]}
            />
          ) : null;
        })
      );
    } else {
      let errorMsg = null;
      if (!validForm) {
        errorMsg = (
          <p className="validation_msg">Please fill in the required field!</p>
        );
      }
      archiveDisplay = (
        <Form>
          {errorMsg}
          {Object.keys(archive).map((attribute, index) => {
            return formElement(attribute, index);
          })}
          <Form.Button onClick={submitArchiveHandler}>
            Update Item Metadata
          </Form.Button>
          <Form.Button onClick={deleteArchiveHandler}>Delete Item</Form.Button>
        </Form>
      );
    }
  } else {
    archiveDisplay = (
      <p>
        <strong>{error}</strong>
      </p>
    );
  }

  return (
    <div className="col-lg-9 col-sm-12 admin-content">
      <Form>
        <Form.Group inline>
          <label>Current mode:</label>
          <Form.Radio
            label="Edit"
            name="editArchiveRadioGroup"
            value="edit"
            checked={viewState === "edit"}
            onChange={viewChangeHandler}
          />
          <Form.Radio
            label="View"
            name="viewArchiveRadioGroup"
            value="view"
            checked={viewState === "view"}
            onChange={viewChangeHandler}
          />
        </Form.Group>
      </Form>
      <p className="errorMsg">{resultMessage}</p>
      {archiveDisplay}
    </div>
  );
});

export default ArchiveForm;
