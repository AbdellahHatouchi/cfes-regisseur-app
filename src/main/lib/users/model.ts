import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { UserAttributes } from '../../../../type'

// Define the creation attributes for the User model
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Define the User model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public fullName!: string
  public cin!: string
  public address!: string
  public holeEmptied!: boolean
  public frozen!: boolean

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cin: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    holeEmptied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    frozen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'User',
    indexes: [{ unique: true, fields: ['cin'] }]
  }
)

export default User
