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
const expiringTabBtn = document.getElementById('expiring-tab');
const saveContent = document.getElementById('save-content');
const listContent = document.getElementById('list-content');
const expiringContent = document.getElementById('expiring-content');
const bookmarksList = document.getElementById('bookmarks-list');
const expiringList = document.getElementById('expiring-list');
const expiringCountBadge = document.getElementById('expiring-count');

// Preview elements
const linkPreview = document.getElementById('link-preview');
const previewImage = document.getElementById('preview-image');
const previewFavicon = document.getElementById('preview-favicon');
const previewSiteName = document.getElementById('preview-site-name');
const previewUrl = document.getElementById('preview-url');
const previewTitle = document.getElementById('preview-title');
const previewDescription = document.getElementById('preview-description');
const previewAuthor = document.getElementById('preview-author');
const previewDate = document.getElementById('preview-date');

// Expiration constants
const EXPIRATION_DAYS = 14;
const EXPIRING_WARNING_DAYS = 3;

// Expiration utility functions
function calculateExpirationDate(timestamp) {
  const saveDate = new Date(timestamp);
  const expirationDate = new Date(saveDate);
  expirationDate.setDate(saveDate.getDate() + EXPIRATION_DAYS);
  return expirationDate.toISOString();
}

function getBookmarkStatus(bookmark) {
  const now = new Date();
  const saveDate = new Date(bookmark.timestamp);
  const daysSinceSave = Math.floor((now - saveDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceSave >= EXPIRATION_DAYS) {
    return 'expired';
  } else if (daysSinceSave >= (EXPIRATION_DAYS - EXPIRING_WARNING_DAYS)) {
    return 'expiring';
  } else {
    return 'active';
  }
}

function getDaysUntilExpiration(bookmark) {
  const now = new Date();
  const saveDate = new Date(bookmark.timestamp);
  const daysSinceSave = Math.floor((now - saveDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, EXPIRATION_DAYS - daysSinceSave);
}

function getDaysSinceSave(bookmark) {
  const now = new Date();
  const saveDate = new Date(bookmark.timestamp);
  return Math.floor((now - saveDate) / (1000 * 60 * 60 * 24));
}

// Test data generator
function generateTestBookmarks() {
  const testBookmarks = [
    // Fresh bookmarks (0-10 days old)
    {
      id: 'test-1',
      title: 'Getting Started with React Hooks',
      url: 'https://reactjs.org/docs/hooks-intro.html',
      reason: 'Need to learn hooks for upcoming project',
      tag: 'react',
      timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(), // 2 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=reactjs.org&sz=32',
      featuredImage: 'https://reactjs.org/logo-og.png',
      description: 'Hooks are a new addition in React 16.8 that let you use state and other React features without writing a class.',
      siteName: 'React',
      contentType: 'article'
    },
    {
      id: 'test-2',
      title: 'CSS Grid Complete Guide',
      url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
      reason: 'Reference for responsive layouts',
      tag: 'css',
      timestamp: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(), // 5 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=css-tricks.com&sz=32',
      featuredImage: 'https://css-tricks.com/wp-content/uploads/2018/11/css-grid-2.png',
      description: 'CSS Grid Layout is the most powerful layout system available in CSS.',
      siteName: 'CSS-Tricks'
    },
    {
      id: 'test-3',
      title: 'JavaScript Performance Optimization',
      url: 'https://developer.mozilla.org/en-US/docs/Web/Performance',
      reason: 'Optimize app performance',
      tag: 'javascript',
      timestamp: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)).toISOString(), // 8 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=32',
      description: 'Web performance is the objective measurement and perceived user experience of a website or application.',
      siteName: 'MDN'
    },
    
    // Expiring bookmarks (11-13 days old)
    {
      id: 'test-4',
      title: 'Docker Best Practices',
      url: 'https://docs.docker.com/develop/best-practices/',
      reason: 'Setting up containerization for deployment',
      tag: 'devops',
      timestamp: new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)).toISOString(), // 12 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=docs.docker.com&sz=32',
      featuredImage: 'https://docs.docker.com/images/docker-logo.png',
      description: 'This page contains recommendations and best practices for writing Dockerfiles.',
      siteName: 'Docker Docs'
    },
    {
      id: 'test-5',
      title: 'API Security Checklist',
      url: 'https://github.com/shieldfy/API-Security-Checklist',
      reason: 'Security review for REST API',
      tag: 'security',
      timestamp: new Date(Date.now() - (13 * 24 * 60 * 60 * 1000)).toISOString(), // 13 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
      description: 'Checklist of the most important security countermeasures when designing, testing, and releasing your API.',
      siteName: 'GitHub'
    },
    
    // Expired bookmarks (15+ days old)
    {
      id: 'test-6',
      title: 'Old Tutorial - Outdated Framework',
      url: 'https://example.com/old-tutorial',
      reason: 'Was learning this framework but moved on',
      tag: 'archived',
      timestamp: new Date(Date.now() - (16 * 24 * 60 * 60 * 1000)).toISOString(), // 16 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
      description: 'This tutorial is now outdated and should be removed.',
      siteName: 'Example'
    },
    {
      id: 'test-7',
      title: 'Expired Conference Link',
      url: 'https://oldconference.com/2024',
      reason: 'Conference registration - already passed',
      tag: 'events',
      timestamp: new Date(Date.now() - (20 * 24 * 60 * 60 * 1000)).toISOString(), // 20 days ago
      favicon: 'https://www.google.com/s2/favicons?domain=oldconference.com&sz=32',
      description: 'Conference registration page - event has already passed.',
      siteName: 'Old Conference'
    }
  ];
  
  return testBookmarks;
}

