import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import SiteTitle from "../../components/SiteTitle";
import { fetchLanguages } from "../../lib/fetchTools";
import { fetchSearchResults } from "../../lib/fetchTools";

import SearchResults from "./SearchResults";

let nextTokens = [];

class SearchLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: null,
      nextTokens: [],
      limit: 10,
      page: 0,
      totalPages: 1,
      filters: {},
      field: "title",
      view: "Gallery",
      q: "",
      languages: null,
      sort: {
        field: "start_date",
        direction: "asc"
      }
    };
  }

  updateFormState = (name, val) => {
    if (name === "sort") {
      this.setState(
        {
          [name]: val
        },
        function() {
          this.loadItems();
        }
      );
    } else {
      const url = this.setParams(name, val);
      this.props.history.push(`?${url}`);
    }
  };

  setParams = (name, val) => {
    let q = name === "q" ? val : this.state.q;
    let field = name === "field" ? val : this.state.field;
    let view = name === "view" ? val : this.state.view;
    let filters = name === "filters" ? val : this.state.filters;
    const searchParams = new URLSearchParams();
    const searchQuery = {
      q: q,
      field: field,
      view: view,
      ...filters
    };

    for (const key of Object.keys(searchQuery)) {
      if (Array.isArray(searchQuery[key])) {
        searchQuery[key].forEach(val => {
          searchParams.append(key, val);
        });
      } else {
        searchParams.set(key, searchQuery[key]);
      }
    }
    return searchParams.toString();
  };

  previousPage() {
    this.setState(
      {
        page: this.state.page - 1
      },
      function() {
        this.loadItems();
        this.scrollUp();
      }
    );
  }

  nextPage() {
    this.setState(
      {
        page: this.state.page + 1
      },
      function() {
        this.loadItems();
        this.scrollUp();
      }
    );
  }
  setPage(page) {
    this.setState(
      {
        page: page
      },
      function() {
        this.loadItems();
      }
    );
  }

  scrollUp() {
    if (typeof this.props.scrollUp === "function") {
      this.props.scrollUp(new Event("click"));
    }
  }

  setLimit(event, result) {
    this.setState(
      {
        limit: parseInt(result.value),
        page: 0
      },
      function() {
        this.loadItems();
      }
    );
  }

  getParams(location) {
    const searchParams = new URLSearchParams(location.search);
    let restQuery = {};
    const otherKeys = ["field", "q", "view"];
    for (let pair of searchParams.entries()) {
      if ((pair[0] === "category" || pair[0] === "collection") && pair[1]) {
        restQuery[pair[0]] = pair[1];
      } else if (!otherKeys.includes(pair[0]) && pair[1]) {
        if (!restQuery[pair[0]]) {
          restQuery[pair[0]] = [];
        }
        restQuery[pair[0]].push(pair[1]);
      }
    }
    return {
      q: searchParams.get("q") || "",
      field: searchParams.get("field") || "title",
      view: searchParams.get("view") || "Gallery",
      ...restQuery
    };
  }

  async loadItems() {
    const { q, field, view, sort, ...filters } = this.getParams(
      this.props.location
    );
    let searchInput = {};
    if (field && q) {
      searchInput = { [field]: q };
    }
    this.setState({
      q: q,
      field: field,
      view: view,
      filters: filters
    });
    let options = {
      filter: { ...filters, ...searchInput },
      sort: this.state.sort,
      limit: this.state.limit,
      nextToken: this.state.nextTokens[this.state.page]
    };
    let searchResults = await fetchSearchResults(this, options);
    nextTokens[this.state.page + 1] = searchResults.nextToken;
    this.setState({
      items: searchResults.items,
      total: searchResults.total,
      nextTokens: nextTokens,
      totalPages: Math.ceil(searchResults.total / this.state.limit)
    });
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      console.log("route change");
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      fetchLanguages(this, this.props.site, "name", this.loadItems);
    }
  }

  componentDidMount() {
    fetchLanguages(this, this.props.site, "name", this.loadItems);
  }

  render() {
    if (this.state.items !== null) {
      let searchPageInfo = JSON.parse(this.props.site.searchPage);
      var facetsData = [];
      Object.keys(searchPageInfo.facets).forEach(function(key) {
        var value = searchPageInfo.facets[key];
        value["name"] = key;
        facetsData.push(value);
      });

      facetsData = facetsData.sort((a, b) => a.label.localeCompare(b.label));

      return (
        <div>
          <SiteTitle siteTitle={this.props.site.siteTitle} pageTitle="Search" />
          <SearchResults
            site={this.props.site}
            items={this.state.items}
            total={this.state.total}
            page={this.state.page}
            limit={this.state.limit}
            setLimit={this.setLimit.bind(this)}
            previousPage={this.previousPage.bind(this)}
            nextPage={this.nextPage.bind(this)}
            setPage={this.setPage.bind(this)}
            totalPages={this.state.totalPages}
            filters={this.state.filters}
            field={this.state.field}
            q={this.state.q}
            view={this.state.view}
            updateFormState={this.updateFormState}
            searchFacets={facetsData}
            searchSorts={searchPageInfo.sort}
          />
        </div>
      );
    } else {
      return <div>Loading</div>;
    }
  }
}

export default withRouter(SearchLoader);
