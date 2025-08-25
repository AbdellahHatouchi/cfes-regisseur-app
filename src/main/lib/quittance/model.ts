import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../index'

interface QuittanceAttributes {
  id: string
  userId: string
  number: string // formatted as Number/Year
  date: Date
  price: number
  status: 'pending' | 'videe' | 'non_videe' | 'cancel'
  createdAt?: Date
  updatedAt?: Date
}

type QuittanceCreationAttributes = Optional<QuittanceAttributes, 'id' | 'date' | 'price' | 'status'>

class Quittance
  extends Model<QuittanceAttributes, QuittanceCreationAttributes>
  implements QuittanceAttributes
{
  public id!: string
  public userId!: string
  public number!: string
  public date!: Date
  public price!: number
  public status!: 'pending' | 'videe' | 'non_videe' | 'cancel'
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Quittance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 200
    },
    status: {
      type: DataTypes.ENUM('pending', 'videe', 'non_videe', 'cancel'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  { sequelize, modelName: 'Quittance', indexes: [{ unique: true, fields: ['number'] }] }
)

export default Quittance


