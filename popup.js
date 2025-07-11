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
const savedCountSpan = document.getElementById('saved-count');

// Tab elements
const saveTabBtn = document.getElementById('save-tab');
const listTabBtn = document.getElementById('list-tab');
const saveContent = document.getElementById('save-content');
const listContent = document.getElementById('list-content');
const bookmarksList = document.getElementById('bookmarks-list');

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Grasp extension loaded');
  await getCurrentTab();
  await updateSavedCount();
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
  
  // Tab switching
  saveTabBtn.addEventListener('click', () => switchTab('save'));
  listTabBtn.addEventListener('click', () => switchTab('list'));
  
  // Keyboard shortcuts
  reasonTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!saveBtn.disabled) {
        saveBookmark();
      }
    }
  });
  
  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!saveBtn.disabled) {
        saveBookmark();
      }
    }
  });
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
    // Extract favicon and featured image
    const faviconUrl = await getFaviconUrl(currentTab.url);
    const featuredImage = await getFeaturedImage();
    
    const bookmark = {
      id: Date.now().toString(),
      title: currentTab.title,
      url: currentTab.url,
      reason: reason,
      tag: tag,
      timestamp: new Date().toISOString(),
      favicon: faviconUrl,
      featuredImage: featuredImage
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
    await updateSavedCount();
    
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

async function updateSavedCount() {
  try {
    const result = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = result.bookmarks || [];
    const count = bookmarks.length;
    savedCountSpan.textContent = `${count} saved`;
  } catch (error) {
    console.error('Error updating saved count:', error);
  }
}

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  saveTabBtn.classList.remove('active');
  listTabBtn.classList.remove('active');
  saveContent.classList.remove('active');
  listContent.classList.remove('active');
  
  if (tabName === 'save') {
    saveTabBtn.classList.add('active');
    saveContent.classList.add('active');
  } else if (tabName === 'list') {
    listTabBtn.classList.add('active');
    listContent.classList.add('active');
    loadBookmarksList();
  }
}

async function loadBookmarksList() {
  try {
    const result = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = result.bookmarks || [];
    
    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = '<p class="no-bookmarks">No saved pages yet.</p>';
      return;
    }
    
    let html = '';
    bookmarks.reverse().forEach((bookmark) => {
      const faviconUrl = bookmark.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;
      const hasImage = bookmark.featuredImage && bookmark.featuredImage !== '';
      
      html += `
        <div class="bookmark-card" onclick="openBookmark('${bookmark.url}')">
          ${hasImage ? `<div class="bookmark-image" style="background-image: url('${bookmark.featuredImage}')"></div>` : ''}
          <div class="bookmark-content">
            <div class="bookmark-header">
              <img src="${faviconUrl}" class="bookmark-favicon" alt="Site icon">
              <div class="bookmark-meta">
                <h4 class="bookmark-title">${bookmark.title}</h4>
                <small class="bookmark-date">${new Date(bookmark.timestamp).toLocaleDateString()}</small>
              </div>
            </div>
            <p class="bookmark-reason">${bookmark.reason}</p>
            ${bookmark.tag ? `<span class="bookmark-tag">${bookmark.tag}</span>` : ''}
          </div>
        </div>
      `;
    });
    
    bookmarksList.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    bookmarksList.innerHTML = '<p class="error">Error loading saved pages.</p>';
  }
}

function openBookmark(url) {
  chrome.tabs.create({ url: url });
}

async function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error('Error getting favicon:', error);
    return null;
  }
}

async function getFeaturedImage() {
  try {
    // Execute script in current tab to extract featured image
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: extractFeaturedImage
    });
    return result?.result || null;
  } catch (error) {
    console.error('Error getting featured image:', error);
    return null;
  }
}

function extractFeaturedImage() {
  // Look for Open Graph image
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.content) {
    return ogImage.content;
  }
  
  // Look for Twitter card image
  let twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage && twitterImage.content) {
    return twitterImage.content;
  }
  
  // Look for the first large image in the page
  let images = document.querySelectorAll('img');
  for (let img of images) {
    if (img.width >= 200 && img.height >= 150 && img.src && !img.src.includes('logo')) {
      return img.src;
    }
  }
  
  return null;
}