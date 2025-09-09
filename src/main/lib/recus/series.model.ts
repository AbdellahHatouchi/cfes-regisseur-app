import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { RecuSeriesAttributes } from '../../../../type'

type RecuSeriesCreationAttributes = Optional<RecuSeriesAttributes, 'id'>

class RecuSeries extends Model<RecuSeriesAttributes, RecuSeriesCreationAttributes> implements RecuSeriesAttributes {
  public id!: string
  public recuId!: string
  public vignetteValueId!: string
  public seriesStart!: string
  public seriesEnd!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

RecuSeries.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    recuId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recu_id'
    },
    vignetteValueId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'vignette_value_id'
    },
    seriesStart: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'series_start'
    },
    seriesEnd: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'series_end'
    }
  },
  {
    sequelize,
    modelName: 'RecuSeries',
    tableName: 'recu_series'
  }
)

export default RecuSeries

