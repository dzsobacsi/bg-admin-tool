const {BigQuery} = require('@google-cloud/bigquery')

const gbqClient = new BigQuery()

module.exports = gbqClient
