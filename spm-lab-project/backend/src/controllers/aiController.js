import { predictTicketCategory, trainModel, updateModel } from '../services/aiService.js';
import AIModelLog from '../models/AIModelLog.js';

export const predict = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const prediction = await predictTicketCategory({ title, description });

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const train = async (req, res) => {
  try {
    const result = await trainModel(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const result = await updateModel(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getModelStats = async (req, res) => {
  try {
    const logs = await AIModelLog.find({ actualOutcome: { $ne: null } });

    const total = logs.length;
    const correct = logs.filter(log => log.actualOutcome.wasCorrect).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    const categoryAccuracy = {};
    const priorityAccuracy = {};

    logs.forEach(log => {
      const category = log.prediction.category;
      const priority = log.prediction.priority;

      if (!categoryAccuracy[category]) {
        categoryAccuracy[category] = { correct: 0, total: 0 };
      }
      if (!priorityAccuracy[priority]) {
        priorityAccuracy[priority] = { correct: 0, total: 0 };
      }

      categoryAccuracy[category].total++;
      priorityAccuracy[priority].total++;

      if (log.actualOutcome.category === category) {
        categoryAccuracy[category].correct++;
      }
      if (log.actualOutcome.priority === priority) {
        priorityAccuracy[priority].correct++;
      }
    });

    res.json({
      overallAccuracy: accuracy,
      totalPredictions: total,
      correctPredictions: correct,
      categoryAccuracy,
      priorityAccuracy,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

