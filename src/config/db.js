import mongoose from 'mongoose'
import { env } from './env.js'

let connected = false

export const isDBConnected = () => connected

export const connectDB = async () => {
  if (!env.mongoUri) {
    console.warn('MongoDB URI not set. Skipping DB connection.')
    connected = false
    return
  }
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    })
    connected = true
    console.log('MongoDB connected')
  } catch (err) {
    connected = false
    console.error('MongoDB connection error:', err.message)
  }
}

mongoose.connection.on('disconnected', () => {
  connected = false
})

