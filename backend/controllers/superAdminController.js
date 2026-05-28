const SuperAdminModel = require('../models/superAdminModel');
const { sendOnboardingEmail } = require('../services/emailService');
const crypto = require('crypto');

const registerSchool = async (req, res) => {
  try {
    const { schoolName, address, adminName, adminEmail } = req.body;

    if (!schoolName || !address || !adminName || !adminEmail) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await SuperAdminModel.createSchoolAndAdmin(schoolName, address, adminName, adminEmail, token);

    await sendOnboardingEmail(adminEmail, adminName, schoolName, token);

    return res.status(201).json({
      success: true,
      message: 'School provisioned and invitation email dispatched successfully!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSchoolsAndAdmins = async (req,res) => {
    try {
        const directory = await SuperAdminModel.getAllSchoolADmins();

        return res.status(200).json({
            success:true,
            count: directory.length,
            data: directory
        });
    } catch (error) {
        return res.status(500).json({success: false,message:error.message});
    }
}

module.exports = { registerSchool, getSchoolsAndAdmins };