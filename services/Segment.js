var Analytics = require('analytics-node');
const { sendErrorNotification } = require('./Slack');
var analytics = new Analytics(process.env.SEGMENT_WRITE_KEY);

module.exports.addNewUser = async ({
  maintenanceStartDate,
  hostLicenseId,
  addonLicenseId,
  contactDetails,
  addonKey,
  addonName
}) => {
  const {name, email} = contactDetails.technicalContact || contactDetails.billingContact;
  const {company, country} = contactDetails;
  const createdAt = new Date(maintenanceStartDate).toISOString();
  const statusKey = 'status-'+addonKey;
  try {
    const response = await analytics.identify({
      userId: hostLicenseId,
      location: {
        country
      },
      traits: {
        name,
        email,
        company,
        country,
        createdAt,
        [statusKey]: 'Trialling',
        [addonKey]: {
          addon_key: addonKey,
          addon_name: addonName,
          addon_licenseId: addonLicenseId,
          status: 'Trialling'
        }
      }
    });
    return response;
  }
  catch(error) {
    console.error('ERROR: Cannot create Segment User!', error);
    sendErrorNotification(`ERROR: Cannot create Segment User for ${company}!`);
    return new Error('Cannot create Segment User!');
  }
};

module.exports.updateUser = async ({
  purchaseDetails,
  addonLicenseId,
  hostLicenseId,
  addonKey,
  addonName,
  customerDetails,
  contactDetails,
  status,
  licenseType
}) => {
  let setStatus = 'Trialling';
  if(purchaseDetails) {
    setStatus = 'Paying';
  }
  else if(status && licenseType) {
    if(status == 'inactive' && licenseType == 'EVALUATION') {
      setStatus = 'Expired';
    }
    else if(status == 'cancelled' && licenseType == 'EVALUATION') {
      setStatus = 'Cancelled';
    }
    else if(status == 'active' && licenseType == 'COMMERCIAL') {
      setStatus = 'Paying';
    }
    else if(status == 'cancelled' && licenseType == 'COMMERCIAL') {
      setStatus = 'Churned';
    }
    else if(status == 'inactive' && licenseType == 'COMMERCIAL') {
      setStatus = 'Churned';
    }
  }
  const contact = customerDetails || contactDetails;
  const {company, country} = contact;
  const {name, email} = contact.technicalContact || contact.billingContact;
  const statusKey = 'status-'+addonKey;
  try {
    const response = await analytics.identify({
      userId: hostLicenseId,
      location: {
        country
      },
      traits: {
        name,
        email,
        company,
        country,
        [statusKey]: setStatus,
        [addonKey]: {
          addon_key: addonKey,
          addon_name: addonName,
          addon_licenseId: addonLicenseId,
          status: setStatus
        }
      }
    });
    return response;
  }
  catch(error) {
    console.log('ERROR: Cannot update Segment Profile!', error);
    sendErrorNotification(`ERROR: Cannot update Segment Profile for ${company}!`);
    return new Error('Cannot update Segment Profile!');
  }
};

module.exports.addMarketingAttribution = async ({
  attribution: {
    channel,
    campaignName,
    campaignSource,
    campaignMedium,
    campaignContent,
    referrerDomain
  },
  addonLicenseId,
  hostLicenseId,
  addonKey,
  addonName,
  customerDetails,
  contactDetails,
}) => {
  const contact = customerDetails || contactDetails;
  const {company, country} = contact;
  const {name, email} = contact.technicalContact || contact.billingContact;
  try {
    const response = await analytics.identify({
      userId: hostLicenseId,
      channel,
      campaign: {
        name: campaignName,
        source: campaignSource,
        medium: campaignMedium,
        content: campaignContent
      },
      location: {
        country
      },
      traits: {
        name,
        email,
        company,
        country,
        campaign: {
          name: campaignName,
          source: campaignSource,
          medium: campaignMedium,
          content: campaignContent
        },
      }
    });
    return response;
  }
  catch(error) {
    let company;
    if(customerDetails) {
      company = customerDetails.company;
    }
    else if (contactDetails) {
      company = contactDetails.company;
    }
    console.log('ERROR: Cannot update Segment Profile with marketing attributions!', error);
    sendErrorNotification(`ERROR: Cannot update Segment Profile with marketing attributions for ${company}!`);
    return new Error('Cannot update Segment Profile with marketing attributions!');
  }
};

module.exports.registerEvent = async (eventName, {
  purchaseDetails,
  addonLicenseId,
  hostLicenseId,
  addonKey,
  addonName,
  customerDetails,
  contactDetails,
  lastUpdated
}) => {
  let occured_at = null;
  let segmentEvent = eventName;
  if(purchaseDetails) {
    occured_at = new Date(purchaseDetails.saleDate);
  }
  else if (lastUpdated) {
    occured_at = new Date(lastUpdated);
  }
  let company;
  if(customerDetails) {
    company = customerDetails.company;
  }
  else if (contactDetails) {
    company = contactDetails.company;
  }
  let properties = {
    addon_key: addonKey,
    addon_name: addonName,
    addon_licenseId: addonLicenseId,
    company: company
  };
  if(eventName == 'subscription_paid') {
    properties.amount = Math.round(purchaseDetails.vendorAmount);
    properties.interval = (purchaseDetails.billingPeriod == 'Annual')? 'year':'month';
    properties.saleType = purchaseDetails.saleType;
    if(properties.saleType == 'New') {
      segmentEvent = 'new_subscription_paid';
    }
  }

  try {
    const response = await analytics.track({
      userId: hostLicenseId,
      event: segmentEvent,
      timestamp: occured_at,
      properties
    });
    return response;
  }
  catch(error) {
    console.log('ERROR: Cannot register Segment Event!', error);
    sendErrorNotification(`ERROR: Cannot register Segment Event for ${company}!`);
    return new Error('Cannot register Segment Event after payment!');
  }
};
