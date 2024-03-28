import { sequelize } from '../database/database.js'
import { DataTypes } from 'sequelize'
import { UsersModel } from './Users.js'

export const MessagesModel = sequelize.define(
	'messages',
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		sent_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		senderId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: UsersModel,
				key: 'id',
			},
		},
		receiverId: {
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
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{ timestamps: false }
)

MessagesModel.belongsTo(UsersModel, {
	as: 'sender',
	foreignKey: 'senderId',
})

UsersModel.hasMany(MessagesModel, {
	as: 'sentMessages',
	foreignKey: 'senderId',
})

MessagesModel.belongsTo(UsersModel, {
	as: 'receiver',
	foreignKey: 'receiverId',
})
UsersModel.hasMany(MessagesModel, {
	as: 'receivedMessages',
	foreignKey: 'receiverId',
})
