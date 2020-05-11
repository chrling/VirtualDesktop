import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import '../styles/Dropdown.css';
import Popup from 'reactjs-popup';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import api from '../api';

const Dock = styled.div`
  display: flex;
  position: fixed;
  font-size: 14px;
  color: white;
  background-color: #003366;
  border-bottom: 1px double black;
  box-shadow: 0 3px 3px grey;
  -webkit-box-shadow: 0 3px 3px grey;
  -moz-box-shadow: 0 3px 3px grey;
  height: 30px;
  width: 100%;
  z-index: 99;
`;

const WindowItem = styled.div`
    margin-top: auto;
    margin-bottom: auto;
    padding: 0 10px;
`;

function LinkToLobby() {
  
    return (
        <Link to="/" style={{ color: 'inherit', textDecoration: 'inherit'}}>Back to Lobby</Link>
    );
  }

class Taskbar extends React.Component {
    state = {
        inviteName: ''
    }

    addBlankWindow = () => {
        this.props.addWindow({
            title: "Blank",
            x: 25,
            y: 25,
            z: this.props.windowsOpened,
            width: 200,
            height: 200,
            show: true,
            content: "Blank window",
            type: "blank",
        });
    }

    addNotepad = () => {
        this.props.addWindow({
            title: "Notepad",
            x: 25,
            y: 25,
            z: this.props.windowsOpened,
            width: 300,
            height: 500,
            show: true,
            content: "",
            type: "notepad"
        });
    }

    addVideoPlayer = () => {
        this.props.addWindow({
            title: "Video Player",
            x: 25,
            y: 25,
            z: this.props.windowsOpened,
            width: 400,
            height: 300,
            show: true,
            content: null,
            type: "videoPlayer",
        });
    }

    addBrowser = () => {
        this.props.addWindow({
            title: "Browser",
            x: 25,
            y: 25,
            z: this.props.windowsOpened,
            width: 500,
            height: 400,
            show: true,
            content: null,
            type: "browser",
        });
    }

    addImageViewer = () => {
        this.props.addWindow({
            title: "Image Viewer",
            x: 25,
            y: 25,
            z: this.props.windowsOpened,
            width: 500,
            height: 400,
            show: true,
            content: null,
            type: "imageViewer",
        });
    }

    setFocus = (windowId, zIndex) => {
        const msg = {
            event: 'setFocus',
            id: windowId,
            data: zIndex,
            roomId: this.props.roomId
        };
        api.send(msg);
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleInviteSubmit = (e, close) => {
        e.preventDefault();
        const msg = {
            event: 'inviteToRoom',
            user: this.state.inviteName,
            roomId: this.props.roomId
        };
        api.send(msg);
        close();
    }

    render() {
        // get list of active tasks to display on taskbar
        let taskItems = [];
        let windows = this.props.windows;
        let keys = Object.keys(windows);
        keys.forEach((key) => {
            const window = windows[key];
            const taskItem = (
              <WindowItem 
                  key={window.id} 
                  onClick={ () => this.setFocus(window.id, window.z) }
              >
                  {(window.title) ? window.title : 'Window'+ window.id}
              </WindowItem>
            );
            taskItems.push(taskItem);
        });
        
        return(
            <Dock>
                <Dropdown style={{cursor: 'pointer'}}>
                    <DropdownTrigger>START</DropdownTrigger>
                    <DropdownContent>
                        <ul>
                            <li>
                                <div onClick={ this.addBlankWindow }>Add Window</div>
                            </li>
                            <li>
                                <div onClick={ this.addNotepad }>Notepad</div>
                            </li>
                            <li>
                                <div onClick={ this.addVideoPlayer }>Add Video Player</div>
                            </li>
                            <li>
                                <div onClick={ this.addBrowser }>Add Browser Window</div>
                            </li>
                            <li>
                                <div onClick={ this.addImageViewer }>Add Image Viewer</div>
                            </li>
                            <li>
                                <Popup
                                    trigger={<div>Invite user</div>}
                                    position='right center'
                                >
                                    {close => (
                                        <form onSubmit={e => { this.handleInviteSubmit(e, close) } }>
                                            <input type='text' name='inviteName' value={this.state.inviteName} onChange={this.handleChange} />
                                            <input type='submit' value='Invite' />
                                        </form>
                                    )}
                                </Popup>
                            </li>
                            <li>
                                <LinkToLobby />
                            </li>
                        </ul>
                    </DropdownContent>
                </Dropdown>
                {taskItems}
            </Dock>
        );
    }
}

export default Taskbar;