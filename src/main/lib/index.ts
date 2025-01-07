import { join } from 'path'
import { Sequelize } from 'sequelize'
import { app } from 'electron'

// export const sequelize = new Sequelize('sqlite::memory:')
const dbPath = join(app.getPath('userData'), 'database.db')
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  // storage: join(__dirname, 'database.sqlite')
  storage: dbPath
})
export const TestConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}
