require('dotenv').config()
const express = require('express')
var path = require("path");
import { router as authrouter } from './auth/routes/index';
import { router as feedbackRouter } from './feedback/routes/index'
import { router as accessControlRouter } from './access-control/routes/index'
import { router as auditTrailRouter } from './audit-trail/routes/index'
import { router as notificationRouter } from './notifications/routes/index'
import { router as supportRouter } from './support/routes/index'
import { sequelize } from './database/Sequelize';
import { DepartmentModel } from './access-control/models/DepartmentModel'
import { AdminModel } from './access-control/models/AdminModel'
import { UserModel } from './access-control/models/UserModel'
import { AuditItemModel } from './audit-trail/models/AuditItemModel'
import { NotificationModel } from './notifications/models/NotificationModel';
import { initializeJWKS } from 'psi-auth'

const app = express();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(authrouter)
app.use(feedbackRouter)
app.use(accessControlRouter)
app.use(auditTrailRouter)
app.use(notificationRouter)
app.use(supportRouter)

sequelize.sync({ alter: false }).then(() => {
  console.log('Database & tables created!')
}).catch((err) => {
  console.log('Error while creating tables')
  console.log(err)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
})

app.use(express.static(path.resolve(__dirname, '../../frontend/build')))

app.get('*', (req: any, res: any) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
})

initializeJWKS({
  url: process.env.NEW_JWKS_URL!
})