@IsTest
private class EmailGroupControllerTest {
	@IsTest
	static void testGetPicklistValues_LeadStatus() {
		Test.startTest();
		List<EmailGroupController.PicklistOption> options = EmailGroupController.getPicklistValues('Lead', 'Status');
		Test.stopTest();
		System.assert(!options.isEmpty(), 'Expect Lead.Status to return picklist entries');
	}

	@IsTest
	static void testGetPicklistValues_InvalidField() {
		Boolean sawError = false;
		try {
			Test.startTest();
			EmailGroupController.getPicklistValues('Lead', 'Company'); // Not a picklist
			Test.stopTest();
		} catch (Exception e) {
			sawError = true;
		}
		System.assertEquals(true, sawError, 'Expect exception for non-picklist field');
	}

	@IsTest
	static void testGetEmailOptions_ContactAndLead_NoGroupFilter() {
		// Arrange test data
		Contact c = new Contact(LastName = 'Doe', Email = 'jane.doe@example.com');
		insert c;
		Lead l = new Lead(LastName = 'Smith', Company = 'Acme Inc', Email = 'john.smith@example.com');
		insert l;

		Test.startTest();
		List<String> objects = new List<String>{ 'Contact', 'Lead' };
		List<EmailGroupController.SelectOption> opts = EmailGroupController.getEmailOptions(null, null, objects, 50);
		Test.stopTest();

		System.assert(!opts.isEmpty(), 'Should return at least one option');
		// Validate presence for both records (order not guaranteed)
		Set<String> returnedIds = new Set<String>();
		for (EmailGroupController.SelectOption o : opts) {
			returnedIds.add(o.value);
		}
		System.assert(returnedIds.contains(c.Id), 'Contact should be included');
		System.assert(returnedIds.contains(l.Id), 'Lead should be included');
	}

	@IsTest
	static void testGetEmailOptions_WithNonexistentGroupField() {
		Contact c = new Contact(LastName = 'Miller', Email = 'sue.miller@example.com');
		insert c;

		Test.startTest();
		List<EmailGroupController.SelectOption> opts = EmailGroupController.getEmailOptions('Nonexistent_Field__c', 'AnyValue', new List<String>{'Contact'}, 10);
		Test.stopTest();

		System.assert(!opts.isEmpty(), 'Query should still work even if group field does not exist');
	}
}