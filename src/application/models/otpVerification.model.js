"use strict";

const { Op } = require('sequelize');
const unifonicSmsHelper = require('../helpers/unifonicSms.helpers');

module.exports = (sequelize, DataTypes) => {
  const OtpVerification = sequelize.define(
    "OtpVerification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      entity_type: {
        type: DataTypes.ENUM(['user', 'provider', 'admin']),
        allowNull: false,
        validate: {
          isIn: [['user', 'provider', 'admin']],
        },
      },

      entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          isUUID: 4,
        },
      },

      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 20],
        },
      },

      purpose: {
        type: DataTypes.ENUM(['registration', 'login', 'password_reset', 'phone_verification']),
        allowNull: false,
        defaultValue: 'registration',
        validate: {
          isIn: [['registration', 'login', 'password_reset', 'phone_verification']],
        },
      },

      otp_code: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [4, 4],
          isNumeric: true,
        },
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString(),
        },
      },

      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 10,
        },
      },

      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      tableName: "otp_verifications",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["phone_number"],
        },
        {
          fields: ["expires_at"],
        },
        {
          fields: ["entity_type", "entity_id"],
        },
        {
          fields: ["phone_number", "entity_type", "purpose"],
        },
        {
          fields: ["entity_type", "entity_id", "is_verified"],
        },
      ],
    }
  );

  // Instance methods
  OtpVerification.prototype.isExpired = function () {
    return new Date() > this.expires_at;
  };

  OtpVerification.prototype.incrementAttempts = function () {
    return this.increment("attempts");
  };

  OtpVerification.prototype.markAsVerified = function () {
    return this.update({ is_verified: true });
  };

  // Class methods
  OtpVerification.generateOtp = function () {
    // Generate random 4-digit OTP (1000 to 9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    console.log('🔐 [SMS Server] [OTP Generation] Generated new OTP:', {
      otp: otp,
      length: otp.length,
      timestamp: new Date().toISOString(),
    });
    
    return otp;
  };

  OtpVerification.getExpirationTime = function (minutes = 5) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
  };

  // Create OTP for specific entity
  OtpVerification.createForEntity = async function (entityType, entityId, phoneNumber, purpose = 'registration') {
    const startTime = Date.now();
    
    console.log('📝 [SMS Server] [OTP Creation] Starting OTP creation process:', {
      entityType: entityType,
      entityId: entityId,
      phoneNumber: phoneNumber,
      purpose: purpose,
      timestamp: new Date().toISOString(),
    });

    try {
      // Step 1: Invalidate any existing OTPs for this entity and purpose
      console.log('🔄 [SMS Server] [OTP Creation] Step 1: Invalidating existing OTPs...');
      const invalidateResult = await this.update(
        { is_verified: true },
        {
          where: {
            entity_type: entityType,
            entity_id: entityId,
            purpose: purpose,
            is_verified: false,
          },
        }
      );

      console.log('✅ [SMS Server] [OTP Creation] Step 1: Invalidated existing OTPs:', {
        count: invalidateResult[0] || 0,
        entityType: entityType,
        entityId: entityId,
        purpose: purpose,
      });

      // Step 2: Generate new OTP
      console.log('🔐 [SMS Server] [OTP Creation] Step 2: Generating new OTP...');
      const otp = this.generateOtp();
      const expiresAt = this.getExpirationTime(5);

      console.log('✅ [SMS Server] [OTP Creation] Step 2: OTP generated successfully:', {
        otp: otp,
        expiresAt: expiresAt.toISOString(),
        entityType: entityType,
        entityId: entityId,
        purpose: purpose,
      });

      // Step 3: Create OTP record in database
      console.log('💾 [SMS Server] [OTP Creation] Step 3: Saving OTP to database...');
      const otpRecord = await this.create({
        entity_type: entityType,
        entity_id: entityId,
        phone_number: phoneNumber,
        purpose: purpose,
        otp_code: otp,
        expires_at: expiresAt,
      });

      console.log('✅ [SMS Server] [OTP Creation] Step 3: OTP saved to database:', {
        otpId: otpRecord.id,
        otp: otp,
        expiresAt: expiresAt.toISOString(),
        entityType: entityType,
        entityId: entityId,
        purpose: purpose,
        phoneNumber: phoneNumber,
      });

      // Step 4: Send OTP via SMS (non-blocking - don't fail OTP creation if SMS fails)
      console.log('📱 [SMS Server] [OTP Creation] Step 4: Sending OTP via SMS...');
      try {
        // Format phone number to E.164 format (+countrycode+number)
        let formattedPhone = phoneNumber;
        formattedPhone = formattedPhone.replace(/[\s-]/g, '');
        
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone;
        }
        
        console.log('📱 [SMS Server] [OTP Creation] Phone number formatting:', {
          original: phoneNumber,
          formatted: formattedPhone,
          entityType: entityType,
          entityId: entityId,
        });

        const smsResult = await unifonicSmsHelper.sendOtpSms(formattedPhone, otp, {
          purpose: purpose,
          entityId: entityId,
          entityType: entityType,
        });

        console.log('✅ [SMS Server] [OTP Creation] Step 4: OTP SMS sent successfully:', {
          otpId: otpRecord.id,
          otp: otp,
          messageId: smsResult.messageId,
          recipient: formattedPhone,
          entityType: entityType,
          entityId: entityId,
          purpose: purpose,
          timestamp: new Date().toISOString(),
        });

      } catch (smsError) {
        console.error('⚠️  [SMS Server] [OTP Creation] Step 4: Failed to send OTP via SMS (OTP still created):', {
          otpId: otpRecord.id,
          otp: otp,
          recipient: phoneNumber,
          entityType: entityType,
          entityId: entityId,
          purpose: purpose,
          error: smsError.message || smsError,
          errorDetails: smsError,
          timestamp: new Date().toISOString(),
        });

        console.warn('⚠️  [SMS Server] Warning: OTP created but SMS sending failed. OTP can still be used for verification.');
      }

      const duration = Date.now() - startTime;
      console.log('✅ [SMS Server] [OTP Creation] OTP creation process completed successfully:', {
        otpId: otpRecord.id,
        otp: otp,
        entityType: entityType,
        entityId: entityId,
        purpose: purpose,
        phoneNumber: phoneNumber,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return otpRecord;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [SMS Server] [OTP Creation] Error in createForEntity:', {
        entityType: entityType,
        entityId: entityId,
        phoneNumber: phoneNumber,
        purpose: purpose,
        error: error.message || error,
        errorDetails: error,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };

  // Find valid OTP for entity
  OtpVerification.findValidForEntity = async function (entityType, entityId, purpose = 'registration') {
    return await this.findOne({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        purpose: purpose,
        is_verified: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
      order: [['created_at', 'DESC']],
    });
  };

  // Verify OTP for entity
  OtpVerification.verifyForEntity = async function (entityType, entityId, otpCode, purpose = 'registration') {
    try {
      const otpRecord = await this.findValidForEntity(entityType, entityId, purpose);
      
      if (!otpRecord) {
        return { success: false, message: 'OTP not found or expired' };
      }

      // Increment attempts
      await otpRecord.incrementAttempts();

      // Check if too many attempts
      if (otpRecord.attempts >= 5) {
        await otpRecord.update({ is_verified: true });
        return { success: false, message: 'Too many failed attempts' };
      }

      // Check OTP code
      if (otpRecord.otp_code !== otpCode) {
        return { success: false, message: 'Invalid OTP' };
      }

      // Mark as verified
      await otpRecord.markAsVerified();
      return { success: true, message: 'OTP verified successfully', otpRecord };
    } catch (error) {
      console.error('❌ [SMS Server] Error in verifyForEntity:', error);
      return { success: false, message: 'Database error during verification' };
    }
  };

  // Associations
  OtpVerification.associate = function (models) {
    // Define associations here if needed
  };

  return OtpVerification;
};

