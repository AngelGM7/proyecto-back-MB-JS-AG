import { sequelize } from '../database/database.js'
import { DataTypes } from 'sequelize'

export const UsersModel = sequelize.define('users', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	lastName: {
		type: DataTypes.STRING,
	},
	role: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'USER',
	},
	public_key: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	private_key: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})
