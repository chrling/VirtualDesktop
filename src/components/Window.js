import React from 'react';
import styled from 'styled-components';
import { Rnd } from 'react-rnd';
import api from '../api.js';
import Video from './Video.js';
import Browser from './Browser.js';
import ImageViewer from './ImageViewer.js';

const WindowTop = styled.div`
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    top: 0;
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;`;

const WindowTitle = styled.div`
    position: relative;
    height: 100%;
    display: flex;
    align-self: center;
    ;`

const WindowTopRightButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    ;`

const WindowContent = styled.div`
    background: #fafafe;
    position: absolute;
    top: 30px;
    bottom: 6px;
    left: 6px;
    right: 6px;
    overflow: hidden;`;

const WindowWrapper = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background: #e6e6fa;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);`;

const Notepad = styled.textarea`
    width: 100%;
    height: 100%;
    resize: none;
    overflow: auto;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
`;

let rndWindowStyle = (props) => {
    const show = props.show ? "flex" : "none";
    return {
        display: show,
        width: props.width,
        height: props.height,
        zIndex: props.z,
        alignItems: "center",
        justifyContent: "center",
        border: "solid 1px #ddd",
        background: "#f0f0f0"
    }
};

let renderWindowContent = (props) => {
    let content = null;
    if (props.type === 'blank'){
        content = (
            <WindowContent className="window-body">
                {props.content}
                <div>
                    x: {props.x}, y: {props.y}
                </div>
            </WindowContent>
        );
    }
    else if (props.type === 'videoPlayer'){
        content = (
            <WindowContent className="window-body">
                <Video
                    id={props.id}
                    height={props.height}
                    videoInfo={props.content}
                    roomId={props.roomId}
                >
                </Video>
            </WindowContent>
        );
    }
    else if (props.type === 'browser'){
        content = (
            <WindowContent className="window-body">
                <Browser
                    id={props.id}
                    roomId={props.roomId}
                    url={props.content.url}
                >
                </Browser>
            </WindowContent>
        )
    }
    else if (props.type === 'imageViewer'){
        content = (
            <WindowContent className="window-body">
                <ImageViewer className="image-viewer"
                    id={props.id}
                    roomId={props.roomId}
                    content={props.content}
                    width={props.width}
                    height={props.height}
                >
                </ImageViewer>
            </WindowContent>
        )
    }
    return content;
};

let renderNotepad = (props, notepadListener) => {
    let content = (
        <WindowContent className="window-body">
            <Notepad 
                id={props.id}
                onInput={notepadListener}
                onChange={notepadListener}
                value={props.content} 
            >
            </Notepad>
        </WindowContent>
    );
    return content;
}


class Window extends React.Component {
    constructor(props) {
        super(props);
        // id is sent separately even though id is also key to each window
        this.state = {
            id: this.props.id,
            roomId: this.props.roomId,
            title: (props.title) ? props.title : 'Window' + props.id,
            x: this.props.x,
            y: this.props.y,
            z: this.props.z,
            width: this.props.width,
            height: this.props.height,
            content: this.props.content,
            type: this.props.type,
            windowCount: this.props.windowCount
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.x !== prevProps.x || this.props.y !== prevProps.y || this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            this.setState({
                x: this.props.x,
                y: this.props.y,
                width: this.props.width,
                height: this.props.height
            });
        }
    }

    // handler for dragging a window around, sets the state for the window object
    // also sends data through ws to the backend to store
    handleDrag = (e, d) => {
        const msg = {
            event: 'moveWindow',
            id: this.state.id,
            roomId: this.props.roomId,
            data: {
                x: this.state.x + d.deltaX, 
                y: this.state.y + d.deltaY,
            },
        };

        api.send(msg);

        this.setState({
            x: this.state.x + d.deltaX,
            y: this.state.y + d.deltaY
        });
    };

    // handler for resizing a window, sets the state for the window object
    // also sends data through ws to the backend to store
    handleResize = (e, direction, ref, delta, position) => {
        const msg = {
            event: 'resizeWindow',
            id: this.state.id,
            roomId: this.props.roomId,
            data: {
                width: ref.style.width,
                height: ref.style.height,
                x: position.x,
            }
        };

        api.send(msg);
    }

    handleResizeStop = (e, direction, ref, delta, position) => {
        this.setState({
            width: ref.style.width,
            height: ref.style.height,
            ...position,
        });
    }

    // set z-index of currently selected window to the highest (brings it to front)
    setFocus = (e) => {
        // e.preventDefault();
        const msg = {
            event: 'setFocus',
            id: this.state.id,
            roomId: this.props.roomId,
            data: this.state.z,
        };
        api.send(msg);
    }

    // minimized window is no longer displayed
    minimizeWindow = (e) => {
        e.preventDefault();
        const msg = {
            event: 'minimizeWindow',
            id: this.state.id,
            roomId: this.props.roomId,
        };
        api.send(msg);
    }

    // closes the current window
    closeWindow = (e) => {
        e.preventDefault();
        const msg = {
            event: 'closeWindow',
            id: this.state.id,
            roomId: this.props.roomId,
            data: this.state.z,
        };
        api.send(msg);
    }

    notepadListener = (e) => {
        e.preventDefault();
        const msg = {
            event: 'updateNote',
            id: this.state.id,
            roomId: this.props.roomId,
            data: e.target.value,
        };
        api.send(msg);
    }

    render () {
        const widthAndHeight = rndWindowStyle(this.props);
        let windowContent;
        if (this.props.type === 'notepad'){
            windowContent = renderNotepad(this.props, this.notepadListener);
        } else {
            windowContent = renderWindowContent(this.props);
        }
        return (
            <Rnd className='rnd-window'
                style={widthAndHeight}
                size={{width: this.state.width, height: this.state.height}}
                position={{x: this.state.x, y: this.state.y}}
                onDrag={this.handleDrag}
                onResize={this.handleResize}
                onResizeStop={this.handleResizeStop}
                dragHandleClassName='window-grip'
                bounds='parent'
                dragAxis='both'
                enableResizing={{ top:false, right:true, bottom:true, left:true, topRight:false, bottomRight:true, bottomLeft:true, topLeft:false }}
            >
                <WindowWrapper
                    onMouseDown={this.setFocus}
                >
                    <WindowTop className='window-grip'>
                        <div>
                            &nbsp;&nbsp;&nbsp;
                        </div>
                        <WindowTitle className='window-title'>
                            <div>{this.state.title}</div>
                        </WindowTitle>
                        <WindowTopRightButtons className='window-btns'>
                            <div className='minimizeWindowBtn'
                                onClick={this.minimizeWindow}
                            >
                            [_]
                            </div>
                            <div className='closeWindowBtn'
                                onClick={this.closeWindow}
                            >
                            [x]
                            </div>
                        </WindowTopRightButtons>
                    </WindowTop>
                    {windowContent}
                </WindowWrapper>
            </Rnd>
        );
    }
}

export default Window;