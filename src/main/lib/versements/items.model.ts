import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import VignetteValue from '../vignette-values/model'

export type VersementItemType = 'vignette' | 'quittance'

export interface VersementItemAttributes {
  id: string
  versementId: string
  type: VersementItemType
  vignetteValueId?: string | null
  quantity?: number | null
  quittanceNum?: string | null
  amountDh: number
  createdAt?: Date
  updatedAt?: Date
}

type VersementItemCreationAttributes = Optional<VersementItemAttributes, 'id' | 'vignetteValueId' | 'quantity' | 'quittanceNum'>

class VersementItem extends Model<VersementItemAttributes, VersementItemCreationAttributes> implements VersementItemAttributes {
  public id!: string
  public versementId!: string
  public type!: VersementItemType
  public vignetteValueId?: string | null
  public quantity?: number | null
  public quittanceNum?: string | null
  public amountDh!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

VersementItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    versementId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'versement_id'
    },
    type: {
      type: DataTypes.ENUM('vignette', 'quittance'),
      allowNull: false
    },
    vignetteValueId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'vignette_value_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quittanceNum: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'quittance_num'
    },
    amountDh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'amount_dh'
    }
  },
  {
    sequelize,
    modelName: 'VersementItem',
    tableName: 'versement_items'
  }
)

// Validation and auto calc hook
VersementItem.addHook('beforeValidate', async (item: VersementItem) => {
  if (item.type === 'vignette') {
    if (!item.vignetteValueId || !item.quantity) {
      throw new Error('vignette type requires vignetteValueId and quantity')
    }
    const vv = await VignetteValue.findByPk(item.vignetteValueId)
    if (!vv) throw new Error('Invalid vignette value')
    const amount = Number(vv.get('valueDh')) * item.quantity
    item.amountDh = Number(amount.toFixed(2)) as any
  } else if (item.type === 'quittance') {
    if (!item.quittanceNum || item.amountDh == null) {
      throw new Error('quittance type requires quittanceNum and amountDh')
    }
    item.vignetteValueId = null
    item.quantity = null
  }
})

export default VersementItem

