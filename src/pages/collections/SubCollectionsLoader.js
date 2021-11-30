import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { getCollectionmap } from "../../graphql/queries";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import SvgIcon from "@material-ui/core/SvgIcon";
import { getTopLevelParentForCollection } from "../../lib/fetchTools";

class SubCollectionsLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: null,
      nextTokens: [],
      limit: 10,
      page: 0,
      totalPages: 1,
      mapID: null,
      collectionMap: null,
      expanded: null
    };
  }

  async loadMap() {
    if (this.state.mapID == null) {
      this.getMapID(this.props.collection.id);
    } else if (this.state.mapID) {
      const response = await API.graphql(
        graphqlOperation(getCollectionmap, {
          id: this.state.mapID
        })
      );
      let map = null;
      try {
        map = response.data.getCollectionmap.map_object;
      } catch (error) {
        console.error("Error fetching collection tree map");
      }
      if (map) {
        const mapObj = JSON.parse(map);
        const sorted = this.sortMap(mapObj);
        this.setState(
          {
            collectionMap: sorted,
            expanded: this.props.collection.heirarchy_path
          },
          function() {
            this.updateParentSubcollections(
              this.props.collection,
              sorted.children
            );
          }
        );
      }
    }
  }

  async getMapID() {
    let mapID = null;
    if (this.props.collection.collectionmap_id) {
      mapID = this.props.collection.collectionmap_id;
    } else {
      const topLevelParent = await getTopLevelParentForCollection(
        this.props.collection
      );
      mapID = topLevelParent.collectionmap_id;
    }
    this.setState({ mapID: mapID }, function() {
      this.loadMap();
    });
  }

  sortMap(map) {
    const sort = function(node, context) {
      if (Array.isArray(node.children)) {
        const tempChildren = node.children.slice();
        node.children = context.sortChildren(tempChildren);
        for (const child in node.children) {
          sort(node.children[child], context);
        }
      }
    };
    const temp = JSON.parse(JSON.stringify(map));
    sort(temp, this);
    return temp;
  }

  sortChildren(children) {
    return children.sort(function(a, b) {
      let aArray = a.name.split(" ");
      let bArray = b.name.split(" ");
      let aNum = parseInt(aArray[aArray.length - 1]);
      let bNum = parseInt(bArray[bArray.length - 1]);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum > bNum ? 1 : -1;
      } else {
        return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
      }
    });
  }

  buildLabel(node) {
    const target = `/collection/${node.custom_key}`;
    return <NavLink to={target}>{node.name}</NavLink>;
  }

  updateParentSubcollections(collection, subCollections) {
    this.props.updateSubCollections(
      this.props.parent,
      collection,
      subCollections
    );
  }

  handleToggle = (event, nodeIds) => {
    this.setState({ expanded: nodeIds });
  };

  componentDidUpdate(prevProps) {
    if (this.props.collection.id !== prevProps.collection.id) {
      this.loadMap();
    }
  }

  componentDidMount() {
    this.loadMap();
  }

  render() {
    function MinusSquare(props) {
      return (
        <SvgIcon
          fontSize="inherit"
          style={{ width: 14, height: 14 }}
          {...props}
        >
          {/* tslint:disable-next-line: max-line-length */}
          <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
        </SvgIcon>
      );
    }

    function PlusSquare(props) {
      return (
        <SvgIcon
          fontSize="inherit"
          style={{ width: 14, height: 14 }}
          {...props}
        >
          {/* tslint:disable-next-line: max-line-length */}
          <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
        </SvgIcon>
      );
    }
    let return_value = null;
    if (this.state.collectionMap) {
      const renderTree = nodes => (
        <TreeItem
          key={nodes.id}
          nodeId={nodes.id}
          label={this.buildLabel(nodes)}
        >
          {Array.isArray(nodes.children)
            ? nodes.children.map(node => renderTree(node))
            : null}
        </TreeItem>
      );
      return_value = (
        <div className="collection-items-list-wrapper">
          <div className="mb-3">
            <h2
              className="subcollection-header"
              id="collection-subcollections-section"
            >
              Collection Organization
            </h2>
          </div>

          <TreeView
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            expanded={this.state.expanded}
            selected={[this.props.collection.id]}
            onNodeToggle={this.handleToggle}
          >
            {renderTree(this.state.collectionMap)}
          </TreeView>
        </div>
      );
    } else {
      return_value = <div>Loading...</div>;
    }
    return return_value;
  }
}

export default SubCollectionsLoader;
