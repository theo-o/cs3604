import React, { Component } from "react";
import flvjs from "flv.js";
import hlsjs from "hls.js";
import "mediaelement";

import "mediaelement/build/mediaelementplayer.min.css";
import "mediaelement/build/mediaelement-flash-video.swf";
import { asyncGetFile } from "../lib/fetchTools";
import "../css/podcastMediaElement.scss";

export default class PodcastMediaElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: null,
      audioImg: null,
      audioSrc: null
    };
  }

  success(media, node, instance) {
    console.log(instance);
  }

  error(media) {
    console.log(media);
  }

  async getAssetFiles() {
    const sources = JSON.parse(this.props.sources);
    let audioResponse = null;
    if (sources[0].src) {
      const audioUrl = sources[0].src;
      audioResponse = await asyncGetFile(audioUrl, "audio", this, "audioSrc");
    }
    if (audioResponse.success && this.props.poster) {
      await asyncGetFile(this.props.poster, "image", this, "audioImg");
    }
  }

  componentDidMount() {
    this.getAssetFiles();

    const { MediaElementPlayer } = global;
    if (!MediaElementPlayer) {
      return;
    }

    const options = Object.assign({}, JSON.parse(this.props.options), {
      pluginPath: "./static/media/",
      success: (media, node, instance) => this.success(media, node, instance),
      error: (media, node) => this.error(media, node)
    });

    window.flvjs = flvjs;
    window.Hls = hlsjs;
    this.setState({ player: new MediaElementPlayer(this.props.id, options) });
  }

  componentWillUnmount() {
    if (this.state.player) {
      this.state.player.remove();
      this.setState({ player: null });
    }
  }

  audioImg() {
    return (
      <div className="audio-img-wrapper">
        <img
          className="audio-img"
          src={this.state.audioImg}
          alt={this.props.title}
        />
      </div>
    );
  }

  transcriptButton() {
    if (this.props.transcript) {
      return (
        <button type="button" className="transcript-button">
          <i class="fas fa-file-alt" aria-label="Transcript"></i>
        </button>
      );
    }
  }

  render() {
    if (!this.state.audioSrc || !this.state.audioImg) {
      return <></>;
    }
    const props = this.props,
      tracks = JSON.parse(props.tracks),
      sourceTags = [],
      tracksTags = [];
    const sources = JSON.parse(this.props.sources);
    sourceTags.push(
      `<source src="${this.state.audioSrc}" type="${sources[0].type}">`
    );

    for (let i = 0, total = tracks.length; i < total; i++) {
      const track = tracks[i];
      tracksTags.push(
        `<track src="${track.src}" kind="${track.kind}" srclang="${
          track.lang
        }"${track.label ? ` label=${track.label}` : ""}>`
      );
    }

    const mediaBody = `${sourceTags.join("\n")}
        ${tracksTags.join("\n")}`,
      mediaHtml =
        props.mediaType === "video"
          ? `<video id="${props.id}" width="${props.width}" height="${
              props.height
            }"${props.poster ? ` poster=${props.poster}` : ""}
          ${props.controls ? " controls" : ""}${
              props.preload ? ` preload="${props.preload}"` : ""
            }>
          ${mediaBody}
        </video>`
          : `<audio id="${props.id}" width="${props.width}" controls>
            ${mediaBody}
          </audio>`;
    return (
      <div className="media-element-container">
        {props.mediaType === "audio" && this.audioImg()}
        <div className="media-player-wrapper">
          <div
            className="media-player"
            dangerouslySetInnerHTML={{ __html: mediaHtml }}
          ></div>
          <div className="media-buttons">
            {this.transcriptButton()}
            <a
              href={this.state.audioSrc}
              className="download-link"
              download
              aria-label="Download episode"
            >
              <i className="fa fa-download"></i>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
