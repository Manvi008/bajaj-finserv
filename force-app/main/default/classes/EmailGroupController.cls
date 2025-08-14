public with sharing class EmailGroupController {
	@AuraEnabled(cacheable=true)
	public static List<String> getAvailableEmailGroups() {
		Set<String> groupValues = new Set<String>();

		List<Schema.SObjectType> sobjectTypes = new List<Schema.SObjectType>{
			Contact.SObjectType,
			Account.SObjectType
		};

		try {
			Schema.SObjectType prospectType = Schema.getGlobalDescribe().get('Prospect__c');
			if (prospectType != null) {
				sobjectTypes.add(prospectType);
			}
		} catch (Exception e) {
			// Ignore if Prospect__c does not exist
		}

		for (Schema.SObjectType sobType : sobjectTypes) {
			Schema.DescribeSObjectResult describe = sobType.getDescribe();
			Map<String, Schema.SObjectField> fields = describe.fields.getMap();
			if (!fields.containsKey('Email_Group__c')) {
				continue;
			}
			Schema.DescribeFieldResult fieldDescribe = fields.get('Email_Group__c').getDescribe();
			if (fieldDescribe.getType() != Schema.DisplayType.Picklist) {
				continue;
			}
			for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
				if (!entry.isActive()) continue;
				groupValues.add(entry.getValue());
			}
		}

		List<String> result = new List<String>();
		result.addAll(groupValues);
		result.sort();
		return result;
	}

	@AuraEnabled(cacheable=true)
	public static List<String> getEmails(String groupValue, List<String> objectApiNames) {
		if (String.isBlank(groupValue) || objectApiNames == null || objectApiNames.isEmpty()) {
			return new List<String>();
		}

		Set<String> emails = new Set<String>();
		Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

		for (String objectApiName : objectApiNames) {
			Schema.SObjectType sobType = globalDescribe.get(objectApiName);
			if (sobType == null) {
				continue;
			}
			Schema.DescribeSObjectResult sobDescribe = sobType.getDescribe();
			Map<String, Schema.SObjectField> fields = sobDescribe.fields.getMap();
			if (!fields.containsKey('Email_Group__c')) {
				continue;
			}

			String emailFieldName = resolveEmailFieldName(fields);
			if (emailFieldName == null) {
				continue;
			}

			String soql = 'SELECT ' + emailFieldName + ' FROM ' + objectApiName +
						  ' WHERE Email_Group__c = '\'' + String.escapeSingleQuotes(groupValue) + '\'' +
						  ' AND ' + emailFieldName + ' != null' +
						  ' WITH SECURITY_ENFORCED';

			for (SObject sob : Database.query(soql)) {
				Object val = sob.get(emailFieldName);
				if (val != null) {
					String emailStr = String.valueOf(val);
					if (!String.isBlank(emailStr)) {
						emails.add(emailStr.trim());
					}
				}
			}
		}

		List<String> result = new List<String>();
		result.addAll(emails);
		result.sort();
		return result;
	}

	private static String resolveEmailFieldName(Map<String, Schema.SObjectField> fieldMap) {
		// Prefer fields with true Email datatype
		for (String fieldName : fieldMap.keySet()) {
			Schema.DescribeFieldResult fr = fieldMap.get(fieldName).getDescribe();
			if (fr.getType() == Schema.DisplayType.Email) {
				return fieldName;
			}
		}
		// Fallback to common candidates when no Email datatype field is present
		List<String> candidates = new List<String>{
			'Email', 'PersonEmail', 'Email__c', 'Primary_Email__c', 'Work_Email__c'
		};
		for (String c : candidates) {
			if (fieldMap.containsKey(c)) return c;
		}
		return null;
	}
}