async function loadTestData() {
  try {
    const testBookmarks = generateTestBookmarks();
    await chrome.storage.local.set({ bookmarks: testBookmarks });
    showStatus('Test data loaded successfully!', 'success');
    await updateSavedCount();
    if (listContent.classList.contains('active')) {
      loadBookmarksList();
    }
  } catch (error) {
    console.error('Error loading test data:', error);
    showStatus('Error loading test data', 'error');
  }
}

async function clearAllBookmarks() {
  try {
    await chrome.storage.local.set({ bookmarks: [] });
    showStatus('All bookmarks cleared!', 'success');
    await updateSavedCount();
    if (listContent.classList.contains('active')) {
      loadBookmarksList();
    }
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    showStatus('Error clearing bookmarks', 'error');
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Grasp extension loaded');
  await getCurrentTab();
  await updateSavedCount();
  setupEventListeners();
  setupPreviewListeners();
  
  // Add test data controls for development
  addTestDataControls();
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
  expiringTabBtn.addEventListener('click', () => switchTab('expiring'));
  
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
    // Extract favicon and enhanced metadata
    const faviconUrl = await getFaviconUrl(currentTab.url);
    const metadata = await getFeaturedImage();
    
    const bookmark = {
      id: Date.now().toString(),
      title: currentTab.title,
      url: currentTab.url,
      reason: reason,
      tag: tag,
      timestamp: new Date().toISOString(),
      favicon: faviconUrl,
      // Enhanced metadata for previews
      featuredImage: metadata?.featuredImage || null,
      description: metadata?.description || null,
      siteName: metadata?.siteName || null,
      publishedTime: metadata?.publishedTime || null,
      author: metadata?.author || null,
      contentType: metadata?.contentType || null
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
    let bookmarks = result.bookmarks || [];
    
    // Clean up expired bookmarks automatically
    const cleanedBookmarks = await cleanupExpiredBookmarks(bookmarks);
    
    // Count bookmarks by status
    const activeBooksmarks = cleanedBookmarks.filter(b => getBookmarkStatus(b) === 'active');
    const expiringBookmarks = cleanedBookmarks.filter(b => getBookmarkStatus(b) === 'expiring');
    
    const totalCount = cleanedBookmarks.length;
    const expiringCount = expiringBookmarks.length;
    
    savedCountSpan.textContent = `${totalCount} saved`;
    
    // Update expiring count badge
    if (expiringCount > 0) {
      expiringCountBadge.textContent = expiringCount;
      expiringCountBadge.style.display = 'inline';
      
      // Show notification if there are expiring bookmarks
      if (expiringCount > 0) {
        showExpiringNotification(expiringCount);
      }
    } else {
      expiringCountBadge.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error updating saved count:', error);
  }
}

async function cleanupExpiredBookmarks(bookmarks) {
  const validBookmarks = bookmarks.filter(bookmark => {
    const status = getBookmarkStatus(bookmark);
    return status !== 'expired';
  });
  
  const expiredCount = bookmarks.length - validBookmarks.length;
  
  if (expiredCount > 0) {
    // Save cleaned bookmarks back to storage
    await chrome.storage.local.set({ bookmarks: validBookmarks });
    showStatus(`Removed ${expiredCount} expired bookmark${expiredCount !== 1 ? 's' : ''}`, 'success');
  }
  
  return validBookmarks;
}

function showExpiringNotification(count) {
  // Only show notification once per session to avoid spam
  if (!sessionStorage.getItem('expiringNotificationShown')) {
    setTimeout(() => {
      showStatus(`⚠️ ${count} bookmark${count !== 1 ? 's' : ''} expiring soon! Check the Expiring tab.`, 'error');
    }, 1000);
    sessionStorage.setItem('expiringNotificationShown', 'true');
  }
}

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  saveTabBtn.classList.remove('active');
  listTabBtn.classList.remove('active');
  expiringTabBtn.classList.remove('active');
  saveContent.classList.remove('active');
  listContent.classList.remove('active');
  expiringContent.classList.remove('active');
  
  if (tabName === 'save') {
    saveTabBtn.classList.add('active');
    saveContent.classList.add('active');
  } else if (tabName === 'list') {
    listTabBtn.classList.add('active');
    listContent.classList.add('active');
    loadBookmarksList();
  } else if (tabName === 'expiring') {
    expiringTabBtn.classList.add('active');
    expiringContent.classList.add('active');
    loadExpiringBookmarksList();
  }
}

async function loadBookmarksList() {
  try {
    const result = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = result.bookmarks || [];
    
    // Filter to show all non-expired bookmarks (active + expiring)
    const validBookmarks = bookmarks.filter(bookmark => {
      const status = getBookmarkStatus(bookmark);
      return status !== 'expired';
    });
    
    if (validBookmarks.length === 0) {
      bookmarksList.innerHTML = '<p class="no-bookmarks">No saved pages.</p>';
      return;
    }
    
    // Sort by expiration date - expiring soonest first
    const sortedBookmarks = validBookmarks.sort((a, b) => {
      const daysA = getDaysUntilExpiration(a);
      const daysB = getDaysUntilExpiration(b);
      return daysA - daysB; // Ascending order (soonest first)
    });
    
    renderBookmarks(sortedBookmarks, bookmarksList, false);
    
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    bookmarksList.innerHTML = '<p class="error">Error loading saved pages.</p>';
  }
}

async function loadExpiringBookmarksList() {
  try {
    const result = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = result.bookmarks || [];
    
    // Filter to show only expiring bookmarks
    const expiringBookmarks = bookmarks.filter(bookmark => {
      const status = getBookmarkStatus(bookmark);
      return status === 'expiring';
    });
    
    if (expiringBookmarks.length === 0) {
      expiringList.innerHTML = '<p class="no-expiring">No expiring links.</p>';
      return;
    }
    
    // Sort by expiration date - expiring soonest first
    const sortedExpiringBookmarks = expiringBookmarks.sort((a, b) => {
      const daysA = getDaysUntilExpiration(a);
      const daysB = getDaysUntilExpiration(b);
      return daysA - daysB; // Ascending order (soonest first)
    });
    
    renderBookmarks(sortedExpiringBookmarks, expiringList, true);
    
  } catch (error) {
    console.error('Error loading expiring bookmarks:', error);
    expiringList.innerHTML = '<p class="error">Error loading expiring pages.</p>';
  }
}

function renderBookmarks(bookmarks, container, showExpiration = false) {
  let html = '';
  bookmarks.forEach((bookmark, index) => {
    const faviconUrl = bookmark.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;
    const hasImage = bookmark.featuredImage && bookmark.featuredImage !== '';
    const status = getBookmarkStatus(bookmark);
    const daysUntilExpiration = getDaysUntilExpiration(bookmark);
    const daysSinceSave = getDaysSinceSave(bookmark);
    
    let statusIndicator = '';
    if (showExpiration || status === 'expiring') {
      statusIndicator = `<div class="expiration-warning">⚠️ Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}</div>`;
    }
    
    html += `
      <div class="bookmark-card ${status === 'expiring' ? 'expiring' : ''}" 
           data-bookmark-index="${index}"
           data-bookmark-id="${bookmark.id}"
           data-status="${status}">
        ${hasImage ? `<div class="bookmark-image" style="background-image: url('${bookmark.featuredImage}')"></div>` : ''}
        <div class="bookmark-content">
          <div class="bookmark-header">
            <img src="${faviconUrl}" class="bookmark-favicon" alt="Site icon">
            <div class="bookmark-meta">
              <h4 class="bookmark-title">${bookmark.title}</h4>
              <small class="bookmark-date">${new Date(bookmark.timestamp).toLocaleDateString()} (${daysSinceSave} days ago)</small>
            </div>
            <button class="delete-btn" title="Delete bookmark">×</button>
          </div>
          ${statusIndicator}
          <p class="bookmark-reason">${bookmark.reason}</p>
          ${bookmark.tag ? `<span class="bookmark-tag">${bookmark.tag}</span>` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Add event listeners for previews, clicks, and delete
  const bookmarkCards = container.querySelectorAll('.bookmark-card');
  bookmarkCards.forEach((card, index) => {
    const bookmark = bookmarks[index];
    const deleteBtn = card.querySelector('.delete-btn');
    
    // Open bookmark on card click (but not on delete button)
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('delete-btn')) {
        openBookmark(bookmark.url);
      }
    });
    
    // Delete bookmark on delete button click
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent card click
      await deleteBookmark(bookmark.id);
    });
    
    // Add hover preview only to the title
    const titleElement = card.querySelector('.bookmark-title');
    titleElement.addEventListener('mouseenter', (e) => {
      showLinkPreview(bookmark, e.currentTarget);
    });
    
    titleElement.addEventListener('mouseleave', () => {
      hideLinkPreview();
    });
  });
}

function openBookmark(url) {
  chrome.tabs.create({ url: url });
}

async function deleteBookmark(bookmarkId) {
  try {
    // Get current bookmarks
    const result = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = result.bookmarks || [];
    
    // Find bookmark to get title for confirmation
    const bookmarkToDelete = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmarkToDelete) {
      showStatus('Bookmark not found', 'error');
      return;
    }
    
    // Remove bookmark from array
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    
    // Save updated bookmarks
    await chrome.storage.local.set({ bookmarks: updatedBookmarks });
    
    // Show success message
    showStatus(`Deleted: ${bookmarkToDelete.title}`, 'success');
    
    // Update counts and refresh current view
    await updateSavedCount();
    
    // Refresh the current tab view
    if (listContent.classList.contains('active')) {
      loadBookmarksList();
    } else if (expiringContent.classList.contains('active')) {
      loadExpiringBookmarksList();
    }
    
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    showStatus('Error deleting bookmark', 'error');
  }
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
    // Execute script in current tab to extract enhanced metadata
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: extractFeaturedImage
    });
    return result?.result || null;
  } catch (error) {
    console.error('Error getting enhanced metadata:', error);
    return null;
  }
}

function extractFeaturedImage() {
  // Extract metadata for enhanced previews
  const metadata = {};
  
  // Look for Open Graph image
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.content) {
    metadata.featuredImage = ogImage.content;
  }
  
  // If no OG image, look for Twitter card image
  if (!metadata.featuredImage) {
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content) {
      metadata.featuredImage = twitterImage.content;
    }
  }
  
  // If still no image, look for the first large image in the page
  if (!metadata.featuredImage) {
    let images = document.querySelectorAll('img');
    for (let img of images) {
      if (img.width >= 200 && img.height >= 150 && img.src && !img.src.includes('logo')) {
        metadata.featuredImage = img.src;
        break;
      }
    }
  }
  
  // Extract description
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription && ogDescription.content) {
    metadata.description = ogDescription.content;
  } else {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.content) {
      metadata.description = metaDescription.content;
    }
  }
  
  // Extract site name
  let ogSiteName = document.querySelector('meta[property="og:site_name"]');
  if (ogSiteName && ogSiteName.content) {
    metadata.siteName = ogSiteName.content;
  } else {
    // Fallback to domain name
    metadata.siteName = window.location.hostname.replace('www.', '');
  }
  
  // Extract article published time
  let articleTime = document.querySelector('meta[property="article:published_time"]');
  if (articleTime && articleTime.content) {
    metadata.publishedTime = articleTime.content;
  }
  
  // Extract author
  let ogAuthor = document.querySelector('meta[property="article:author"]');
  if (ogAuthor && ogAuthor.content) {
    metadata.author = ogAuthor.content;
  } else {
    let authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta && authorMeta.content) {
      metadata.author = authorMeta.content;
    }
  }
  
  // Extract content type
  let ogType = document.querySelector('meta[property="og:type"]');
  if (ogType && ogType.content) {
    metadata.contentType = ogType.content;
  }
  
  return metadata;
}

// Link Preview Functions
let previewTimeout = null;

function showLinkPreview(bookmark, cardElement) {
  clearTimeout(previewTimeout);
  
  // Check if preview elements exist
  if (!linkPreview || !previewFavicon || !previewTitle) {
    console.error('Preview elements not found');
    return;
  }
  
  // Populate preview content
  const faviconUrl = bookmark.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;
  
  // Set favicon
  previewFavicon.src = faviconUrl;
  
  // Set site name and URL
  previewSiteName.textContent = bookmark.siteName || new URL(bookmark.url).hostname.replace('www.', '');
  previewUrl.textContent = bookmark.url;
  
  // Set title
  previewTitle.textContent = bookmark.title;
  
  // Set description (fallback to reason if no description)
  previewDescription.textContent = bookmark.description || bookmark.reason;
  
  // Set image
  if (bookmark.featuredImage) {
    previewImage.src = bookmark.featuredImage;
    previewImage.style.display = 'block';
  } else {
    previewImage.style.display = 'none';
  }
  
  // Set author and date
  previewAuthor.textContent = bookmark.author || '';
  
  if (bookmark.publishedTime) {
    previewDate.textContent = new Date(bookmark.publishedTime).toLocaleDateString();
  } else {
    previewDate.textContent = new Date(bookmark.timestamp).toLocaleDateString();
  }
  
  // Position preview as overlay within popup bounds
  const container = document.querySelector('.container');
  const listContent = document.getElementById('list-content');
  
  // Simple overlay positioning - center the preview in the list area
  linkPreview.style.position = 'absolute';
  linkPreview.style.left = '20px';
  linkPreview.style.top = '120px';
  linkPreview.style.width = '310px';
  linkPreview.style.maxWidth = '310px';
  
  // Show preview with shorter delay
  previewTimeout = setTimeout(() => {
    linkPreview.style.display = 'block';
  }, 300);
}

function hideLinkPreview() {
  clearTimeout(previewTimeout);
  linkPreview.style.display = 'none';
}

function setupPreviewListeners() {
  // Close preview when clicking outside
  linkPreview.addEventListener('click', (e) => {
    if (e.target === linkPreview) {
      hideLinkPreview();
    }
  });
  
  // Close preview with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && linkPreview.style.display === 'block') {
      hideLinkPreview();
    }
  });
}

function addTestDataControls() {
  // Add test data control buttons for development
  const container = document.querySelector('.container');
  const testControls = document.createElement('div');
  testControls.className = 'test-controls';
  testControls.style.cssText = 'margin-top: 10px; display: flex; gap: 5px; font-size: 11px;';
  
  const loadTestBtn = document.createElement('button');
  loadTestBtn.textContent = 'Load Test Data';
  loadTestBtn.style.cssText = 'padding: 4px 8px; font-size: 10px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;';
  loadTestBtn.addEventListener('click', loadTestData);
  
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear All';
  clearBtn.style.cssText = 'padding: 4px 8px; font-size: 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;';
  clearBtn.addEventListener('click', clearAllBookmarks);
  
  testControls.appendChild(loadTestBtn);
  testControls.appendChild(clearBtn);
  container.appendChild(testControls);
}