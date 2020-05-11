import React from 'react';
import { Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import AddRoom from './AddRoom';
import api from '../api';
import '../styles/Lobby.css';

function RoomsList(props) {
  const rooms = props.rooms;
  const roomItems = Object.keys(rooms).map((roomId, index) => 
    <tr key={roomId}>
      <td onClick={() => props.handleRoomClick(roomId)}>{roomId}</td>
      <td onClick={() => props.handleRoomClick(roomId)}>{rooms[roomId].name}</td>
      <td onClick={() => props.handleRoomClick(roomId)}>{rooms[roomId].clients.length}</td>
      <td onClick={() => props.handleRoomClick(roomId)}>
        {rooms[roomId].private
          ? 'Invite only'
          : 'Open'}
      </td>
      <td onClick={() => props.handleRoomClick(roomId)}>
        {rooms[roomId].owner === props.user
          ? 'You'
          : rooms[roomId].owner}
      </td>
      <td>
        {rooms[roomId].owner === props.user
          ? <button onClick={() => props.handleRoomDelete(roomId)}>Delete</button>
          : null}
      </td>
    </tr>
  );

  return (
    <table id="roomslist">
      <tbody>
        <tr id="list-header">
          <th>Room ID</th>
          <th>Name</th>
          <th>Connected users</th>
          <th>Privacy</th>
          <th>Created by</th>
          <th></th>
        </tr>
        {roomItems}
      </tbody>
    </table>
  );
}

class Lobby extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      username: '',
      rooms: {},
      toDesktop: false,
      addRoom: false,
      invitePopupOpen: false,
      logout: false
    };
  }

  componentDidMount() {
    fetch('/user')
      .then(res => res.json())
      .then(result => this.setState({ username: result }, () => {
        const ws = api.getWebSocket();

        if (ws.readyState !== 1) {
          ws.onopen = () => {
            api.send({ event: 'getRooms' });
            api.send({ event: 'userLoggedIn', username: this.state.username });
          }
        } else {
          api.send({ event: 'getRooms' });
          api.send({ event: 'userLoggedIn', username: this.state.username });
        }
      }));

    this.props.addMsgEvent('roomCreated', (msg) => {
      this.setState({
        roomId: msg.roomId
      });
    });

    this.props.addMsgEvent('roomsUpdated', (msg) => {
      this.setState({
        rooms: msg.data
      });
    });

    this.props.addMsgEvent('invitedToRoom', (msg) => {
      this.setState({
        rooms: msg.data,
        invitedRoomId: msg.roomId,
        invitePopupOpen: true
      });
    });
  }

  addRoomToggle = () => {
    this.setState({
      addRoom: !this.state.addRoom
    });
  }

  addRoom = (roomName, inviteOnly) => {
    const msg = {
      event: 'createRoom',
      roomName: roomName,
      private: inviteOnly,
      username: this.state.username
    };

    api.send(msg);
  }

  handleRoomClick = (roomId) => {
    const room = this.state.rooms[roomId];
    if (!room.private || room.members.includes(this.state.username)) {
      this.setState({
        toDesktop: true,
        roomId: roomId
      });
    }
  }

  handleRoomDelete = (roomId) => {
    api.send({
      event: 'deleteRoom',
      roomId: roomId,
      username: this.state.username
    });
  }

  updateRooms = () => {
    api.send({ event: 'getRooms' });
  }

  logout = () => {
    fetch('/signout', { method: 'POST' })
      .then(res => {
        if (res.status === 200) {
          this.setState({ logout: true });
        }
      }).catch(err => {
        console.error(err);
      });
  }

  render () {
    if (this.state.toDesktop) {
      return <Redirect to={{ pathname: '/desktop', state: { roomId: this.state.roomId, roomName: this.state.rooms[this.state.roomId].name } }}/>
    } else if (this.state.logout) {
      return <Redirect to={{ pathname: '/login' }} />
    }

    return (
      <div id="lobby">
        <div id="options">
          <button onClick={this.addRoomToggle}>Add room</button>
          <button onClick={this.updateRooms}>Update rooms</button>
          <button onClick={this.logout}>Logout</button>
        </div>
        <RoomsList 
          rooms={this.state.rooms} 
          user={this.state.username} 
          handleRoomClick={this.handleRoomClick}
          handleRoomDelete={this.handleRoomDelete}
        />
        {this.state.addRoom ? <AddRoom toggle={this.addRoomToggle} addRoom={this.addRoom} /> : null}
        <Popup open={this.state.invitePopupOpen}>
          <div id="invite-popup">
            <div>You have been invited to <b>{this.state.invitedRoomId ? this.state.rooms[this.state.invitedRoomId].name : ''}</b></div>
            <button onClick={() => this.handleRoomClick(this.state.invitedRoomId)}>Join</button>
          </div>
        </Popup>
      </div>
    )
  };
}

export default Lobby;
