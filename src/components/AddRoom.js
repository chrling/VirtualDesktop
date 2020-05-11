import React from 'react';
import '../styles/AddRoom.css';

class AddRoom extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      name: '',
      inviteOnly: false
    };
  }

  handleClose = () => {
    this.props.toggle();
  };

  handleChange = (e) => {
    const target = e.target;
    const value = target.name === 'inviteOnly' ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.addRoom(this.state.name, this.state.inviteOnly);
    this.props.toggle();
  }

  render() {
    return (
      <div className='modal'>
          <span className='close' onClick={this.handleClose}>
            &times;
          </span>
          <form onSubmit={this.handleSubmit}>
            <h3>Add Room</h3>
            <div>Room name:</div>
            <input type='text' name='name' value={this.state.name} onChange={this.handleChange}/>
            <label>
              <input type='checkbox' name='inviteOnly' checked={this.state.inviteOnly} onChange={this.handleChange}/>
              Invite only
            </label>
            <input type='submit' />
          </form>
      </div>
    );
  }
}

export default AddRoom;
