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

// Associations setup - called from main index before sync
export const initializeAssociations = async () => {
  const { default: Recu } = await import('./recus/model')
  const { default: RecuItem } = await import('./recus/items.model')
  const { default: RecuSeries } = await import('./recus/series.model')
  const { default: Versement } = await import('./versements/model')
  const { default: VersementItem } = await import('./versements/items.model')
  const { default: VignetteValue } = await import('./vignette-values/model')

  // Recu 1:N RecuItem
  Recu.hasMany(RecuItem, { foreignKey: 'recuId', as: 'items', onDelete: 'CASCADE' })
  RecuItem.belongsTo(Recu, { foreignKey: 'recuId', as: 'recu' })
  RecuItem.belongsTo(VignetteValue, { foreignKey: 'vignetteValueId', as: 'vignetteValue' })

  // Recu 1:N RecuSeries
  Recu.hasMany(RecuSeries, { foreignKey: 'recuId', as: 'series', onDelete: 'CASCADE' })
  RecuSeries.belongsTo(Recu, { foreignKey: 'recuId', as: 'recu' })
  RecuSeries.belongsTo(VignetteValue, { foreignKey: 'vignetteValueId', as: 'vignetteValue' })

  // Versement 1:N VersementItem
  Versement.hasMany(VersementItem, { foreignKey: 'versementId', as: 'items', onDelete: 'CASCADE' })
  VersementItem.belongsTo(Versement, { foreignKey: 'versementId', as: 'versement' })
  VersementItem.belongsTo(VignetteValue, { foreignKey: 'vignetteValueId', as: 'vignetteValue' })
}
