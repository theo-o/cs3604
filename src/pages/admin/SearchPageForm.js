import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { addedDiff, updatedDiff } from "deep-object-diff";

import "../../css/adminForms.scss";

class SearchPageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchPage: {},
      prevSearchPage: {},
      viewState: "view",
      newFacet: "",
      newSort: ""
    };
  }

  availableFacets = () => {
    let AllFacets = [
      "creator",
      "collection",
      "format",
      "language",
      "location",
      "medium",
      "resource_type",
      "subject",
      "tags"
    ];
    return AllFacets.filter(
      el => !Object.keys(this.state.searchPage.facets).includes(el)
    );
  };

  facetOptions = () => {
    return this.availableFacets().map(facet => (
      <option value={facet} key={facet}>
        {facet}
      </option>
    ));
  };

  availableSorts = () => {
    let AllSorts = [
      "title (asc)",
      "title (desc)",
      "start_date (desc)",
      "start_date (asc)",
      "identifier (asc)",
      "identifier (desc)"
    ];
    const currentSorts = this.state.searchPage.sort.map(sortField => {
      return `${sortField.field} (${sortField.direction})`;
    });
    return AllSorts.filter(el => !currentSorts.includes(el));
  };

  sortOptions = () => {
    return this.availableSorts().map(sortField => (
      <option value={sortField} key={sortField}>
        {sortField}
      </option>
    ));
  };

  loadSite = () => {
    if (this.props.site) {
      const searchPage = JSON.parse(this.props.site.searchPage);
      const facets = searchPage.facets;
      const sort = searchPage.sort;
      const sorted_searchFacets = {};
      Object.keys(searchPage.facets)
        .sort()
        .forEach(function(key) {
          sorted_searchFacets[key] = facets[key];
        });
      this.setState({
        searchPage: {
          facets: sorted_searchFacets,
          sort: sort
        },
        prevSearchPage: {
          facets: sorted_searchFacets,
          sort: sort
        }
      });
    }
  };

  componentDidMount() {
    this.loadSite();
  }

  updateInputValue = facetKey => event => {
    let tempSearchPage = { ...this.state.searchPage };
    let tempFacets = tempSearchPage.facets;
    this.setState({
      searchPage: {
        ...tempSearchPage,
        facets: {
          ...tempFacets,
          [facetKey]: { ...tempFacets[facetKey], label: event.target.value }
        }
      }
    });
  };

  handleSubmit = async () => {
    this.setState({ viewState: "view" });

    const addedData = addedDiff(
      this.state.prevSearchPage,
      this.state.searchPage
    );
    const newData = updatedDiff(
      this.state.prevSearchPage,
      this.state.searchPage
    );
    const oldData = updatedDiff(
      this.state.searchPage,
      this.state.prevSearchPage
    );
    const deletedData = addedDiff(
      this.state.searchPage,
      this.state.prevSearchPage
    );
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
      searchPage: {
        facets: {
          added: addedData,
          deleted: deletedData,
          updated: updatedData
        }
      }
    };

    this.props.updateSite(
      eventInfo,
      "searchPage",
      JSON.stringify(this.state.searchPage)
    );
  };

  handleChange = (e, { value }) => {
    this.setState({ viewState: value });
  };

  handleValueChange = (facetKey, idx) => event => {
    let tempSearchPage = { ...this.state.searchPage };
    let tempFacets = tempSearchPage.facets;
    let tempValues = [...tempFacets[facetKey].values];
    tempValues[idx] = event.target.value;
    tempFacets = {
      ...tempFacets,
      [facetKey]: { ...tempFacets[facetKey], values: tempValues }
    };
    this.setState({
      searchPage: {
        ...tempSearchPage,
        facets: tempFacets
      }
    });
  };

  handleAddValue = facetKey => {
    let tempSearchPage = { ...this.state.searchPage };
    let tempFacets = tempSearchPage.facets;
    const len = tempFacets[facetKey].values.length;
    let tempValues = [
      ...tempFacets[facetKey].values,
      `${facetKey} new value ${len + 1}`
    ];
    this.setState({
      searchPage: {
        ...tempSearchPage,
        facets: {
          ...tempFacets,
          [facetKey]: { ...tempFacets[facetKey], values: tempValues }
        }
      }
    });
  };

  handleRemoveValue = (facetKey, idx) => () => {
    let tempSearchPage = { ...this.state.searchPage };
    let tempFacets = tempSearchPage.facets;
    let tempValues = tempFacets[facetKey].values.filter(
      (t, tidx) => idx !== tidx
    );
    this.setState({
      searchPage: {
        ...tempSearchPage,
        facets: {
          ...tempFacets,
          [facetKey]: { ...tempFacets[facetKey], values: tempValues }
        }
      }
    });
  };

  editFacetValue = (facetKey, value, idx) => {
    let fixedFacet = facetKey === "category" || facetKey === "date";
    return (
      <li key={`${facetKey}_li_${idx}`}>
        <Form.Input
          key={`${facetKey}_value_${idx}`}
          value={value}
          name={`${facetKey}_value_${idx}`}
          placeholder={`${facetKey} value #${idx + 1}`}
          onChange={this.handleValueChange(facetKey, idx)}
          readOnly={fixedFacet}
        />
        {fixedFacet ? (
          <></>
        ) : (
          <button
            type="button"
            onClick={this.handleRemoveValue(facetKey, idx)}
            className="small deleteValue"
          >
            X
          </button>
        )}
        <div className="clear"></div>
      </li>
    );
  };

  editFacet = facetKey => {
    const searchFacets = this.state.searchPage.facets;
    let fixedFacet = facetKey === "category" || facetKey === "date";
    return (
      <section key={facetKey}>
        <fieldset>
          <legend className="admin">{`Configuration for facet field: ${facetKey}`}</legend>
          <Form.Input
            key={`${facetKey}_label`}
            label="Label"
            value={searchFacets[facetKey].label}
            name={`${facetKey}_label`}
            placeholder="Enter Facet Label"
            onChange={this.updateInputValue(facetKey)}
          />
          <h4>Values:</h4>
          <ul>
            {searchFacets[facetKey].values.map((value, idx) => {
              return this.editFacetValue(facetKey, value, idx);
            })}
          </ul>
          {fixedFacet ? (
            <></>
          ) : (
            <button
              type="button"
              onClick={() => this.handleAddValue(facetKey)}
              className="small"
            >
              Add Value
            </button>
          )}
        </fieldset>
        {facetKey === "category" ? (
          <></>
        ) : (
          <div className="deletePageWrapper">
            <NavLink
              className="deletePage"
              to="#"
              onClick={() => this.deleteFacet(facetKey)}
            >
              Delete Facet Field
            </NavLink>
            <div className="clear"></div>
          </div>
        )}
      </section>
    );
  };

  addFacet = () => {
    let tempSearchPage = { ...this.state.searchPage };
    let newFacetKey = this.state.newFacet || this.availableFacets()[0];
    if (newFacetKey) {
      this.setState({
        searchPage: {
          ...tempSearchPage,
          facets: {
            ...tempSearchPage.facets,
            [newFacetKey]: { label: newFacetKey, values: [] }
          },
          newFacet: ""
        }
      });
    }
  };

  deleteFacet = facetKey => {
    let tempSearchPage = { ...this.state.searchPage };
    let tempFacets = tempSearchPage.facets;
    delete tempFacets[facetKey];
    this.setState({
      searchPage: {
        ...tempSearchPage,
        facets: tempFacets
      }
    });
  };

  dropdownChange = e => {
    this.setState({ newFacet: e.target.value });
  };

  addFacetSection = () => {
    if (this.availableFacets().length) {
      return (
        <div>
          <select
            value={this.state.newFacet}
            name="new_facet"
            id="new-facet-options"
            onChange={this.dropdownChange}
            className="custom-select"
          >
            {this.facetOptions()}
          </select>
          <NavLink className="addPage" to="#" onClick={() => this.addFacet()}>
            Add New Search Facet
          </NavLink>
          <div className="clear"></div>
        </div>
      );
    } else return <></>;
  };

  convertSortToObject = sortField => {
    return {
      field: sortField.substring(0, sortField.lastIndexOf("(") - 1),
      direction: sortField.substring(
        sortField.lastIndexOf("(") + 1,
        sortField.lastIndexOf(")")
      )
    };
  };

  editSort = (sortField, idx) => {
    return (
      <section key={`sort_${idx}`}>
        <p>Sort Field: {sortField.field}</p>
        <p>Sort Direction: {sortField.direction}</p>
        <div className="deletePageWrapper">
          <NavLink
            className="deletePage"
            to="#"
            onClick={() => this.deleteSort(sortField)}
          >
            Delete Sort Field
          </NavLink>
          <div className="clear"></div>
        </div>
      </section>
    );
  };

  addSort = () => {
    let tempSearchPage = { ...this.state.searchPage };
    let tempSort = tempSearchPage.sort;
    const sortToAdd = this.state.newSort || this.availableSorts()[0];
    if (sortToAdd) {
      this.setState({
        searchPage: {
          ...tempSearchPage,
          sort: [...tempSort, this.convertSortToObject(sortToAdd)]
        },
        newSort: ""
      });
    }
  };

  deleteSort = sortField => {
    let tempSearchPage = { ...this.state.searchPage };
    const tempSort = tempSearchPage.sort.filter(
      item =>
        !(
          item.field === sortField.field &&
          item.direction === sortField.direction
        )
    );
    this.setState({
      searchPage: {
        ...tempSearchPage,
        sort: tempSort
      }
    });
  };

  dropdownChange = e => {
    this.setState({ newSort: e.target.value });
  };

  addSortField = () => {
    if (this.availableSorts().length) {
      return (
        <div>
          <select
            value={this.state.newSort}
            name="new_sort"
            id="new-sort-options"
            onChange={this.dropdownChange}
            className="custom-select"
          >
            {this.sortOptions()}
          </select>
          <NavLink className="addPage" to="#" onClick={() => this.addSort()}>
            Add New Sort Field
          </NavLink>
          <div className="clear"></div>
        </div>
      );
    } else return <></>;
  };

  editSearchPageForm = () => {
    const searchFacets = this.state.searchPage.facets;
    const searchSort = this.state.searchPage.sort;
    if (searchFacets && searchSort) {
      return (
        <div>
          <Form onSubmit={this.handleSubmit}>
            {Object.keys(searchFacets).map(facetKey => {
              return this.editFacet(facetKey);
            })}
            {this.addFacetSection()}
            <hr />
            <ul>
              {searchSort.map((value, idx) => {
                return this.editSort(value, idx);
              })}
            </ul>
            {this.addSortField()}
            <Form.Button>Update Facet and Sort Fields</Form.Button>
          </Form>
        </div>
      );
    } else return <></>;
  };

  viewSearchPage = () => {
    const searchFacets = this.state.searchPage.facets;
    const searchSort = this.state.searchPage.sort;
    if (searchFacets && searchSort) {
      return (
        <div>
          <ul>
            {Object.keys(searchFacets).map((facetKey, idx) => {
              return (
                <li key={`facet_${facetKey}`}>
                  <div>
                    <p>Facet Field: {facetKey} </p>
                    <p>Label: {searchFacets[facetKey].label}</p>
                    <p>Values: </p>
                    <ul>
                      {searchFacets[facetKey].values.map((val, idx) => {
                        return <li key={`${facetKey}_value_${idx}`}>{val}</li>;
                      })}
                    </ul>
                  </div>
                  <hr />
                </li>
              );
            })}
          </ul>
          <ul>
            {searchSort.map((sort, idx) => {
              return (
                <li key={`sort_${idx}`}>
                  <p>Sort Field: {sort.field} </p>
                  <p>Sort Direction: {sort.direction}</p>
                  <hr />
                </li>
              );
            })}
          </ul>
        </div>
      );
    } else return <></>;
  };

  render() {
    return (
      <div className="col-lg-9 col-sm-12 admin-content">
        <h1>{`Search Page's facets and sort for: ${process.env.REACT_APP_REP_TYPE.toLowerCase()}`}</h1>
        <Form>
          <Form.Group inline>
            <label>Current mode:</label>
            <Form.Radio
              label="Edit"
              name="editSearchPageRadioGroup"
              value="edit"
              checked={this.state.viewState === "edit"}
              onChange={this.handleChange}
            />

            <Form.Radio
              label="View"
              name="viewSearchPageRadioGroup"
              value="view"
              checked={this.state.viewState === "view"}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>
        {this.state.viewState === "view"
          ? this.viewSearchPage()
          : this.editSearchPageForm()}
      </div>
    );
  }
}

export default SearchPageForm;
