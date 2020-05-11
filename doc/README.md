# Virtual Desktop API Documentation

## REST API

### Create

- description: sign up for a user account
- request: `POST /signup`
    - content-type: `application/json`
    - body: object
        - username: (string) the name of the user
        - password: (string) the password of the user
- response: 200
    - content-type: `application/json`
    - body: None
- response: 400
	- content-type: `application/json`
	- body: 'Invalid user name'
- response: 409
	- content-type: `application/json`
    - body: 'Username is taken'

``` 
$ curl -X POST
       -d '{"username":"bob", "password":"pass4bob"}'
	   -c cookie.txt
       -H "Content-Type: application/json"
       https://c09-virtual-desktop.herokuapp.com/signup
```


### Read

- description: get the current user name
- request: `GET /user`
- response: 200
    - content-type: `application/json`
    - body: object
		- username: (string) the name of the user
- response: 401
	- content-type: `application/json`
	- body: 'Access denied'

``` 
$ curl -b cookie.txt
       https://c09-virtual-desktop.herokuapp.com/user
```

### Update

None
  
### Delete
  
None

### Other

- description: sign-in to a user account
- request: `POST /signin`
	- content-type: `application/json`
	- body: object
		- username: (string) the name of the user
		- password: (string) the password of the user
- response: 200
	- body: None
- response: 400
	- content-type: `application/json`
	- body: 'Invalid user name'
- response: 401
	- content-type: `application/json`
	- body: 'Access denied'
	
``` 
$ curl -X POST
       -d '{"username":"bob", "password":"pass4bob"}'
	   -c cookie.txt
       -H "Content-Type: application/json"
       https://c09-virtual-desktop.herokuapp.com/signin
```


- description: sign-out of a user account
- request: `POST /signout`
	- body: None
- response: 200
	- body: None
	
```
$ curl -X POST
	   -c cookie.txt
	   -b cookie.txt
	   https://c09-virtual-desktop.herokuapp.com/signout
```

- description: verify the user's json web token
- request: `GET /verifyToken`
- response: 200
	- body: None
- response: 401
	- content-type: `application/json`
	- body: 'Access denied'
	
```
$ curl -b cookie.txt
	   https://c09-virtual-desktop.herokuapp.com/verifyToken
```



## Socket API

### Desktop

URL: `/desktop`

Description: initialize windows in the room
- on: `initWindows`
    - roomId: id of the room
- return:
    - data: windows in room
    - windowCount: number of windows in room
    - windowsOpened: number of windows opened in room

Description: add window
- on: `addWindow`
    - roomId: id of the room
	- window: the window to be added
- return:
    - data: windows in room
    - windowCount: number of windows in room
    - windowsOpened: number of windows opened in room

Description: move window
- on: `moveWindow`
    - roomId: id of the room
	- id: id of the window
	- data
		- x: horizontal position of the window
		- y: vertical position of the window
- return:
    - data: windows in room

Description: resize window
- on: `resizeWindow`
    - roomId: id of the room
	- id: id of the window
	- data
		- x: horizontal position of the window
		- width: width of the window
		- height: height of the window
- return:
    - data: windows in room

Description: set focus on window
- on: `setFocus`
    - roomId: id of the room
	- id: id of the window
	- data: z index position of the window
- return:
    - data: windows in room

Description: close window
- on: `closeWindow`
    - roomId: id of the room
	- id: id of the window
	- data: z index position of the window
- return:
    - data: windows in room
	- windowsOpened: number of windows opened in room

Description: minimize window
- on: `minimizeWindow`
    - roomId: id of the room
	- id: id of the window
- return:
    - data: windows in room

Description: rewind video in window
- on: `rewindVideo`
    - roomId: id of the room
	- id: id of the window
- return:
    - data: windows in room

Description: pause video in window
- on: `pauseVideo`
    - roomId: id of the room
	- id: id of the window
- return:
    - data: windows in room

Description: play video in window
- on: `playVideo`
    - roomId: id of the room
	- id: id of the window
	- duration: duration of video
- return:
    - data: windows in room

Description: change video in window
- on: `changeVideoId`
    - roomId: id of the room
	- id: id of the window
	- videoId: id of video
- return:
    - data: windows in room

Description: update notepad window
- on: `updateNote`
    - roomId: id of the room
	- id: id of the window
	- data: content of notepad
- return:
    - data: windows in room

Description: change website in browser window
- on: `changeBrowserUrl`
    - roomId: id of the room
	- id: id of the window
	- url: url of website
- return:
    - data: windows in room

Description: change image in image viewer
- on: `imageSent`
    - roomId: id of the room
	- id: id of the window
- return:
    - data: windows in room


### Lobby

URL: `/`

Description: create a new room
- on: `createRoom`
    - roomName: name of room
	- private: indication if room is invite only or not
	- username: username of user
- return:
    - data: rooms in lobby
	- roomId: id of room created

Description: invite new room
- on: `inviteToRoom`
    - user: username of invited user
	- roomId: id of room
- return:
    - data: rooms in lobby
	- roomId: id of room created

Description: get rooms in lobby
- on: `getRooms`
- return:
    - data: rooms in lobby

Description: delete room
- on: `deleteRoom`
    - username: username of user
	- roomId: id of room
- return:
    - data: rooms in lobby
