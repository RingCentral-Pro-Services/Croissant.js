
# About

Croissant serves RingCentral Professional Services by allowing the user to create, update, and audit IVR menus and call queues in bulk using data collection methods already employed by the team.

  

## Dev Dependencies

Node 16.5.1

  ## Environment Variables
  
  ### Backend
 - RC_PLATFORM_URL = https://platform.ringcentral.com
 - RC_CLIENT_ID = Croissant App Client ID
 - RC_CLIENT_SECRET = Croissant App Client Secret
 - RC_REDIRECT_URI = Croissant url followed by /oauth2callback

### Frontend
 - REACT_APP_CLIENT_ID = Croissant App Client ID
 - REACT_APP_AUTH_BASE = https://platform.ringcentral.com/restapi/oauth/authorize?response_type=code
 - REACT_APP_AUTH_REDIRECT = Croissant url followed by /oauth2callback

## Installation

  

### Clone the repo

```bash

git clone https://github.com/RingCentral-Pro-Services/Croissant.js.git

cd Croissant.js

```

  

### Install depedencies and build

`npm install`
`npm run build`

### Add environment files for frontend and backend

  

## Usage

`npm start`

  

Then go to `localhost:3000`