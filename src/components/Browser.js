import React from 'react';
import styled from 'styled-components';
import api from '../api.js';

const BrowserWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    `;

const BrowserUrl = styled.div`
    display: flex;
    height: 25px;
    width: 100%;
    `;

const BrowserUrlTextArea = styled.textarea`
    display: flex;
    height: 75%;
    width: 95%;
    resize: none;
    overflow: auto;
    `;

const BrowserRightArrow = styled.div`
    background-image: url('/media/browser-right-arrow.PNG');
    background-repeat: no-repeat;
    background-size: cover;
    width: 25px;
    height: 25px;
    `;

class Browser extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: props.id,
            url: props.url,
            roomId: props.roomId,
        };
    }

    // when enter key is pressed on the address bar
    checkKeyPressed = (e) => {
        if (e.key === 'Enter'){
            const data = {
                event: 'changeBrowserUrl',
                id: this.props.id,
                url: this.state.url,
                roomId: this.props.roomId,
            }
            api.send(data);
        }
    }

    // when the right arrow is clicked on the address bar
    changeUrl = (e) => {
        e.preventDefault();
        const data = {
            event: 'changeBrowserUrl',
            id: this.props.id,
            url: this.state.url,
            roomId: this.props.roomId,
        }
        api.send(data);
    }
    
    // function for modifying the textarea of of the address bar
    onUrlChange = (e) => {
        e.preventDefault();
        this.setState({url: e.target.value.replace("\n","")});
    }
    
    render(){
      return (
        <BrowserWrapper>
          <BrowserUrl>
            <BrowserUrlTextArea className="browser-address"
              onKeyPress={this.checkKeyPressed}
              onChange={this.onUrlChange}
              value={this.state.url}
            >
              {`${this.state.url}`}
            </BrowserUrlTextArea>
            <BrowserRightArrow className="browser-arrow"
              onClick={this.changeUrl}
            >
            </BrowserRightArrow>
          </BrowserUrl>
          <iframe className={`BrowserWindow${this.props.id}`}
            title={`browser${this.props.id}`}
            src={this.props.url}
            height='100%'
            width='100%'
          >
          </iframe>
        </BrowserWrapper>
      )
    }
}

export default Browser;