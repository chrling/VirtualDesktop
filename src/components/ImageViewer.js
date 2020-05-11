import React from 'react';
import styled from 'styled-components';
import api from '../api.js';
import Dropzone from 'react-dropzone'

const DropzoneWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  `;

const InnerDropzone = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  `;


class ImageViewer extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          imageSet: this.props.content.imageSet,
          url: this.props.content.url,
        };
    };

    componentDidUpdate(prevProps) {
      if (prevProps.content.imageSet !== this.props.content.imageSet){
        let dropzoneWrapper = document.querySelector(`.dropzone${this.props.id}`).parentNode;
        dropzoneWrapper.innerHTML = 
          `<img
            src=${this.props.content.url}
            width='100%'
            height='100%'
           ></img>`;
      }
    };

    dropHandler = (files) => {
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', this.props.roomId);
        formData.append('windowId', this.props.id);
        fetch('/addImage',{
            method: 'POST',
            body: formData,
        })
        .then(res => {
          if (res.status === 200){
            console.log(res);
            const data = {
              roomId: this.props.roomId,
              id: this.props.id,
              event: 'imageSent',
            }
            api.send(data);
          }
        });
    };

    render() {
      if (!this.state.imageSet){
        return (
          <DropzoneWrapper className={`dropzone${this.props.id}`}>
            <Dropzone
              onDrop={this.dropHandler}
              accept="image/*"
            >
            {({getRootProps, getInputProps}) => (
              <InnerDropzone {...getRootProps()}>
                <input {...getInputProps()} />
                <InnerDropzone>
                  Drag and drop image here, or click to select image
                </InnerDropzone>
              </InnerDropzone>
            )}
            </Dropzone>
          </DropzoneWrapper>
        )
      };
      return (
        <img 
          src={this.state.url}
          width='100%'
          height='100%'
        >
        </img>
      )
    }
}

export default ImageViewer;