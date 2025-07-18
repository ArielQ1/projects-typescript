// src/server-mysql.ts
import { createApp } from './app.js'
import { RoleModel } from './models/role.js'
import { UserModel } from './models/user.js'
import { DatabaseMonitor } from './utils/databaseMonitor.js'
import { NODE_ENV } from './config/index.js'

// Start the application
createApp({ userModel: UserModel, roleModel: RoleModel })

// Start database monitoring in production or if explicitly enabled
if (NODE_ENV === 'production' || process.env.ENABLE_DB_MONITORING === 'true') {
  DatabaseMonitor.startMonitoring(60000) // Check every minute
}
