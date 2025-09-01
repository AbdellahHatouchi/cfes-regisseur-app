import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { RecuAttributes } from '../../../../type'

// Define the creation attributes for the Recu model
interface RecuCreationAttributes extends Optional<RecuAttributes, 'id'> {}

// Define the Recu model
class Recu extends Model<RecuAttributes, RecuCreationAttributes> implements RecuAttributes {
  public id!: string
  public numeroRecu!: string
  public dateRecu!: Date
  public montantTotal!: number
  public description?: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Recu.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    numeroRecu: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    dateRecu: {
      type: DataTypes.DATE,
      allowNull: false
    },
    montantTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Recu',
    indexes: [{ unique: true, fields: ['numeroRecu'] }]
  }
)

export default Recu
