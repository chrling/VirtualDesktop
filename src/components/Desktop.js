import React from 'react';
import styled from 'styled-components';
import Background from './Background';
import Taskbar from './Taskbar';
import '../App.css';
import api from '../api.js'
import { Redirect } from 'react-router-dom';

const RoomInfo = styled.div`
  background-color: black;
  color: white;
`;

class Desktop extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      windows: {},
      windowCount: 0,
      windowsOpened: 0,
    };
  }

  componentDidMount() {
    this.props.addMsgEvent('windowUpdated', (msg) => {
      this.setState({
        windows: msg.data,
      });
      if (msg.hasOwnProperty('windowCount')) this.setState({windowCount: msg.windowCount});
      if (msg.hasOwnProperty('windowsOpened')) this.setState({windowsOpened: msg.windowsOpened});
    });

    this.props.addMsgEvent('roomDeleted', (msg) => {
      this.setState({ roomId: null });
    });

    if (this.props.location.state !== undefined) {
      this.setState({ roomId: this.props.location.state.roomId, roomName: this.props.location.state.roomName });
      const ws = api.getWebSocket();
      if (ws.readyState !== 1) {
        ws.onopen = () => {
          api.send({
            event: 'initWindows',
            roomId: this.props.location.state.roomId
          });
        }
      } else {
        api.send({
          event: 'initWindows',
          roomId: this.props.location.state.roomId
        });
      }
    } else {
      this.setState({ roomId: null });
    }

    window.addEventListener('beforeunload', () => {
      if (this.state.roomId) {
        api.send({
          event: 'leaveRoom',
          roomId: this.state.roomId
        });
      }
    })
  }

  componentWillUnmount() {
    if (this.state.roomId) {
      api.send({
        event: 'leaveRoom',
        roomId: this.state.roomId
      });
    }
  }

  // function used to open new window to desktop
  addWindow = (window) => {
    const msg = {
      event: 'addWindow',
      window: window,
      roomId: this.state.roomId
    }
    api.send(msg);
  }

  render () {
    if (this.state.roomId === null) return <Redirect to='/' />
    else return (
      <div className="App">
        <RoomInfo>Room: {this.state.roomName}</RoomInfo>
        <Taskbar 
          windows={this.state.windows}
          windowCount={this.state.windowCount}
          windowsOpened={this.state.windowsOpened}
          addWindow={this.addWindow}
          roomId={this.state.roomId}
        />
        <Background
          windows={this.state.windows}
          roomId={this.state.roomId}
        />
      </div>
    )
  };
}

export default Desktop;
