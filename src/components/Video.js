import React from 'react';
import styled from 'styled-components';
import api from '../api.js';

const VideoBtns = styled.div`
    display: flex;
    flex-direction: row;
    text-align: center;
    justify-content: space-evenly;
    `;

const VideoWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #e6e6fa;`;

const VideoUrl = styled.textarea`
    display: flex;
    height: 25px;
    width: 90%;
    resize: none;
    overflow: auto;
    `;

const VideoPlayer = styled.div`
    pointer-events: none;
    `;

const PauseBtn = styled.div`
    background-image: url('/media/pause-button.PNG');
    background-repeat: no-repeat;
    background-size: cover;
    width: 50px;
    height: 50px;
    `;

const PlayBtn = styled.div`
    background-image: url('/media/play-button.PNG');
    background-repeat: no-repeat;
    background-size: cover;
    width: 50px;
    height: 50px;
    `;

const RewindBtn = styled.div`
    background-image: url('/media/rewind-button.PNG');
    background-repeat: no-repeat;
    background-size: cover;
    width: 50px;
    height: 50px;
    `;

let YT;

class Video extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            playing: false,
            player: null,
            videoId: this.props.videoInfo.videoId,
            idTextArea: this.props.videoInfo.videoId,
            duration: 0,
        };
        // when making this for the first time, we have to load the youtube api scripts
        // but if it already exist, we can skip this step
        let scriptTags = document.getElementsByTagName('script');
        let scriptList = Array.prototype.slice.call(scriptTags);
        let youtubeIframeTag = null;
        scriptList.forEach(function(tag){
            if (tag.src === 'https://www.youtube.com/iframe_api') {
                youtubeIframeTag = tag;
            }
        });

        if (youtubeIframeTag === null) {
            let tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

    loadVideoPlayer() {
        this.player = new YT.Player('video-player', {
            height: '100%',
            width: '100%',
            videoId: this.props.videoInfo.videoId,
            playerVars: {
                'controls': 0,
                'disablekb': 1,
                'enablejsapi': 1,
                'origin': window.origin,
                'start': this.props.videoInfo.time,
            },
            events: {
                'onReady': this.onPlayerReady,
            },
        });
    }

    componentDidMount() {
        // since Youtube API is async, the first time this component mounts, it may
        // not be ready yet, but 2nd time around we can load it directly
        if (YT) {
            this.loadVideoPlayer();
        }
        window.onYouTubeIframeAPIReady = () => {
            YT = window.YT;
            this.loadVideoPlayer();
        }
        this.setState({playing: this.props.videoInfo.playing});
    }

    componentDidUpdate(prevProps) {
        if (this.state.player === null) return;
        if (this.props.videoInfo.playing !== prevProps.videoInfo.playing){
            this.setState({playing: this.props.videoInfo.playing});
        }
        if (this.state.playing) {
            this.state.player.seekTo(this.props.videoInfo.time, true);
            this.state.player.playVideo();
        }
        else {
            this.state.player.pauseVideo();
        }
        if (prevProps.videoInfo.videoId !== this.props.videoInfo.videoId){
            this.state.player.loadVideoById(this.props.videoInfo.videoId);
            this.state.player.pauseVideo();
            this.setState({playing: false, duration: this.state.player.getDuration()});
        }
    } 

    onPlayerReady = (e) => {
        this.setState({player: e.target, duration: e.target.getDuration()});
    }

    playVideo = (e) => {
        e.preventDefault();
        if (this.props.videoInfo.playing) return;
        const data = {
            event: 'playVideo',
            id: this.props.id,
            duration: this.state.duration,
            roomId: this.props.roomId,
        };
        api.send(data);
    }

    pauseVideo = (e) => {
        e.preventDefault();
        if (!this.props.videoInfo.playing) return;
        const data = {
            event: 'pauseVideo',
            id: this.props.id,
            roomId: this.props.roomId,
        };
        api.send(data);
    }

    rewindVideo = (e) => {
        e.preventDefault();
        const data = {
            event: 'rewindVideo',
            id: this.props.id,
            roomId: this.props.roomId,
        };
        api.send(data);
    }

    // when enter key is pressed on the address bar
    checkKeyPressed = (e) => {
        if (e.key === 'Enter'){
            const data = {
                event: 'changeVideoId',
                id: this.props.id,
                roomId: this.props.roomId,
                videoId: this.state.idTextArea,
            }
            api.send(data);
        }
    }
    
    // function for modifying the textarea of of the address bar
    onVideoIdChange = (e) => {
        e.preventDefault();
        this.setState({idTextArea: e.target.value.replace("\n","")});
    }

    render() {
      return (
        <VideoWrapper className="video-wrapper">
          <VideoUrl className="video-url"
            onKeyPress={this.checkKeyPressed}
            onChange={this.onVideoIdChange}
            value={this.state.idTextArea}
          >
          </VideoUrl>
          <VideoPlayer id='video-player'></VideoPlayer>
          <VideoBtns className="video-btns">
            <RewindBtn className="rewind-video"
                onClick={this.rewindVideo}
            >
            </RewindBtn>
            <PauseBtn className="pause-video"
                onClick={this.pauseVideo}
            > 
            </PauseBtn>
            <PlayBtn className="play-video"
                onClick={this.playVideo}
            >
            </PlayBtn>
          </VideoBtns>
        </VideoWrapper>
      );
    }
}

export default Video;