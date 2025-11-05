import axios from 'axios';
import AIModelLog from '../models/AIModelLog.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const predictTicketCategory = async (ticketData) => {
  try {
    const startTime = Date.now();
    const response = await axios.post(`${AI_SERVICE_URL}/ai/predict`, {
      title: ticketData.title,
      description: ticketData.description,
    });

    const processingTime = Date.now() - startTime;

    const prediction = {
      category: response.data.category,
      priority: response.data.priority,
      confidence: response.data.confidence,
      timestamp: new Date(),
    };

    return {
      ...prediction,
      processingTime,
    };
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Fallback to default values if AI service is unavailable
    return {
      category: 'Other',
      priority: 'Medium',
      confidence: 0,
      timestamp: new Date(),
      processingTime: 0,
      error: error.message,
    };
  }
};

export const logAIPrediction = async (ticketId, prediction, actualOutcome = null) => {
  try {
    await AIModelLog.create({
      ticketId,
      prediction: {
        category: prediction.category,
        priority: prediction.priority,
        confidence: prediction.confidence,
      },
      actualOutcome: actualOutcome ? {
        category: actualOutcome.category,
        priority: actualOutcome.priority,
        wasCorrect: actualOutcome.category === prediction.category && actualOutcome.priority === prediction.priority,
      } : null,
      processingTime: prediction.processingTime || 0,
    });
  } catch (error) {
    console.error('Error logging AI prediction:', error);
  }
};

export const trainModel = async (ticketData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ai/train`, ticketData);
    return response.data;
  } catch (error) {
    console.error('AI Training Error:', error.message);
    throw error;
  }
};

export const updateModel = async (updateData) => {
  try {
    const response = await axios.put(`${AI_SERVICE_URL}/ai/update`, updateData);
    return response.data;
  } catch (error) {
    console.error('AI Update Error:', error.message);
    throw error;
  }
};

