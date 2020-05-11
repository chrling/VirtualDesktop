import React from 'react';
import styled from 'styled-components';
import Window from './Window';

const Wallpaper = styled.div`
  position: absolute;
  top: 30px;
  bottom: 0;
  left: 0;
  right: 0;
  background: radial-gradient(circle, white 10%, transparent 10%),
    radial-gradient(circle, white 10%, #a8c7bb 10%) 10px 10px;
  background-size:20px 20px;
`;

let renderWindows = (props, keys) => {
  let windowsObj = []
  let windows = props.windows;
  keys.forEach(function(key){
    const window = windows[key];
    const windowObj = (
      <Window
        key={key}
        id={key}
        title={window.title}
        x={window.x}
        y={window.y}
        z={window.z}
        windowCount={window.windowCount}
        width={window.width}
        height={window.height}
        show={window.show}
        content={window.content}
        type={window.type}
        roomId={props.roomId}
      />
    );
    windowsObj.push(windowObj);
  });

  return windowsObj;
}

class Background extends React.Component {
  render() {
    const windowsKeys = Object.keys(this.props.windows);
    const windows = windowsKeys.length !== 0 ? renderWindows(this.props, windowsKeys) : [];
    return (
      <Wallpaper>{windows}</Wallpaper>
    );
  }
}

export default Background;