import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import qs from "query-string";
import ResultsNumberDropdown from "../../components/ResultsNumberDropdown";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import SearchFacets from "./SearchFacets";
import ViewBar from "../../components/ViewBar";
import SortbyDropdown from "../../components/SortbyDropdown";
import ItemsList from "./ItemsList";
import { fetchLanguages } from "../../lib/fetchTools";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { labelAttr } from "../../lib/MetadataRenderer";
import "../../css/ListPages.scss";
import "../../css/SearchResult.scss";

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      languages: null,
      isActive: false
    };
    this.updateModal = this.updateModal.bind(this);
  }

  updateModal() {
    this.setState(prevState => {
      return {
        isActive: !prevState.isActive
      };
    });
  }

  componentDidMount() {
    fetchLanguages(this, this.props.site, "abbr");
  }

  onClearArray = () => {
    this.props.updateFormState("filters", {});
  };

  render() {
    const ItemsPaginationDisplay = ({ atBottom }) => {
      return (
        <Pagination
          numResults={this.props.items.length}
          total={this.props.total}
          page={this.props.page}
          limit={this.props.limit}
          previousPage={this.props.previousPage}
          nextPage={this.props.nextPage}
          totalPages={this.props.totalPages}
          isSearch={true}
          atBottom={atBottom}
        />
      );
    };

    const defaultSearch = {
      field: this.props.field,
      q: this.props.q,
      view: this.props.view
    };

    const FiltersDisplay = () => {
      if (Object.keys(this.props.filters).length > 0) {
        return (
          <div
            className="facet-navbar"
            role="group"
            aria-roledescription="Current filters"
          >
            <div className="facet-navbar-heading">
              <h2 id="facet-navbar-title">Filtering by:</h2>
            </div>
            <div
              className="facet-navbar-facets"
              data-cy="search-filter-field-value-pairs"
            >
              <div
                id="facet-navbar-grid"
                role="grid"
                aria-labelledby="facet-navbar-title"
                aria-rowcount={Object.keys(this.props.filters).length}
                data-wrap-cols="true"
              >
                
                {Object.entries(this.props.filters).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return value.map((val, idx) => {
                      return (
                        <div key={`${idx}_${val}`} role="row">
                          <div role="gridcell" tabIndex="-1">
                            <span className="facet-navbar-name">{key}</span>
                            <span className="facet-navbar-arrow">
                              <i className="fas fa-angle-right"></i>
                            </span>
                            <span className="facet-navbar-selection">
                              {labelAttr(val, key, this.state.languages)}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div key={key} role="row">
                        <div role="gridcell" tabIndex="-1">
                          <span className="facet-navbar-name">{key}</span>
                          <span className="facet-navbar-arrow">
                            <i className="fas fa-angle-right"></i>
                          </span>
                          <span className="facet-navbar-selection">
                            {labelAttr(value, key, this.state.languages)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
            <div className="facet-navbar-clear">
              <p id="clearButton">
                Clear All Filters
                <span>
                  <NavLink
                    to={`/search/?${qs.stringify(defaultSearch)}`}
                    aria-labelledby="clearButton"
                    role="button"
                    aria-controls="facet-navbar-grid"
                    aria-live="off"
                  >
                    <i className="fas fa-times"></i>
                  </NavLink>
                </span>
              </p>
            </div>
          </div>
        );
      } else return null;
    };

    if (this.state.languages) {
      return (
        <div className="search-result-wrapper">
          <SearchBar
            filters={this.props.filters}
            view={this.props.view}
            field={this.props.field}
            q={this.props.q}
            setPage={this.props.setPage}
            updateFormState={this.props.updateFormState}
          />
          <div className="container search-results">
            <div className="row">
              <div id="sidebar" className="col-lg-3 col-sm-12">
                <SearchFacets
                  filters={this.props.filters}
                  field={this.props.field}
                  q={this.props.q}
                  total={this.props.total}
                  view={this.props.view}
                  updateFormState={this.props.updateFormState}
                  isActive={this.state.isActive}
                  updateModal={this.updateModal}
                  defaultSearch={defaultSearch}
                  searchFacets={this.props.searchFacets}
                  languages={this.state.languages}
                />
              </div>
              <div id="content" className="col-lg-9 col-sm-12">
                <div
                  className="navbar navbar-light"
                  id="search-tools"
                  role="region"
                  aria-label="Search Tools"
                  aria-controls="search-results"
                >
                  <div className="view-info">
                    <ItemsPaginationDisplay atBottom={false} />
                    <div
                      className="facet-button-navbar"
                      onClick={this.updateModal}
                    >
                      <button
                        type="button"
                        data-toggle="tooltip"
                        title="Filters"
                        aria-label="Filters"
                        aria-pressed={this.state.isActive}
                      >
                        <FontAwesomeIcon
                          icon={faFilter}
                          color="var(--themeHighlightColor)"
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    className="collection-filters"
                    role="group"
                    aria-roledescription="Sort options"
                  >
                    <SortbyDropdown
                      siteSort={this.props.searchSorts}
                      updateFormState={this.props.updateFormState}
                    />
                  </div>
                  <div className="view-options">
                    <ResultsNumberDropdown setLimit={this.props.setLimit} />
                    <ViewBar
                      view={this.props.view}
                      updateFormState={this.props.updateFormState}
                      pageViews={["Gallery", "List", "Masonry"]}
                    />
                  </div>
                  <div className="facet-navbar-section" aria-live="polite">
                    <FiltersDisplay />
                  </div>
                </div>
                <ItemsList items={this.props.items} view={this.props.view} />
              </div>
            </div>
            <div aria-live="polite">
              <ItemsPaginationDisplay atBottom={true} />
            </div>
          </div>
        </div>
      );
    } else {
      return <> </>;
    }
  }
}

export default SearchResults;
