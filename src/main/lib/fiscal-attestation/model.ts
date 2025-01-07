import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { FiscalAttestationAttributes } from '../../../../type'

// Define the creation attributes for the FiscalAttestation model
interface FiscalAttestationCreationAttributes extends Optional<FiscalAttestationAttributes, 'id'> {}

// Define the FiscalAttestation model
class FiscalAttestation
  extends Model<FiscalAttestationAttributes, FiscalAttestationCreationAttributes>
  implements FiscalAttestationAttributes
{
  public id!: string
  public type!: boolean
  public attestationNumber!: string
  public name!: string
  public ITP!: string
  public IF!: string
  public identity!: string
  public activite!: string
  public address!: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

FiscalAttestation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    attestationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ITP: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IF: {
      type: DataTypes.STRING,
      allowNull: false
    },
    identity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    activite: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'FiscalAttestation',
    indexes: [{ unique: true, fields: ['attestationNumber'] }]
  }
)

export default FiscalAttestation
