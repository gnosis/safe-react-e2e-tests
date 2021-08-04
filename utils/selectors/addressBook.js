export const addressBook = {
    entryModal: {selector: ".paper.modal", type:'css'},
    createEntryNameInput: {selector: '[data-testid="create-entry-input-name"]', type: 'css'},
    createEntryAddressInput: {selector: '[data-testid="create-entry-input-address"]', type: 'css'},
    createSubmitBtn: {selector: '[data-testid="save-new-entry-btn-id"]', type:'css'},
    deleteSubmitBtn : {selector:"[data-testid='delete-entry-btn-id']", type: 'css'},
    entryRowSelector : {selector:"[data-testid='address-book-row']", type: 'css'},
    editEntryBtn : {selector:"[title='Edit entry']", type: 'css'},
    deleteEntryBtn : {selector:"[title='Delete entry']", type: 'css'},
    sendEntryBtn : {selector:"[data-testid='send-entry-btn']", type: 'css'},
    sendModal: {selector:".smaller-modal-window", type:'css'},
    sendFundsModalBtn : {selector:"[data-testid='modal-send-funds-btn']", type: 'css'},
    sendCollecModalBtn : {selector:"[data-testid='modal-send-collectible-btn']", type: 'css'},
    contInteractModalBtn : {selector:"[data-testid='modal-contract-interaction-btn']", type: 'css'}
}