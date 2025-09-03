import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { VignetteValueAttributes } from 'type'


type VignetteValueCreationAttributes = Optional<VignetteValueAttributes, 'id' | 'description'>

class VignetteValue
  extends Model<VignetteValueAttributes, VignetteValueCreationAttributes>
  implements VignetteValueAttributes
{
  public id!: string
  public valueDh!: number
  public carnetSize!: number
  public description?: string | undefined
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

VignetteValue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    valueDh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'value_dh'
    },
    carnetSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'carnet_size'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'VignetteValue',
    tableName: 'vignette_values'
  }
)

export default VignetteValue

