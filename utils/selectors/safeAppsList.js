export const safeAppsList = {
  bookmarkedSafeAppsSection: { selector: 'div[role="button"]:nth-of-type(1)', type: 'css' },
  allSafeAppsSection: { selector: 'div[data-testid="safe_apps__all-apps-container"]', type: 'css' },
  allSafeAppsTitles: { selector: 'div[data-testid="safe_apps__all-apps-container"] > div h5', type: 'css' },
  getSafeAppByTitle: (safeAppTitle) => ({
    selector: `div[data-testid="safe_apps__all-apps-container"] img[alt="${safeAppTitle} Logo"]`,
    type: 'css',
  }),

  searchInput: { selector: 'input[aria-label="search"]', type: 'css' },

  getSafeAppIframeByUrl: (safeAppUrl) => ({ selector: `iframe[src="${safeAppUrl}"]`, type: 'css' }),
  getSafeAppIframeByTitle: (safeAppTile) => ({ selector: `iframe[title="${safeAppTile}"]`, type: 'css' }),

  bookmarkedSafeAppsContainer: { selector: 'div[data-testid="safe_apps__pinned-apps-container"]', type: 'css' },
  getBookmarkedSafeApp: (safeAppTile) => ({
    selector: `div[data-testid="safe_apps__pinned-apps-container"] img[alt="${safeAppTile} Logo"]`,
    type: 'css',
  }),
  getUnpinSafeAppButton: (safeAppTile) => ({ selector: `button[aria-label="Unpin ${safeAppTile}"]`, type: 'css' }),
  getPinSafeAppButton: (safeAppTile) => ({ selector: `button[aria-label="Pin ${safeAppTile}"]`, type: 'css' }),

  addCustomSafeAppButton: {
    selector: 'div[data-testid="safe_apps__all-apps-container"] > div:nth-child(1) button',
    type: 'css',
  },
  addCustomAppForm: { selector: 'form[data-testid="add-apps-form"]', type: 'css' },
  addCustomAppUrlInput: { selector: 'input[placeholder="App URL"]', type: 'css' },
  addCustomAppUrlErrorLabel: { selector: 'label.Mui-error', type: 'css' },
  addCustomAppLogo: {
    selector: 'form[data-testid="add-apps-form"] img[src="https://rimeissner.dev/sapp-recorder/logo.svg"]',
    type: 'css',
  },
  addCustomAppNameInput: (appName) => ({
    selector: `form[data-testid="add-apps-form"] input[value="${appName}"]`,
    type: 'css',
  }),
  addCustomAppFromButton: { selector: 'form[data-testid="add-apps-form"] button[type="submit"]', type: 'css' },
  addCustomAppCheckbox: { selector: 'form[data-testid="add-apps-form"] input[type="checkbox"]', type: 'css' },
  closePopupIcon: { selector: 'button.close-button', type: 'css' },
  customSafeAppLogo: { selector: 'img[alt="Gnosis Safe App Recorder Logo"]', type: 'css' },
  removeCustomSafeAppButton: { selector: 'button[aria-label="Remove an app"]', type: 'css' },
  removeCustomSafeAppPopup: { selector: 'div[aria-describedby="Confirm for the app removal"]', type: 'css' },
  confirmRemoveCustomSafeAppButton: {
    selector: 'div[aria-describedby="Confirm for the app removal"] div.modal-footer button:nth-child(2)',
    type: 'css',
  },

  disclaimerTitleSafeAppPopUp: { selector: 'h5', type: 'css' },
  acceptDisclaimerButton: { selector: 'button[type="button"].contained', type: 'css' },
  rootSelectors: { selector: '#root,#app,.app,main,#__next,app-root,#___gatsby', type: 'css' },
}
