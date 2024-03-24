import { sequelize } from '../database/database.js'
import { DataTypes } from 'sequelize'
import { UsersModel } from './Users.js'

export const MessagesModel = sequelize.define('messages', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false,
	},
	sent_date: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	sender: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: UsersModel,
			key: 'id',
		},
	},
	receiver: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: UsersModel,
			key: 'id',
		},
	},
	viewed: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	subject: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	message: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})

MessagesModel.belongsTo(UsersModel, {
	as: 'receiverKey',
	foreignKey: 'receiver',
})
MessagesModel.belongsTo(UsersModel, { as: 'senderKey', foreignKey: 'sender' })
