import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPicklistValues from '@salesforce/apex/EmailGroupController.getPicklistValues';
import getEmailOptions from '@salesforce/apex/EmailGroupController.getEmailOptions';

export default class EmailGroupSelector extends LightningElement {
  @api emailGroupFieldApiName = 'Email_Group__c';

  @track picklistOptions = [];
  @track emailOptions = [];

  selectedGroup = '';
  selectedEmail = '';
  isLoading = false;

  selectedObjectFlags = { Contact: false, Account: false, Lead: false };

  connectedCallback() {
    this.loadPicklist();
  }

  get anyObjectSelected() {
    return Object.values(this.selectedObjectFlags).some((v) => v === true);
  }

  get isSubmitDisabled() {
    return !(this.selectedGroup && this.selectedEmail);
  }

  async loadPicklist() {
    this.isLoading = true;
    try {
      const options = await getPicklistValues({
        objectApiName: 'Contact',
        fieldApiName: this.emailGroupFieldApiName
      });
      this.picklistOptions = options;
    } catch (error) {
      this.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async refreshEmailOptions() {
    if (!this.selectedGroup || !this.anyObjectSelected) {
      this.emailOptions = [];
      this.selectedEmail = '';
      return;
    }

    this.isLoading = true;
    try {
      const selectedObjects = Object.keys(this.selectedObjectFlags).filter(
        (key) => this.selectedObjectFlags[key]
      );
      const options = await getEmailOptions({
        emailGroupFieldApiName: this.emailGroupFieldApiName,
        emailGroupValue: this.selectedGroup,
        objectApiNames: selectedObjects,
        limitSize: 100
      });
      this.emailOptions = options;
      if (!options || options.length === 0) {
        this.selectedEmail = '';
      }
    } catch (error) {
      this.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  handleGroupChange(event) {
    this.selectedGroup = event.detail.value;
    this.refreshEmailOptions();
  }

  handleEmailChange(event) {
    this.selectedEmail = event.detail.value;
  }

  handleCheckboxChange(event) {
    const name = event.target.name;
    const checked = event.target.checked;
    this.selectedObjectFlags = { ...this.selectedObjectFlags, [name]: checked };
    this.refreshEmailOptions();
  }

  handleSubmit() {
    const payload = {
      group: this.selectedGroup,
      emailRecordId: this.selectedEmail,
      objects: Object.keys(this.selectedObjectFlags).filter(
        (k) => this.selectedObjectFlags[k]
      )
    };

    this.dispatchEvent(new CustomEvent('submitselection', { detail: payload }));

    this.showToast(
      'Selection submitted',
      `Group: ${this.selectedGroup}\nSelected Record Id: ${this.selectedEmail}`,
      'success'
    );
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) || error.message || 'Error';
    this.showToast('Error', message, 'error');
  }

  showToast(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({ title: title, message: message, variant: variant })
    );
  }
}