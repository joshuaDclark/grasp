let currentTab = null;
let isLoading = false;

// DOM elements
const currentTabDiv = document.getElementById('current-tab');
const tabTitle = document.getElementById('tab-title');
const tabUrl = document.getElementById('tab-url');
const saveForm = document.getElementById('save-form');
const reasonTextarea = document.getElementById('reason');
const tagInput = document.getElementById('tag');
const saveBtn = document.getElementById('save-btn');
const statusMessage = document.getElementById('status-message');

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Grasp extension loaded');
  await getCurrentTab();
  setupEventListeners();
});

async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = {
      title: tab.title,
      url: tab.url,
      id: tab.id
    };
    
    // Update UI
    tabTitle.textContent = currentTab.title;
    tabUrl.textContent = currentTab.url;
    currentTabDiv.style.display = 'block';
    
  } catch (error) {
    console.error('Error getting current tab:', error);
    showStatus('Error: Could not access current tab', 'error');
  }
}

function setupEventListeners() {
  saveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveBookmark();
  });
  
  reasonTextarea.addEventListener('input', updateSaveButton);
}

function updateSaveButton() {
  const hasReason = reasonTextarea.value.trim().length > 0;
  saveBtn.disabled = !hasReason || isLoading;
}

async function saveBookmark() {
  const reason = reasonTextarea.value.trim();
  const tag = tagInput.value.trim();
  
  if (!reason) {
    showStatus('Please enter a reason for saving this page', 'error');
    return;
  }

  if (!currentTab) {
    showStatus('Error: No current tab found', 'error');
    return;
  }

  isLoading = true;
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;
  
  try {
    const bookmark = {
      id: Date.now().toString(),
      title: currentTab.title,
      url: currentTab.url,
      reason: reason,
      tag: tag,
      timestamp: new Date().toISOString()
    };

    // Get existing bookmarks
    const result = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = result.bookmarks || [];
    
    // Add new bookmark
    bookmarks.push(bookmark);
    
    // Save back to storage
    await chrome.storage.local.set({ bookmarks });
    
    showStatus('Page saved successfully!', 'success');
    resetForm();
    
  } catch (error) {
    console.error('Error saving bookmark:', error);
    showStatus('Error saving page. Please try again.', 'error');
  } finally {
    isLoading = false;
    saveBtn.textContent = 'Save';
    updateSaveButton();
  }
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
  statusMessage.style.display = 'block';
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

function resetForm() {
  reasonTextarea.value = '';
  tagInput.value = '';
  updateSaveButton();
}