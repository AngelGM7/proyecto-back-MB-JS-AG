import { Sequelize } from 'sequelize'

const { PG_HOST, PG_DB, PG_USERNAME, PG_PASSWORD } = process.env

export const sequelize = new Sequelize(PG_DB, PG_USERNAME, PG_PASSWORD, {
	host: PG_HOST,
	dialect: 'postgres',
})
