require('dotenv').config()
const express = require('express')
var path = require("path");
import { router as authrouter } from './auth/routes/index';
import { router as feedbackRouter } from './feedback/routes/index'

const app = express();
app.use(express.json())
app.use(authrouter)
app.use(feedbackRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
})

app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.get('*', (req: any, res: any) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
})
