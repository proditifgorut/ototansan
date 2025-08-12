// Consultation model for handling service requests
const { findOne, findMany, insert, update } = require('../../database/config');

class Consultation {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.service_type = data.service_type;
    this.message = data.message;
    this.preferred_time = data.preferred_time;
    this.urgency = data.urgency;
    this.status = data.status;
    this.assigned_to = data.assigned_to;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.responded_at = data.responded_at;
  }

  // Create new consultation request
  static async create(consultationData) {
    try {
      const newConsultation = {
        name: consultationData.name,
        email: consultationData.email,
        phone: consultationData.phone,
        service_type: consultationData.serviceType,
        message: consultationData.message,
        preferred_time: consultationData.preferredTime || null,
        urgency: consultationData.urgency || 'normal',
        status: 'pending'
      };

      const result = await insert('consultations', newConsultation);
      
      if (result.success) {
        return await Consultation.findById(result.insertId);
      }
      
      return null;
    } catch (error) {
      console.error('Error creating consultation:', error);
      return null;
    }
  }

  // Find consultation by ID
  static async findById(id) {
    const query = 'SELECT * FROM consultations WHERE id = ?';
    const result = await findOne(query, [id]);
    return result ? new Consultation(result) : null;
  }

  // Get all consultations with pagination
  static async getAll(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM consultations';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const consultations = await findMany(query, params);
    return consultations.map(consultation => new Consultation(consultation));
  }

  // Get consultation count
  static async getCount(status = null) {
    let query = 'SELECT COUNT(*) as count FROM consultations';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const result = await findOne(query, params);
    return result ? result.count : 0;
  }

  // Update consultation status
  async updateStatus(status, assignedTo = null, notes = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (assignedTo) {
      updateData.assigned_to = assignedTo;
    }

    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'responded') {
      updateData.responded_at = new Date();
    }

    const result = await update('consultations', updateData, 'id = ?', [this.id]);
    return result.success;
  }

  // Search consultations
  static async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM consultations 
      WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?) 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const consultations = await findMany(query, [
      searchPattern, searchPattern, searchPattern, searchPattern, limit, offset
    ]);
    return consultations.map(consultation => new Consultation(consultation));
  }

  // Get consultations by urgency
  static async getByUrgency(urgency, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM consultations 
      WHERE urgency = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const consultations = await findMany(query, [urgency, limit, offset]);
    return consultations.map(consultation => new Consultation(consultation));
  }

  // Get pending consultations (for dashboard)
  static async getPending() {
    const query = `
      SELECT * FROM consultations 
      WHERE status = 'pending' 
      ORDER BY 
        CASE urgency 
          WHEN 'very-urgent' THEN 1 
          WHEN 'urgent' THEN 2 
          ELSE 3 
        END,
        created_at ASC
    `;
    
    const consultations = await findMany(query);
    return consultations.map(consultation => new Consultation(consultation));
  }

  // Get statistics
  static async getStats() {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM consultations';
      const pendingQuery = 'SELECT COUNT(*) as pending FROM consultations WHERE status = "pending"';
      const respondedQuery = 'SELECT COUNT(*) as responded FROM consultations WHERE status = "responded"';
      const urgentQuery = 'SELECT COUNT(*) as urgent FROM consultations WHERE urgency IN ("urgent", "very-urgent") AND status = "pending"';

      const [total, pending, responded, urgent] = await Promise.all([
        findOne(totalQuery),
        findOne(pendingQuery),
        findOne(respondedQuery),
        findOne(urgentQuery)
      ]);

      return {
        total: total?.total || 0,
        pending: pending?.pending || 0,
        responded: responded?.responded || 0,
        urgent: urgent?.urgent || 0
      };
    } catch (error) {
      console.error('Error getting consultation stats:', error);
      return { total: 0, pending: 0, responded: 0, urgent: 0 };
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      service_type: this.service_type,
      message: this.message,
      preferred_time: this.preferred_time,
      urgency: this.urgency,
      status: this.status,
      assigned_to: this.assigned_to,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
      responded_at: this.responded_at
    };
  }
}

module.exports = Consultation;
