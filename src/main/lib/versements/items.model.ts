import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '..'
import { VersementItemAttributes, VersementItemType } from 'type'


type VersementItemCreationAttributes = Optional<VersementItemAttributes, 'id' | 'vignetteValueId' | 'vignetteQuantity' | 'quittanceNum'>

class VersementItem extends Model<VersementItemAttributes, VersementItemCreationAttributes> implements VersementItemAttributes {
  public id!: string
  public versementId!: string
  public type!: VersementItemType
  public vignetteValueId?: string | null
  public vignetteQuantity?: number | null
  public quittanceNum?: string | null
  public itemAmount!: number
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
    vignetteQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quittanceNum: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'quittance_num'
    },
    itemAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'item_amount'
    }
  },
  {
    sequelize,
    modelName: 'VersementItem',
    tableName: 'versement_items'
  }
)

// // Validation and auto calc hook
// VersementItem.addHook('beforeValidate', async (item: VersementItem) => {
//   if (item.type === 'vignette') {
//     if (!item.vignetteValueId || !item.vignetteQuantity) {
//       throw new Error('vignette type requires vignetteValueId and quantity')
//     }
//     const vv = await VignetteValue.findByPk(item.vignetteValueId)
//     if (!vv) throw new Error('Invalid vignette value')
//     const amount = Number(vv.get('valueDh')) * item.vignetteQuantity
//     item.itemAmount = Number(amount.toFixed(2)) as any
//   } else if (item.type === 'quittance') {
//     if (!item.quittanceNum || item.itemAmount == null) {
//       throw new Error('quittance type requires quittanceNum and amount en DH')
//     }
//     item.vignetteValueId = null
//     item.itemAmount = item.quittanceAmount
//   }
// })

export default VersementItem

