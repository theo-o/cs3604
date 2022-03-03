import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { API, graphqlOperation } from "aws-amplify";
import PDFViewer from "../../components/PDFViewer";
import KalturaPlayer from "../../components/KalturaPlayer";
import MiradorViewer from "../../components/MiradorViewer";
import { OBJModel } from "react-3d-viewer";
import MediaElement from "../../components/MediaElement";
import PodcastMediaElement from "../../components/PodcastMediaElement";
import SearchBar from "../../components/SearchBar";
import Breadcrumbs from "../../components/Breadcrumbs.js";
import SiteTitle from "../../components/SiteTitle";
import {
  RenderItemsDetailed,
  addNewlineInDesc
} from "../../lib/MetadataRenderer";
import {
  fetchLanguages,
  getTopLevelParentForCollection
} from "../../lib/fetchTools";
import { buildRichSchema } from "../../lib/richSchemaTools";
import { searchArchives } from "../../graphql/queries";
import RelatedItems from "../../components/RelatedItems";
import Citation from "../../components/Citation";
import Thumbnail from "../../components/Thumbnail";
import MtlElement from "../../components/MtlElement";
import X3DElement from "../../components/X3DElement";
import SocialButtons from "../../components/SocialButtons";

import "../../css/ArchivePage.scss";

class ArchivePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      collectionCustomKey: "",
      collectionTitle: "",
      page: 0,
      category: "archive",
      searchField: "title",
      view: "Gallery",
      info: {},
      languages: null
    };
  }

  async getArchive(customKey) {
    const options = {
      order: "ASC",
      limit: 1,
      filter: {
        item_category: { eq: process.env.REACT_APP_REP_TYPE },
        visibility: { eq: true },
        custom_key: {
          eq: `ark:/53696/${this.props.customKey}`
        }
      }
    };
    const response = await API.graphql(
      graphqlOperation(searchArchives, options)
    );
    try {
      const item = response.data.searchArchives.items[0];
      const topLevelParentCollection = await getTopLevelParentForCollection(
        item
      );

      const collectionCustomKey = topLevelParentCollection.custom_key;
      const archiveSchema = this.buildArchiveSchema(item);

      this.setState({
        item: item,
        collectionCustomKey: collectionCustomKey,
        collectionTitle: topLevelParentCollection.title,
        info: archiveSchema
      });
    } catch (error) {
      console.error(`Error fetching item: ${customKey}`);
    }
  }

  updateFormState = (name, val) => {
    this.setState({
      [name]: val
    });
  };

  setPage = page => {
    this.setState({ page: page });
  };

  addNewlineInDesc(content) {
    if (content) {
      content = content.split("\n").map((value, index) => {
        return <p key={index}>{value}</p>;
      });
    }

    return content;
  }

  isImgURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }

  isAudioURL(url) {
    return url.match(/\.(mp3|ogg|wav)$/) != null;
  }

  isVideoURL(url) {
    return url.match(/\.(mp4|mov)$/) != null;
  }

  isKalturaURL(url) {
    return url.match(/(video.vt.edu\/media)/) != null;
  }

  isPdfURL(url) {
    return url.match(/\.(pdf)$/) != null;
  }

  isJsonURL(url) {
    return url.match(/\.(json)$/) != null;
  }

  isObjURL(url) {
    return url.match(/\.(obj|OBJ)$/) != null;
  }
  isMtlUrl(url) {
    return url.match(/\.(mtl)$/) != null;
  }
  isX3DUrl(url) {
    return url.match(/\.(x3d|X3D)$/) != null;
  }

  buildArchiveSchema(item) {
    let info = {};
    info["audio"] = item.manifest_url;
    info["collectionTitle"] = this.state.collectionTitle;
    let collectionURL = window.location.href.replace("archive", "collection");
    let collectionNoid = this.state.collectionCustomKey.replace(
      "ark:/53696/",
      ""
    );

    info["collectionURL"] =
      collectionURL.substring(0, collectionURL.length - 8) + collectionNoid;
    info["datePublished"] = item.create_date;
    info["description"] = item.description;
    if (item.manifest_file_characterization) {
      const characterization = JSON.parse(item.manifest_file_characterization);
      info["duration"] = characterization.duration;
    }
    info["title"] = item.title;
    info["url"] = window.location.href;

    return info;
  }

  buildTrack(url, thumbnail_path) {
    const nameExt = this.fileNameFromUrl(url);
    const ext = nameExt.split(".").pop();
    const track = {};
    track["kind"] = "subtitles";
    track["label"] = "English";
    track["src"] = url.replace(`.${ext}`, ".srt");
    track["srclang"] = "en";
    track["poster"] = thumbnail_path;
    return track;
  }

  mediaDisplay(item) {
    let display = null;
    let config = {};
    let tracks = [];
    let width = Math.min(
      document.getElementById("content-wrapper").offsetWidth - 50,
      720
    );
    if (this.isJsonURL(item.manifest_url)) {
      display = <MiradorViewer item={item} site={this.props.site} />;
    } else if (this.isImgURL(item.manifest_url)) {
      display = (
        <Thumbnail
          className="item-img"
          item={item}
          imgURL={item.manifest_url}
          altText={item.title}
        />
      );
    } else if (this.isAudioURL(item.manifest_url)) {
      const track = this.buildTrack(item.manifest_url, item.thumbnail_path);
      tracks.push(track);
      display = this.mediaElement(
        item.manifest_url,
        "audio",
        config,
        tracks,
        item.title
      );
    } else if (this.isVideoURL(item.manifest_url)) {
      const track = this.buildTrack(item.manifest_url, item.thumbnail_path);
      tracks.push(track);
      display = this.mediaElement(item.manifest_url, "video", config, tracks);
    } else if (this.isKalturaURL(item.manifest_url)) {
      display = <KalturaPlayer manifest_url={item.manifest_url} />;
    } else if (this.isPdfURL(item.manifest_url)) {
      display = (
        <PDFViewer manifest_url={item.manifest_url} title={item.title} />
      );
    } else if (this.isObjURL(item.manifest_url)) {
      const texPath = item.manifest_url.substr(
        0,
        item.manifest_url.lastIndexOf("/") + 1
      );
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <OBJModel src={item.manifest_url} texPath={texPath} />
        </div>
      );
    } else if (this.isMtlUrl(item.manifest_url)) {
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <MtlElement mtl={item.manifest_url} />
        </div>
      );
    } else if (this.isX3DUrl(item.manifest_url)) {
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <X3DElement url={item.manifest_url} frameSize={width} />
        </div>
      );
    } else {
      display = <></>;
    }
    return display;
  }

  fileExtensionFromFileName(filename) {
    return filename.split(".")[1];
  }

  fileNameFromUrl(manifest_url) {
    let url = new URL(manifest_url);
    return url.pathname.split("/").reverse()[0];
  }

  findResourceType() {
    if (
      this.state.item.resource_type &&
      this.state.item.resource_type.find(item => item === "podcast")
    ) {
      return "PodcastEpisode";
    } else {
      return "Unknown";
    }
  }

  mediaElement(src, type, config, tracks, title = "") {
    const filename = this.fileNameFromUrl(src);
    const typeString = `${type}/${this.fileExtensionFromFileName(filename)}`;
    const srcArray = [{ src: src, type: typeString }];
    let podcast = false;
    podcast = this.state.item.resource_type
      ? this.state.item.resource_type.find(item => item === "podcast")
      : false;
    return podcast !== "podcast" ? (
      <MediaElement
        id="player1"
        mediaType={type}
        preload="none"
        controls
        width="100%"
        height="640"
        poster={tracks[0].poster}
        sources={JSON.stringify(srcArray)}
        options={JSON.stringify(config)}
        tracks={JSON.stringify(tracks)}
        title={title}
        transcript={JSON.parse(this.state.item.archiveOptions)}
      />
    ) : (
      <PodcastMediaElement
        id="player1"
        mediaType={type}
        preload="none"
        controls
        width="100%"
        height="640"
        poster={tracks[0].poster}
        sources={JSON.stringify(srcArray)}
        options={JSON.stringify(config)}
        tracks={JSON.stringify(tracks)}
        title={title}
        transcript={JSON.parse(this.state.item.archiveOptions)}
      />
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.getArchive(this.props.customKey);
    }
  }

  componentDidMount() {
    fetchLanguages(this, this.props.site, "abbr");
    this.getArchive(this.props.customKey);
  }

  render() {
    if (
      this.state.languages &&
      this.state.item &&
      this.state.collectionCustomKey
    ) {
      // log archive identifier in ga
      window.ga("send", "pageview", {
        dimension1: this.state.item.identifier
      });
      return (
        <div className="item-page-wrapper">
          <SiteTitle
            siteTitle={this.props.site.siteTitle}
            pageTitle={this.state.item.title}
          />
          <Helmet
            script={[
              { type: "text/javascript" },
              {
                type: "application/ld+json",
                innerHTML: buildRichSchema(
                  this.findResourceType(),
                  this.state.info
                )
              }
            ]}
          ></Helmet>
          <SearchBar
            category={this.state.category}
            view={this.state.view}
            searchField={this.state.searchField}
            setPage={this.setPage}
            updateFormState={this.updateFormState}
          />

          <div className="item-image-section">
            <div className="breadcrumbs-wrapper">
              <nav aria-label="Collection breadcrumbs">
                <Breadcrumbs category={"Archives"} record={this.state.item} />
              </nav>
            </div>
            <div className="row">
              <div
                className="col-sm-12"
                id="item-media-col"
                role="region"
                aria-label="Item media"
              >
                {this.mediaDisplay(this.state.item)}
              </div>
            </div>
          </div>
          <div
            className="row item-details-section"
            role="region"
            aria-label="Item details"
          >
            <div className="col-lg-6 details-section-description">
              <h2>{this.state.item.title}</h2>
              {addNewlineInDesc(this.state.item.description)}
            </div>
            <div className="col-lg-6 details-section-metadata">
              <SocialButtons
                buttons={JSON.parse(this.props.site.siteOptions)}
                url={window.location.href}
                title={this.state.item.title}
                media={this.state.item.thumbnail_path}
              />
              <Citation item={this.state.item} site={this.props.site} />
              <table aria-label="Item Metadata">
                <tbody>
                  <RenderItemsDetailed
                    keyArray={
                      JSON.parse(this.props.site.displayedAttributes)["archive"]
                    }
                    item={this.state.item}
                    languages={this.state.languages}
                    collectionCustomKey={this.state.collectionCustomKey}
                    site={this.props.site}
                  />
                </tbody>
              </table>
            </div>
          </div>
          <RelatedItems collection={this.state.item} />
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default ArchivePage;
