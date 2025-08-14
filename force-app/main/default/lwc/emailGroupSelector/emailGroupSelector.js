import { LightningElement } from 'lwc';
import getAvailableEmailGroups from '@salesforce/apex/EmailGroupController.getAvailableEmailGroups';
import getEmails from '@salesforce/apex/EmailGroupController.getEmails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EmailGroupSelector extends LightningElement {
	selectedGroup = '';
	groupOptions = [];
	selectedEmail = '';
	emailOptions = [];
	includeContact = true;
	includeAccount = false;
	includeProspect = false;

	connectedCallback() {
		this.loadGroupOptions();
	}

	get isEmailDisabled() {
		return !this.emailOptions || this.emailOptions.length === 0;
	}

	get isSubmitDisabled() {
		return !this.selectedGroup || !this.selectedEmail || this.getSelectedObjects().length === 0;
	}

	async loadGroupOptions() {
		try {
			const groups = await getAvailableEmailGroups();
			this.groupOptions = (groups || []).map(g => ({ label: g, value: g }));
		} catch (error) {
			this.showError('Failed to load groups', error);
		}
	}

	handleGroupChange(event) {
		this.selectedGroup = event.detail.value;
		this.selectedEmail = '';
		this.refreshEmails();
	}

	handleEmailChange(event) {
		this.selectedEmail = event.detail.value;
	}

	handleToggleContact(event) {
		this.includeContact = event.target.checked;
		this.refreshEmails();
	}

	handleToggleAccount(event) {
		this.includeAccount = event.target.checked;
		this.refreshEmails();
	}

	handleToggleProspect(event) {
		this.includeProspect = event.target.checked;
		this.refreshEmails();
	}

	getSelectedObjects() {
		const selected = [];
		if (this.includeContact) selected.push('Contact');
		if (this.includeAccount) selected.push('Account');
		if (this.includeProspect) selected.push('Prospect__c');
		return selected;
	}

	async refreshEmails() {
		this.emailOptions = [];
		this.selectedEmail = '';
		if (!this.selectedGroup) {
			return;
		}
		const objects = this.getSelectedObjects();
		if (objects.length === 0) {
			return;
		}
		try {
			const emails = await getEmails({ groupValue: this.selectedGroup, objectApiNames: objects });
			this.emailOptions = (emails || []).map(e => ({ label: e, value: e }));
		} catch (error) {
			this.showError('Failed to load emails', error);
		}
	}

	handleSubmit() {
		const selectedObjects = this.getSelectedObjects();
		this.dispatchEvent(
			new ShowToastEvent({
				title: 'Submitted',
				message: `Group: ${this.selectedGroup}; Email: ${this.selectedEmail}; Objects: ${selectedObjects.join(', ')}`,
				variant: 'success'
			})
		);
	}

	showError(title, error) {
		let message = 'Unknown error';
		if (error && error.body && error.body.message) {
			message = error.body.message;
		} else if (error && error.message) {
			message = error.message;
		}
		this.dispatchEvent(
			new ShowToastEvent({
				title,
				message,
				variant: 'error'
			})
		);
	}
}