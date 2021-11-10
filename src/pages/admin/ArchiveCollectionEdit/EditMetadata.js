import React, { Fragment } from "react";
import { Form, Input, TextArea } from "semantic-ui-react";

const EditMetadata = React.memo(props => {
  let editInput = null;
  if (props.isMulti) {
    editInput = (
      <Fragment>
        <ul>
          {props.values &&
            props.values.map((value, idx) => (
              <li key={`${props.label}_${idx}`}>
                <TextArea
                  name={`${props.field}_${idx}`}
                  onChange={event =>
                    props.onChangeValue(event, props.field, idx)
                  }
                  placeholder={`Enter ${props.field} for the record`}
                  value={value || ""}
                />
                <button
                  type="button"
                  onClick={() => props.onRemoveValue(props.field, idx)}
                  className="small deleteValue"
                >
                  Delete Value
                </button>
                <div className="clear"></div>
              </li>
            ))}
        </ul>
        <button
          type="button"
          onClick={() => props.onAddValue(props.field)}
          className="small"
        >
          Add Value
        </button>
      </Fragment>
    );
  } else if (props.isBoolean) {
    editInput = (
      <Input
        type="checkbox"
        name={`${props.field}`}
        onChange={event => props.onChangeValue(event, props.field)}
        checked={props.values || false}
      />
    );
  } else {
    editInput = (
      <TextArea
        name={`${props.field}`}
        onChange={event => props.onChangeValue(event, props.field)}
        placeholder={`Enter ${props.field} for the record`}
        value={props.values || ""}
      />
    );
  }

  return (
    <section>
      <Form.Field required={props.required}>
        <label>{props.label}</label>
        {editInput}
      </Form.Field>
    </section>
  );
});

export default EditMetadata;
