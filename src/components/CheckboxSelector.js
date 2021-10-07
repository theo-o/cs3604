import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { input } from "./FormFields";

import "semantic-ui-css/semantic.min.css";

class CheckboxSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: [],
      selectedValues: [],
      addedValues: []
    };
  }

  valueOptions = () => {
    return this.props.values.map(val => ({
      key: val,
      text: val,
      value: val
    }));
  };

  updateFilter = (e, { value }) => {
    this.setState({ selectedValue: value });

    let filter = {};
    if (value !== "All") {
      filter = {
        [this.props.field]: value
      };
    }
    this.props.updateFormState("filter", filter);
  };

  checkBoxes() {
    let boxes = null;
    if (this.props.values.length) {
      boxes = this.props.values.map(value => {
        return input(
          {
            outerClass: "checkbox-inline",
            label: `${value} `,
            id: value,
            name: value,
            onChange: this.props.component.handleValueChange("subject", null),
            checked: this.state.selectedValues.indexOf(value) !== -1
          },
          "checkBox"
        );
      });
    }
    return boxes;
  }

  handleRemoveValue(facetKey, idx) {
    const added = this.state.addedValues;
    added.splice(idx, 1);
    this.setState({ addedValues: added });
  }

  newValueInput(facetKey, value, idx) {
    return (
      <li key={`${facetKey}_li_${idx}`} id={`${facetKey}_li_${idx}`}>
        <Form.Input
          key={`${facetKey}_value_${idx}`}
          value={value}
          id={`${facetKey}_value_${idx}`}
          name={`${facetKey}_value_${idx}`}
          placeholder={`${facetKey} value #${idx + 1}`}
          onChange={this.props.component.handleValueChange(
            facetKey,
            idx,
            this.handleNewValueChange
          )}
          datafacet={facetKey}
        />
        <button
          type="button"
          onClick={this.props.handleRemoveValue(
            facetKey,
            idx,
            this.handleRemoveValue.bind(this)
          )}
          className="small deleteValue"
        >
          X
        </button>
        <div className="clear"></div>
      </li>
    );
  }

  newValues() {
    const added = this.state.addedValues;
    let newInputs = [];
    for (const idx in added) {
      if (
        this.props.values.indexOf(added[idx]) === -1 ||
        this.props.values.indexOf(added[idx]) === 0
      ) {
        newInputs.push(this.newValueInput(this.props.facet, added[idx], idx));
      }
    }
    return <ul>{newInputs}</ul>;
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedValues !== prevProps.selectedValues) {
      this.setState({
        values: this.props.values || [],
        selectedValues: this.props.selectedValues || []
      });
    }
  }

  componentDidMount() {
    this.setState({
      values: this.props.values || [],
      selectedValues: this.props.selectedValues || []
    });
  }

  handleNewValueChange = (facetKey, idx, value) => {
    const tempAdded = this.state.addedValues;
    tempAdded[idx] = value;
    this.setState({ addedValues: tempAdded });
  };

  handleAddValue(facetKey) {
    const newValueInfo = this.props.handleAddValue(facetKey);
    const tempAdded = this.state.addedValues;
    tempAdded[newValueInfo.idx] = newValueInfo.value;
    this.setState({ addedValues: tempAdded });
  }

  render() {
    const facetKey = this.props.facet;
    return (
      <section key={facetKey} id={facetKey}>
        <fieldset>
          <legend className="admin">{`Configuration for facet field: ${facetKey}`}</legend>
          <Form.Input
            key={`${facetKey}_label`}
            label="Label"
            value={this.props.label}
            name={`${facetKey}_label`}
            placeholder="Enter Facet Label"
            onChange={this.props.updateInputValue(facetKey)}
          />
          <h4>Values:</h4>
          {this.checkBoxes()}

          {this.newValues()}
          <button
            type="button"
            onClick={() => this.handleAddValue(facetKey)}
            className="small"
          >
            Add Value
          </button>
        </fieldset>

        <div className="deletePageWrapper">
          <NavLink
            id={`${facetKey}_delete_link`}
            className="deletePage"
            to="#"
            onClick={() => this.props.deleteFacet(facetKey)}
          >
            Delete Facet Field
          </NavLink>
          <div className="clear"></div>
        </div>
      </section>
    );
  }
}

export default CheckboxSelector;
