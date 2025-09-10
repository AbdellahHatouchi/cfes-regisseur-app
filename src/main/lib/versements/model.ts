import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { VersementAttributes } from 'type'

// Define the creation attributes for the Versement model
interface VersementCreationAttributes extends Optional<VersementAttributes, 'id'> {}

// Define the Versement model
class Versement extends Model<VersementAttributes, VersementCreationAttributes> implements VersementAttributes {
  public id!: string
  public numeroVersement!: string
  public dateVersement!: Date
  public type!: 'Vignette' | 'Quittance' | 'Mixte'
  public montantTotal!: number
  public numeroQuittance?: string
  public note?: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Versement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    numeroVersement: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    dateVersement: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Vignette', 'Quittance', 'Mixte'),
      allowNull: false
    },
    montantTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    numeroQuittance: {
      type: DataTypes.STRING,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Versement',
    tableName: 'versement',
    indexes: [{ unique: true, fields: ['numeroVersement'] }]
  }
)

export default Versement
