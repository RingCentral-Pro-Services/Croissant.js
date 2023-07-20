require('dotenv').config()
const express = require('express')
import { SDK } from '@ringcentral/sdk';
var path = require("path");
const axios = require('axios').default;

const app = express();

var session = require('express-session');
app.use(session({ secret: 'this-is-a-secret-token', tokens: '', resave: true, saveUninitialized: true}));
app.use(express.json())
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
})

app.use(express.static(path.resolve(__dirname, '../frontend/build')))

// app.get('/login', (req: any, res: any) => {
//   const state = req.query.state
//   rcsdk = new ringcentral({
//     server: process.env.RC_PLATFORM_URL,
//     appKey: process.env.RC_CLIENT_ID,
//     appSecret: process.env.RC_CLIENT_SECRET
//   })
//   let platform = rcsdk.platform()
//   let loginURL = platform.loginUrl({"state": state})
//   res.redirect(loginURL)
// })

app.get('/oauth2callback', (req: any, res: any) => {
  let state = req.query.state
  const code = req.query.code

  if (!code) {
    res.redirect(`/error`)
    return
  }

  const rcsdk = new SDK({
    server: SDK.server.production,
    clientId: process.env.RC_CLIENT_ID,
    clientSecret: process.env.RC_CLIENT_SECRET,
    redirectUri: process.env.RC_REDIRECT_URI
  })
  var platform = rcsdk.platform()
  var resp = platform.login({
    code: code
  })
  .then((data: any) => {
    data.json()
    .then((data: any) => {
      const refreshToken = data["refresh_token"]
      const accessToken = data["access_token"]
      res.cookie('auth_token', accessToken)
      res.cookie('auth_refresh', refreshToken)
      res.redirect(`/token?state=${state}`)
    })
  })
})

app.get('/refresh', (req: any, res: any) => {
  const refreshToken = req.query.refresh_token
  const header = {
    "Content-type": "application/x-www-form-urlencoded",
    "Authorization": "Basic " + Buffer.from(process.env.RC_CLIENT_ID + ":" + process.env.RC_CLIENT_SECRET).toString('base64')
  }

  axios.post(`${process.env.RC_PLATFORM_URL}/restapi/oauth/token`, `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${process.env.RC_CLIENT_ID}`, {headers: header})
  .then((response: any) => {
    const accessToken = response.data.access_token
    const refreshToken = response.data.refresh_token
    const result = {
      "access_token": accessToken,
      "refresh_token": refreshToken
    }
    res.send(result)
    }
  )
  .catch((error: any) => {
    console.log('Error refreshing token')
    console.log(error)
  }
  )
  
})

app.post('/feedback', (req: any, res: any) => {
  axios.post(process.env.FEEDBACK_URL, req.body)
  .then((response: any) => {
  })
  .catch((error: any) => {
  }
  )
  res.send('OK')
})

app.get('*', (req: any, res: any) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
})
