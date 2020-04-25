
/* eslint-disable */
exports.keys = {
  opportunity: 'Id,Name,OwnerId,AccountId,Amount,CloseDate,IsClosed,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,StageName,Type,IsWon',
  event: 'Id,Subject,AccountId,IsAllDayEvent,OwnerId,IsRecurrence,CreatedById,CreatedDate,ActivityDate,IsDeleted,Description,DurationInMinutes,EndDateTime,LastModifiedById,LastModifiedDate,WhoId,WhatId,StartDateTime,ActivityDateTime,EventSubtype',
  task: "Id,Subject,AccountId,OwnerId,CallDurationInSeconds,CallType,IsClosed,Description,CreatedById,CreatedDate,IsDeleted,ActivityDate,LastModifiedById,LastModifiedDate,WhoId,WhatId,Status,TaskSubtype",
  account: 'Id,Name,OwnerId,BillingCountry,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,PhotoUrl,Type',
  users: 'Email,Id,FirstName,LastName,Phone,LanguageLocaleKey,LocaleSidKey,ReceivesAdminInfoEmails,FullPhotoUrl',

  opportunityCron: 'Id,Name,OwnerId,AccountId,Amount,CloseDate,IsClosed,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,StageName,Type,IsWon',
  eventCron: 'Id,Subject,AccountId,IsAllDayEvent,OwnerId,IsRecurrence,CreatedById,CreatedDate,ActivityDate,IsDeleted,Description,DurationInMinutes,EndDateTime,LastModifiedById,LastModifiedDate,WhoId,WhatId,StartDateTime,ActivityDateTime,EventSubtype',
  taskCron: "Id,Subject,AccountId,OwnerId,CallDurationInSeconds,CallType,IsClosed,Description,CreatedById,CreatedDate,IsDeleted,ActivityDate,LastModifiedById,LastModifiedDate,WhoId,WhatId,Status,TaskSubtype",
  accountCron: 'Id,Name,OwnerId,BillingCountry,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,PhotoUrl,Type',

  opportunityAuto: 'Id,Name,OwnerId,AccountId,Amount,CloseDate,IsClosed,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,StageName,Type,IsWon',
  eventAuto: 'Id,Subject,AccountId,IsAllDayEvent,OwnerId,IsRecurrence,CreatedById,CreatedDate,ActivityDate,IsDeleted,Description,DurationInMinutes,EndDateTime,LastModifiedById,LastModifiedDate,WhoId,WhatId,StartDateTime,ActivityDateTime,EventSubtype',
  taskAuto: "Id,Subject,AccountId,OwnerId,CallDurationInSeconds,CallType,IsClosed,Description,CreatedById,CreatedDate,IsDeleted,ActivityDate,LastModifiedById,LastModifiedDate,WhoId,WhatId,Status,TaskSubtype",
  accountAuto: 'Id,Name,OwnerId,BillingCountry,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,PhotoUrl,Type',

  // webhooks (disable)
  // opportunityRecent: 'q=SELECT+Id,Name,OwnerId,AccountId,Amount,CloseDate,IsClosed,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,StageName,Type,IsWon+from+Opportunity+order+by+LastModifiedDate+desc+limit+10',
  // eventRecent: 'q=SELECT+Id,Subject,AccountId,IsAllDayEvent,OwnerId,IsRecurrence,CreatedById,CreatedDate,ActivityDate,IsDeleted,Description,DurationInMinutes,EndDateTime,LastModifiedById,LastModifiedDate,WhoId,WhatId,StartDateTime,ActivityDateTime,EventSubtype+from+Event+order+by+LastModifiedDate+desc+limit+10',
  // taskRecent: "q=SELECT+Id,Subject,AccountId,OwnerId,CallDurationInSeconds,CallType,IsClosed,Description,CreatedById,CreatedDate,IsDeleted,ActivityDate,LastModifiedById,LastModifiedDate,WhoId,WhatId,Status,TaskSubtype+from+Task+where+tasksubtype='call'+order+by+LastModifiedDate+desc+limit+10",
  // accountRecent: 'q=SELECT+Id,Name,OwnerId,BillingCountry,CreatedById,CreatedDate,IsDeleted,Description,LastActivityDate,LastModifiedById,LastModifiedDate,PhotoUrl,Type+from+Account+order+by+LastModifiedDate+desc+limit+10',

  apexClass: "q=SELECT+Name+from+ApexClass+where+Name='h7WebhookClass'",
  apexTrigger: 'q=SELECT+Name+from+ApexTrigger',
};

