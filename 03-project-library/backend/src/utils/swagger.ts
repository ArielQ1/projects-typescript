import YML from 'yamljs'
import path from 'path'

const swaggerDocument = YML.load(
  path.join(__dirname, '../docs/swagger.yml')
)

export { swaggerDocument }
