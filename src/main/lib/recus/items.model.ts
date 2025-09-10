import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import VignetteValue from '../vignette-values/model'

export interface RecuItemAttributes {
  id: string
  recuId: string
  vignetteValueId: string
  quantity: number
  subtotalDh: number
  createdAt?: Date
  updatedAt?: Date
}

type RecuItemCreationAttributes = Optional<RecuItemAttributes, 'id' | 'subtotalDh'>

class RecuItem extends Model<RecuItemAttributes, RecuItemCreationAttributes> implements RecuItemAttributes {
  public id!: string
  public recuId!: string
  public vignetteValueId!: string
  public quantity!: number
  public subtotalDh!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

RecuItem.init(
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtotalDh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'subtotal_dh'
    }
  },
  {
    sequelize,
    modelName: 'RecuItem',
    tableName: 'recu_items'
  }
)

// subtotal auto-calc hook
RecuItem.addHook('beforeValidate', async (item: RecuItem) => {
  if (!item.subtotalDh && item.vignetteValueId && item.quantity) {
    const vv = await VignetteValue.findByPk(item.vignetteValueId)
    if (vv) {
      const subtotal = Number(vv.get('valueDh')) * item.quantity
      item.subtotalDh = Number(subtotal.toFixed(2)) as any
    }
  }
})

export default RecuItem