exports.filters = {
  opportunity: 'CloseDate>209-12-31',
  event: 'EndDateTime>2019-12-31T23:59:59Z',
  task: "tasksubtype='call'+AND+ActivityDate>2019-12-31",
  account: '',
  users: '',

  opportunityCron: 'LastModifiedDate>',
  eventCron: 'LastModifiedDate>',
  taskCron: "tasksubtype='call'+AND+LastModifiedDate>",
  accountCron: 'LastModifiedDate>',

  opportunityAuto: 'LastModifiedDate>',
  eventAuto: 'LastModifiedDate>',
  taskAuto: "tasksubtype='call'+AND+LastModifiedDate>",
  accountAuto: 'LastModifiedDate>',
}

// module.exports = {
//   opportunity: 'q=SELECT+Id,Name,OwnerId,AccountId,Amount,CloseDate,IsClosed,CreatedById,createddate,isdeleted,description,expectedRevenue,fiscalyear,fiscalquarter,ForecastCategory,HasOpportunityLineItem,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,LeadSource,NextStep,Pricebook2Id,CampaignId,IsPrivate,Probability,TotalOpportunityQuantity,StageName,SystemModstamp,Type,IsWon+from+Opportunity',
//   opportunityRecent: 'q=SELECT+Id,Name,OwnerId,AccountId,Amount,CloseDate,IsClosed,CreatedById,createddate,isdeleted,description,expectedRevenue,fiscalyear,fiscalquarter,ForecastCategory,HasOpportunityLineItem,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,LeadSource,NextStep,Pricebook2Id,CampaignId,IsPrivate,Probability,TotalOpportunityQuantity,StageName,SystemModstamp,Type,IsWon+from+Opportunity+order+by+LastModifiedDate+desc+limit+10',
//   event: 'q=SELECT+id,Subject,AccountId,IsAllDayEvent,IsArchived,OwnerId,IsRecurrence,CreatedById,CreatedDate,ActivityDate,IsDeleted,Description,DurationInMinutes,EndDateTime,RecurrenceEndDateOnly,GroupEventType,IsChild,IsGroupEvent,LastModifiedById,LastModifiedDate,Location,WhoId,IsPrivate,RecurrenceActivityId,RecurrenceDayOfMonth,RecurrenceDayOfWeekMask,RecurrenceInstance,RecurrenceInterval,RecurrenceMonthOfYear,RecurrenceTimeZoneSidKey,RecurrenceType,WhatId,ReminderDateTime,IsReminderSet,ShowAs,StartDateTime,RecurrenceStartDateTime,SystemModstamp,ActivityDateTime,EventSubtype+from+Event',
//   eventRecent: 'q=SELECT+id,Subject,AccountId,IsAllDayEvent,IsArchived,OwnerId,IsRecurrence,CreatedById,CreatedDate,ActivityDate,IsDeleted,Description,DurationInMinutes,EndDateTime,RecurrenceEndDateOnly,GroupEventType,IsChild,IsGroupEvent,LastModifiedById,LastModifiedDate,Location,WhoId,IsPrivate,RecurrenceActivityId,RecurrenceDayOfMonth,RecurrenceDayOfWeekMask,RecurrenceInstance,RecurrenceInterval,RecurrenceMonthOfYear,RecurrenceTimeZoneSidKey,RecurrenceType,WhatId,ReminderDateTime,IsReminderSet,ShowAs,StartDateTime,RecurrenceStartDateTime,SystemModstamp,ActivityDateTime,EventSubtype+from+Event+order+by+LastModifiedDate+desc+limit+10',
//   task: "q=SELECT+id,subject,AccountId,IsArchived,OwnerId,CallDurationInSeconds,CallObject,CallDisposition,CallType,IsClosed,Description,IsRecurrence,CreatedById,CreatedDate,IsDeleted,ActivityDate,RecurrenceEndDateOnly,IsHighPriority,LastModifiedById,LastModifiedDate,WhoId,Priority,RecurrenceActivityId,RecurrenceDayOfMonth,RecurrenceDayOfWeekMask,RecurrenceInstance,RecurrenceInterval,RecurrenceMonthOfYear,RecurrenceTimeZoneSidKey,RecurrenceType,WhatId,ReminderDateTime,IsReminderSet,RecurrenceRegeneratedType,RecurrenceStartDateOnly,Status,SystemModstamp,TaskSubtype+from+Task+where+tasksubtype='call'",
//   taskRecent: "q=SELECT+id,subject,AccountId,IsArchived,OwnerId,CallDurationInSeconds,CallObject,CallDisposition,CallType,IsClosed,Description,IsRecurrence,CreatedById,CreatedDate,IsDeleted,ActivityDate,RecurrenceEndDateOnly,IsHighPriority,LastModifiedById,LastModifiedDate,WhoId,Priority,RecurrenceActivityId,RecurrenceDayOfMonth,RecurrenceDayOfWeekMask,RecurrenceInstance,RecurrenceInterval,RecurrenceMonthOfYear,RecurrenceTimeZoneSidKey,RecurrenceType,WhatId,ReminderDateTime,IsReminderSet,RecurrenceRegeneratedType,RecurrenceStartDateOnly,Status,SystemModstamp,TaskSubtype+from+Task+where+tasksubtype='call'+order+by+LastModifiedDate+desc+limit+10",
//   account: 'q=SELECT+MasterRecordId,Id,Name,AccountNumber,OwnerId,Site,AccountSource,AnnualRevenue,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,CreatedById,CreatedDate,Jigsaw,IsDeleted,Description,NumberOfEmployees,Industry,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Ownership,ParentId,Phone,PhotoUrl,Rating,Sic,SicDesc,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry,SystemModstamp,TickerSymbol,Type,Website+from+Account',
//   accountRecent: 'q=SELECT+MasterRecordId,Id,Name,AccountNumber,OwnerId,Site,AccountSource,AnnualRevenue,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,CreatedById,CreatedDate,Jigsaw,IsDeleted,Description,NumberOfEmployees,Industry,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Ownership,ParentId,Phone,PhotoUrl,Rating,Sic,SicDesc,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry,SystemModstamp,TickerSymbol,Type,Website+from+Account+order+by+LastModifiedDate+desc+limit+10',
//   users: 'q=SELECT+Email,Id,FirstName,LastName,Phone,LanguageLocaleKey,LocaleSidKey,ReceivesAdminInfoEmails,FullPhotoUrl+from+User',
//   apexClass: "q=SELECT+Name+from+ApexClass+where+Name='h7WebhookClass'",
//   apexTrigger: 'q=SELECT+Name+from+ApexTrigger'
// };


// Full account query for Manager
//account: 'q=SELECT+MasterRecordId,Id,Name,OwnerId,AccountSource,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,CreatedById,CreatedDate,Jigsaw,IsDeleted,Description,NumberOfEmployees,Industry,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,ParentId,Phone,PhotoUrl,SicDesc,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry,SystemModstamp,Type,Website+from+Account',
// accountRecent: 'q=SELECT+MasterRecordId,Id,Name,OwnerId,AccountSource,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,CreatedById,CreatedDate,Jigsaw,IsDeleted,Description,NumberOfEmployees,Industry,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,ParentId,Phone,PhotoUrl,SicDesc,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry,SystemModstamp,Type,Website+from+Account+order+by+LastModifiedDate+desc+limit+10',

// accountCron: 'q=SELECT+MasterRecordId,Id,Name,OwnerId,AccountSource,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,CreatedById,CreatedDate,Jigsaw,IsDeleted,Description,NumberOfEmployees,Industry,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,ParentId,Phone,PhotoUrl,SicDesc,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry,SystemModstamp,Type,Website+FROM+Account+WHERE+LastModifiedDate>',