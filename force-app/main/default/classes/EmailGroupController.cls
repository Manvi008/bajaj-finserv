public with sharing class EmailGroupController {
	public class PicklistOption {
		@AuraEnabled public String label;
		@AuraEnabled public String value;
	}

	public class SelectOption {
		@AuraEnabled public String label;
		@AuraEnabled public String value;
	}

	@AuraEnabled(cacheable=true)
	public static List<PicklistOption> getPicklistValues(String objectApiName, String fieldApiName) {
		if (String.isBlank(objectApiName) || String.isBlank(fieldApiName)) {
			throw new AuraHandledException('objectApiName and fieldApiName are required.');
		}

		Schema.SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
		if (sobjectType == null) {
			throw new AuraHandledException('Invalid object: ' + objectApiName);
		}

		Schema.DescribeSObjectResult describe = sobjectType.getDescribe();
		Map<String, Schema.SObjectField> fieldMap = describe.fields.getMap();
		if (!fieldMap.containsKey(fieldApiName)) {
			throw new AuraHandledException('Field ' + fieldApiName + ' not found on ' + objectApiName);
		}

		Schema.DescribeFieldResult dfr = fieldMap.get(fieldApiName).getDescribe();
		if (dfr.getType() != Schema.DisplayType.Picklist) {
			throw new AuraHandledException('Field ' + fieldApiName + ' is not a Picklist.');
		}

		List<PicklistOption> options = new List<PicklistOption>();
		for (Schema.PicklistEntry entry : dfr.getPicklistValues()) {
			PicklistOption opt = new PicklistOption();
			opt.label = entry.getLabel();
			opt.value = entry.getValue();
			options.add(opt);
		}
		return options;
	}

	@AuraEnabled(cacheable=true)
	public static List<SelectOption> getEmailOptions(String emailGroupFieldApiName, String emailGroupValue, List<String> objectApiNames, Integer limitSize) {
		if (objectApiNames == null || objectApiNames.isEmpty()) {
			return new List<SelectOption>();
		}

		Integer safeLimit = (limitSize == null || limitSize <= 0 || limitSize > 500) ? 100 : limitSize;
		Set<String> requested = new Set<String>();
		for (String apiName : objectApiNames) {
			if (!String.isBlank(apiName)) {
				requested.add(apiName.trim());
			}
		}

		List<SelectOption> results = new List<SelectOption>();
		Boolean applyGroupFilter = !String.isBlank(emailGroupFieldApiName) && !String.isBlank(emailGroupValue);

		// Contact
		if (requested.contains('Contact')) {
			if (fieldExists('Contact', 'Email')) {
				String soql = 'SELECT Id, Name, Email' + groupFieldInSelectIfNeeded('Contact', emailGroupFieldApiName, applyGroupFilter) + ' FROM Contact WHERE Email != null';
				if (applyGroupFilter && fieldExists('Contact', emailGroupFieldApiName)) {
					soql += ' AND ' + emailGroupFieldApiName + ' = :emailGroupValue';
				}
				soql += ' ORDER BY LastModifiedDate DESC LIMIT :safeLimit';
				for (Contact c : Database.query(soql)) {
					results.add(buildOption('Contact', c.Name, c.Email, c.Id));
				}
			}
		}

		// Account (Person Accounts only)
		if (requested.contains('Account')) {
			if (fieldExists('Account', 'PersonEmail') && fieldExists('Account', 'IsPersonAccount')) {
				String soql = 'SELECT Id, Name, PersonEmail' + groupFieldInSelectIfNeeded('Account', emailGroupFieldApiName, applyGroupFilter) + ' FROM Account WHERE IsPersonAccount = true AND PersonEmail != null';
				if (applyGroupFilter && fieldExists('Account', emailGroupFieldApiName)) {
					soql += ' AND ' + emailGroupFieldApiName + ' = :emailGroupValue';
				}
				soql += ' ORDER BY LastModifiedDate DESC LIMIT :safeLimit';
				for (Account a : Database.query(soql)) {
					results.add(buildOption('Account', a.Name, a.PersonEmail, a.Id));
				}
			}
		}

		// Lead (Prospect)
		if (requested.contains('Lead')) {
			if (fieldExists('Lead', 'Email')) {
				String soql = 'SELECT Id, FirstName, LastName, Email' + groupFieldInSelectIfNeeded('Lead', emailGroupFieldApiName, applyGroupFilter) + ' FROM Lead WHERE Email != null';
				if (applyGroupFilter && fieldExists('Lead', emailGroupFieldApiName)) {
					soql += ' AND ' + emailGroupFieldApiName + ' = :emailGroupValue';
				}
				soql += ' ORDER BY LastModifiedDate DESC LIMIT :safeLimit';
				for (Lead l : Database.query(soql)) {
					String fullName = String.valueOf(l.FirstName) + ' ' + String.valueOf(l.LastName);
					results.add(buildOption('Lead', fullName.trim(), l.Email, l.Id));
				}
			}
		}

		return results;
	}

	private static Boolean fieldExists(String objectApiName, String fieldApiName) {
		if (String.isBlank(fieldApiName)) return false;
		Schema.SObjectType typ = Schema.getGlobalDescribe().get(objectApiName);
		if (typ == null) return false;
		return typ.getDescribe().fields.getMap().containsKey(fieldApiName);
	}

	private static String groupFieldInSelectIfNeeded(String objectApiName, String fieldApiName, Boolean applyGroupFilter) {
		return (applyGroupFilter && fieldExists(objectApiName, fieldApiName)) ? (', ' + fieldApiName) : '';
	}

	private static SelectOption buildOption(String objectLabel, String name, String email, Id recordId) {
		SelectOption opt = new SelectOption();
		String safeName = String.isBlank(name) ? '' : name;
		String safeEmail = String.isBlank(email) ? '' : email;
		opt.label = objectLabel + ': ' + safeName + ' — ' + safeEmail;
		opt.value = String.valueOf(recordId);
		return opt;
	}
}