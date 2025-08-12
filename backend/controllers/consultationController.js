// Consultation controller for handling service requests
const Consultation = require('../models/Consultation');
const { insert } = require('../../database/config');

class ConsultationController {
  // Submit new consultation request
  static async submitConsultation(req, res) {
    try {
      const { name, email, phone, serviceType, message, preferredTime, urgency } = req.body;

      // Validation
      if (!name || !email || !phone || !serviceType || !message) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }

      // Phone validation
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Format nomor telepon tidak valid'
        });
      }

      // Create consultation request
      const consultation = await Consultation.create({
        name,
        email,
        phone,
        serviceType,
        message,
        preferredTime,
        urgency: urgency || 'normal'
      });

      if (!consultation) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menyimpan permintaan konsultasi'
        });
      }

      // Log the consultation request
      await ConsultationController.logConsultationActivity(
        consultation.id,
        'submitted',
        'Consultation request submitted',
        req
      );

      // Send notification email (in real implementation)
      // await ConsultationController.sendNotificationEmail(consultation);

      res.status(201).json({
        success: true,
        message: 'Permintaan konsultasi berhasil dikirim. Tim kami akan menghubungi Anda segera.',
        data: {
          id: consultation.id,
          status: consultation.status,
          created_at: consultation.created_at
        }
      });

    } catch (error) {
      console.error('Submit consultation error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get all consultations (admin only)
  static async getAllConsultations(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const search = req.query.search;

      let consultations;
      let totalConsultations;

      if (search) {
        consultations = await Consultation.search(search, page, limit);
        // For search, we'll use a simplified count
        totalConsultations = consultations.length;
      } else {
        consultations = await Consultation.getAll(page, limit, status);
        totalConsultations = await Consultation.getCount(status);
      }

      const totalPages = Math.ceil(totalConsultations / limit);

      res.json({
        success: true,
        data: {
          consultations: consultations.map(c => c.toJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalConsultations,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get consultations error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get consultation by ID
  static async getConsultationById(req, res) {
    try {
      const consultation = await Consultation.findById(req.params.id);

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Konsultasi tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: consultation.toJSON()
      });

    } catch (error) {
      console.error('Get consultation error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Update consultation status (admin only)
  static async updateConsultationStatus(req, res) {
    try {
      const { status, notes } = req.body;
      const consultationId = req.params.id;

      const validStatuses = ['pending', 'in-progress', 'responded', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid'
        });
      }

      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Konsultasi tidak ditemukan'
        });
      }

      const updated = await consultation.updateStatus(status, req.user.id, notes);

      if (updated) {
        // Log the status update
        await ConsultationController.logConsultationActivity(
          consultationId,
          'status_updated',
          `Status updated to ${status}`,
          req
        );

        const updatedConsultation = await Consultation.findById(consultationId);
        
        res.json({
          success: true,
          message: 'Status konsultasi berhasil diperbarui',
          data: updatedConsultation.toJSON()
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Gagal memperbarui status konsultasi'
        });
      }

    } catch (error) {
      console.error('Update consultation status error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get pending consultations (dashboard)
  static async getPendingConsultations(req, res) {
    try {
      const consultations = await Consultation.getPending();

      res.json({
        success: true,
        data: consultations.map(c => c.toJSON())
      });

    } catch (error) {
      console.error('Get pending consultations error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get consultation statistics (dashboard)
  static async getConsultationStats(req, res) {
    try {
      const stats = await Consultation.getStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get consultation stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get consultations by urgency
  static async getConsultationsByUrgency(req, res) {
    try {
      const urgency = req.params.urgency;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const validUrgencies = ['normal', 'urgent', 'very-urgent'];
      if (!validUrgencies.includes(urgency)) {
        return res.status(400).json({
          success: false,
          message: 'Tingkat urgensi tidak valid'
        });
      }

      const consultations = await Consultation.getByUrgency(urgency, page, limit);

      res.json({
        success: true,
        data: consultations.map(c => c.toJSON())
      });

    } catch (error) {
      console.error('Get consultations by urgency error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Helper method to log consultation activities
  static async logConsultationActivity(consultationId, activityType, description, req) {
    try {
      await insert('consultation_activity_logs', {
        consultation_id: consultationId,
        user_id: req.user?.id || null,
        activity_type: activityType,
        description,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
    } catch (error) {
      console.error('Error logging consultation activity:', error);
    }
  }

  // Helper method to send notification email (placeholder)
  static async sendNotificationEmail(consultation) {
    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, AWS SES, or similar
      console.log(`Sending notification email for consultation ${consultation.id}`);
      
      // Email content would include:
      // - Confirmation to customer
      // - Notification to admin/support team
      // - Auto-responder with expected response time
      
      return true;
    } catch (error) {
      console.error('Error sending notification email:', error);
      return false;
    }
  }
}

module.exports = ConsultationController;
