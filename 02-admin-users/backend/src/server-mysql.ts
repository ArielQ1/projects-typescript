import { createApp } from './index'
import { RoleModel } from './models/role'
import { UserModel } from './models/user'

createApp({ userModel: UserModel, roleModel: RoleModel })
