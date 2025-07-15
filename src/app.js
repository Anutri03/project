// Application State
let currentEvent = null;
let currentUser = null;
let isPresenter = false;
let events = JSON.parse(localStorage.getItem('slidoEvents') || '{}');
let participants = JSON.parse(localStorage.getItem('slidoParticipants') || '{}');
let users = JSON.parse(localStorage.getItem('slidoUsers') || '{}');

// Utility Functions
function generateEventCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveToStorage() {
    localStorage.setItem('slidoEvents', JSON.stringify(events));
    localStorage.setItem('slidoParticipants', JSON.stringify(participants));
    localStorage.setItem('slidoUsers', JSON.stringify(users));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showSignupModal() {
    showModal('signupModal');
}

function showLoginModal() {
    showModal('loginModal');
}

function showJoinModal() {
    showModal('joinModal');
}

function showCreatePollModal() {
    showModal('createPollModal');
}

function showShareEventModal() {
    if (!currentEvent) return;
    
    document.getElementById('shareEventCode').textContent = `#${currentEvent.code}`;
    document.getElementById('shareEventLink').value = `${window.location.origin}?join=${currentEvent.code}`;
    
    showModal('shareEventModal');
}

// Navigation Functions
function goHome() {
    hideAllViews();
    document.getElementById('mainContent').style.display = 'block';
    currentEvent = null;
    currentUser = null;
    isPresenter = false;
    
    // Reset forms
    const forms = ['signupForm', 'loginForm', 'joinForm', 'createPollForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) form.reset();
    });
    
    showNotification('Returned to home');
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Authentication Functions
function registerUser(fullName, email, password) {
    if (users[email]) {
        showNotification('User already exists with this email!', 'error');
        return false;
    }
    
    if (!fullName || !email || !password) {
        showNotification('Please fill in all fields!', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long!', 'error');
        return false;
    }
    
    const userId = generateId();
    const user = {
        id: userId,
        fullName,
        email,
        password,
        createdAt: new Date().toISOString(),
        events: []
    };
    
    users[email] = user;
    currentUser = user;
    saveToStorage();
    localStorage.setItem('lastLoggedInUser', email);
    
    showNotification(`Welcome ${fullName}! Account created successfully.`);
    updateUIForLoggedInUser();
    return true;
}

function loginUser(email, password) {
    const user = users[email];
    
    if (!user) {
        showNotification('No account found with this email!', 'error');
        return false;
    }
    
    if (user.password !== password) {
        showNotification('Incorrect password!', 'error');
        return false;
    }
    
    currentUser = user;
    localStorage.setItem('lastLoggedInUser', email);
    showNotification(`Welcome back, ${user.fullName}!`);
    updateUIForLoggedInUser();
    return true;
}

function logoutUser() {
    currentUser = null;
    currentEvent = null;
    isPresenter = false;
    localStorage.removeItem('lastLoggedInUser');
    
    updateUIForLoggedOutUser();
    hideAllViews();
    document.getElementById('mainContent').style.display = 'block';
    
    showNotification('Logged out successfully');
}

function googleSignup() {
    const googleUser = {
        id: generateId(),
        fullName: 'Google User',
        email: 'user@gmail.com',
        password: 'google_auth',
        createdAt: new Date().toISOString(),
        events: []
    };
    
    users[googleUser.email] = googleUser;
    currentUser = googleUser;
    saveToStorage();
    localStorage.setItem('lastLoggedInUser', googleUser.email);
    
    closeModal('signupModal');
    showNotification('Successfully signed up with Google!');
    updateUIForLoggedInUser();
}

function googleLogin() {
    const googleUser = {
        id: generateId(),
        fullName: 'Google User',
        email: 'user@gmail.com',
        password: 'google_auth',
        createdAt: new Date().toISOString(),
        events: []
    };
    
    users[googleUser.email] = googleUser;
    currentUser = googleUser;
    saveToStorage();
    localStorage.setItem('lastLoggedInUser', googleUser.email);
    
    closeModal('loginModal');
    showNotification('Successfully logged in with Google!');
    updateUIForLoggedInUser();
}

function updateUIForLoggedInUser() {
    const navRight = document.getElementById('navRight');
    navRight.innerHTML = `
        <span style="color: #64748B; font-weight: 500;">Hello, ${currentUser.fullName}</span>
        <div class="nav-dropdown">
            <button class="btn-secondary dropdown-trigger">
                My Account
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L2 4h8L6 8z"/>
                </svg>
            </button>
            <div class="dropdown-menu" style="right: 0; left: auto;">
                <a href="#" class="dropdown-item" onclick="showUserProfile()">
                    <div class="item-icon">👤</div>
                    <div>
                        <div class="item-title">Profile</div>
                        <div class="item-desc">Manage your account</div>
                    </div>
                </a>
                <a href="#" class="dropdown-item" onclick="showMyEvents()">
                    <div class="item-icon">📊</div>
                    <div>
                        <div class="item-title">My Events</div>
                        <div class="item-desc">View your events</div>
                    </div>
                </a>
                <a href="#" class="dropdown-item" onclick="logoutUser()">
                    <div class="item-icon">🚪</div>
                    <div>
                        <div class="item-title">Log out</div>
                        <div class="item-desc">Sign out of your account</div>
                    </div>
                </a>
            </div>
        </div>
        <button class="btn-primary" onclick="createNewEvent()">Create slido</button>
    `;
}

function updateUIForLoggedOutUser() {
    const navRight = document.getElementById('navRight');
    navRight.innerHTML = `
        <button class="btn-secondary" onclick="showLoginModal()">Log in</button>
        <button class="btn-primary" onclick="showSignupModal()">Sign up free</button>
    `;
}

function showUserProfile() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    // For now, just show a notification
    showNotification('User profile feature coming soon!', 'info');
}

function showMyEvents() {
    showNotification('My Events feature coming soon!', 'info');
}

// Event Management
function createNewEvent() {
    if (!currentUser) {
        showNotification('Please log in to create an event', 'error');
        showLoginModal();
        return;
    }
    
    // Initialize date fields with today and tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    document.getElementById('eventStartDate').value = formatDate(today);
    document.getElementById('eventEndDate').value = formatDate(tomorrow);
    document.getElementById('eventTitle').value = '';
    
    // Show the event creation modal
    showModal('createEventModal');
}

// Helper function to format date as YYYY-MM-DD for date inputs
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Handle event creation from modal
function handleCreateEvent() {
    const title = document.getElementById('eventTitle').value;
    const startDate = document.getElementById('eventStartDate').value;
    const endDate = document.getElementById('eventEndDate').value;
    
    if (!title || !startDate || !endDate) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
        showNotification('End date cannot be before start date', 'error');
        return;
    }
    
    const eventCode = generateEventCode();
    const eventId = generateId();
    
    const event = {
        id: eventId,
        code: eventCode,
        title,
        description: '',
        startDate,
        endDate,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        polls: [],
        questions: [],
        quizzes: [],
        wordClouds: [],
        participants: [],
        qaEnabled: false,
        isActive: true
    };
    
    events[eventCode] = event;
    currentUser.events = currentUser.events || [];
    currentUser.events.push(eventId);
    saveToStorage();
    
    currentEvent = event;
    isPresenter = true;
    
    closeModal('createEventModal');
    showPresenterDashboard();
    showNotification(`Event "${title}" created successfully! Code: ${eventCode}`);
}

function joinEvent(eventCode, participantName) {
    // Remove any # prefix if present
    eventCode = eventCode.replace('#', '');
    
    const event = events[eventCode];
    if (!event) {
        showNotification('Event not found! Please check the code.', 'error');
        return false;
    }
    
    const participantId = generateId();
    const participant = {
        id: participantId,
        name: participantName,
        joinedAt: new Date().toISOString(),
        isPresenter: false,
        isOnline: true
    };
    
    event.participants.push(participant);
    participants[participantId] = participant;
    saveToStorage();
    
    currentEvent = event;
    currentUser = participant;
    isPresenter = false;
    
    showParticipantDashboard();
    showNotification(`Joined "${event.title || event.name}" successfully!`);
    return true;
}

// Dashboard Functions
function showPresenterDashboard() {
    hideAllViews();
    document.getElementById('presenterDashboard').classList.remove('hidden');
    document.getElementById('presenterDashboard').style.display = 'block';
    document.getElementById('dashboardEventTitle').textContent = currentEvent.title;
    document.getElementById('dashboardEventCode').textContent = `${currentEvent.code}`;
    
    // Set the user name in the dashboard header
    if (currentUser && currentUser.fullName) {
        document.getElementById('dashboardUserName').textContent = currentUser.fullName;
    } else if (currentUser && currentUser.name) {
        document.getElementById('dashboardUserName').textContent = currentUser.name;
    } else {
        document.getElementById('dashboardUserName').textContent = 'User';
    }
    
    updateDashboardBadges();
    showPollsSection();
    renderPolls();
    renderQuestions();
}

function showParticipantDashboard() {
    hideAllViews();
    document.getElementById('participantDashboard').classList.remove('hidden');
    document.getElementById('participantDashboard').style.display = 'block';
    
    // Update event title and code
    document.getElementById('participantEventTitle').textContent = currentEvent.title || currentEvent.name;
    document.getElementById('participantEventCode').textContent = `#${currentEvent.code}`;
    
    // Update participant name in footer
    document.getElementById('participantName').textContent = currentUser.name;
    
    // Show polls tab by default
    showParticipantPolls();
    renderParticipantPolls();
    renderParticipantQuestions();
}

function hideAllViews() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('presenterDashboard').style.display = 'none';
    document.getElementById('participantDashboard').style.display = 'none';
    document.getElementById('presenterDashboard').classList.add('hidden');
    document.getElementById('participantDashboard').classList.add('hidden');
    
    // Hide mobile poll view if it exists
    const mobilePollView = document.getElementById('mobilePollView');
    if (mobilePollView) {
        mobilePollView.style.display = 'none';
    }
}

function updateDashboardBadges() {
    if (!currentEvent) return;
    
    document.getElementById('pollsBadge').textContent = currentEvent.polls.length;
    document.getElementById('qaBadge').textContent = currentEvent.questions.length;
    document.getElementById('quizBadge').textContent = currentEvent.quizzes?.length || 0;
    document.getElementById('wordcloudBadge').textContent = currentEvent.wordClouds?.length || 0;
    document.getElementById('participantsBadge').textContent = currentEvent.participants.length;
}

// Section Navigation
function showPollsSection() {
    switchSection('polls');
}

function showQASection() {
    switchSection('qa');
}

function showQuizSection() {
    switchSection('quiz');
    showNotification('Quiz feature coming soon!', 'info');
}

function showWordCloudSection() {
    switchSection('wordcloud');
    showNotification('Word cloud feature coming soon!', 'info');
}

function showAnalyticsSection() {
    switchSection('analytics');
    updateAnalytics();
}

function showParticipantsSection() {
    switchSection('participants');
    renderParticipants();
}

function switchSection(sectionName) {
    // Update sidebar buttons
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
    
    // Update content sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Participant Tabs
function showParticipantPolls() {
    switchParticipantTab('polls');
}

function showParticipantQA() {
    switchParticipantTab('qa');
}

function showParticipantQuiz() {
    switchParticipantTab('quiz');
    showNotification('Quiz feature coming soon!', 'info');
}

function showParticipantWordCloud() {
    switchParticipantTab('wordcloud');
    showNotification('Word cloud feature coming soon!', 'info');
}

function switchParticipantTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`participant${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Poll Functions
function handlePollTypeChange() {
    const pollType = document.getElementById('pollType').value;
    const optionsGroup = document.getElementById('optionsGroup');
    
    if (pollType === 'word-cloud') {
        optionsGroup.style.display = 'none';
    } else {
        optionsGroup.style.display = 'block';
    }
}

function createPoll(question, options, type = 'multiple-choice', settings = {}) {
    const pollId = generateId();
    const poll = {
        id: pollId,
        question,
        type,
        options: type === 'word-cloud' ? [] : options.map(option => ({
            id: generateId(),
            text: option,
            votes: 0,
            voters: []
        })),
        responses: type === 'word-cloud' ? [] : [],
        isActive: true,
        createdAt: new Date().toISOString(),
        settings: {
            allowMultipleVotes: settings.allowMultipleVotes || false,
            hideResults: settings.hideResults || false,
            timer: {
                enabled: settings.timer?.enabled || false,
                duration: settings.timer?.duration || 30,
                startTime: settings.timer?.enabled ? new Date().toISOString() : null,
                endTime: settings.timer?.enabled ? new Date(Date.now() + settings.timer.duration * 1000).toISOString() : null
            },
            generateQR: settings.generateQR !== undefined ? settings.generateQR : true
        }
    };
    
    currentEvent.polls.push(poll);
    saveToStorage();
    
    updateDashboardBadges();
    renderPolls();
    renderParticipantPolls();
    
    // If timer is enabled, start it
    if (poll.settings.timer.enabled) {
        startPollTimer(pollId);
    }
    
    // If QR code is enabled, generate it
    if (poll.settings.generateQR) {
        showPollQRCode(pollId);
    }
    
    showNotification('Poll created and activated!');
}

function votePoll(pollId, optionId) {
    const poll = currentEvent.polls.find(p => p.id === pollId);
    if (!poll) return;
    
    // Check if user already voted
    const hasVoted = poll.options.some(option => option.voters.includes(currentUser.id));
    if (hasVoted && !poll.settings.allowMultipleVotes) {
        showNotification('You have already voted in this poll!', 'error');
        return;
    }
    
    const option = poll.options.find(o => o.id === optionId);
    if (option) {
        option.votes++;
        option.voters.push(currentUser.id);
        saveToStorage();
        
        renderParticipantPolls();
        showNotification('Vote recorded successfully!');
    }
}

function renderPolls() {
    const pollsList = document.getElementById('pollsList');
    if (!currentEvent || currentEvent.polls.length === 0) {
        pollsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No polls yet</h3>
                <p>Create your first poll to start engaging with your audience</p>
                <button class="btn-primary" onclick="showCreatePollModal()">Create poll</button>
            </div>
        `;
        return;
    }
    
    pollsList.innerHTML = currentEvent.polls.map(poll => {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        
        // Calculate time remaining if timer is enabled
        let timerHtml = '';
        if (poll.settings?.timer?.enabled && poll.isActive) {
            const now = new Date();
            const endTime = new Date(poll.settings.timer.endTime);
            const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerHtml = `
                <div class="poll-timer-container">
                    <div class="poll-timer" data-poll-id="${poll.id}">
                        <span class="poll-timer-icon">⏱️</span>
                        ${minutes}:${seconds.toString().padStart(2, '0')}
                    </div>
                    <div class="poll-timer-text">Time remaining</div>
                </div>
            `;
        }
        
        // Poll status indicator
        const statusClass = poll.isActive ? 
            (poll.settings?.timer?.enabled ? 'poll-status-active' : '') : 
            'poll-status-ended';
        const statusText = poll.isActive ? 
            (poll.settings?.timer?.enabled ? 'Active' : '') : 
            'Ended';
        
        return `
            <div class="poll-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <h4>
                        ${poll.question}
                        ${statusText ? `<span class="poll-status ${statusClass}">${statusText}</span>` : ''}
                    </h4>
                    <div style="display: flex; gap: 8px;">
                        ${poll.settings?.generateQR ? 
                            `<button class="btn-secondary" onclick="showPollQRCode('${poll.id}')" style="padding: 6px 12px; font-size: 12px;">
                                QR Code
                            </button>` : ''
                        }
                        <button class="btn-secondary" onclick="togglePoll('${poll.id}')" style="padding: 6px 12px; font-size: 12px;">
                            ${poll.isActive ? 'Pause' : 'Resume'}
                        </button>
                        <button class="btn-secondary" onclick="showPollResults('${poll.id}')" style="padding: 6px 12px; font-size: 12px;">
                            Results
                        </button>
                        <button class="btn-secondary" onclick="deletePoll('${poll.id}')" style="padding: 6px 12px; font-size: 12px; color: #EF4444;">
                            Delete
                        </button>
                    </div>
                </div>
                
                ${timerHtml}
                
                <div class="poll-options">
                    ${poll.options.map(option => {
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        return `
                            <div class="poll-option">
                                <span class="option-text">${option.text}</span>
                                <div class="option-bar">
                                    <div class="option-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="option-percent">${percentage}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="poll-meta">
                    Total votes: ${totalVotes} • Created ${new Date(poll.createdAt).toLocaleDateString()} • 
                    Status: <span style="color: ${poll.isActive ? '#00D2AA' : '#EF4444'}">${poll.isActive ? 'Active' : 'Paused'}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderParticipantPolls() {
    const pollsList = document.getElementById('participantPollsList');
    if (!currentEvent || currentEvent.polls.length === 0) {
        pollsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No active polls</h3>
                <p>Wait for the presenter to start a poll</p>
            </div>
        `;
        return;
    }
    
    const activePolls = currentEvent.polls.filter(poll => poll.isActive);
    if (activePolls.length === 0) {
        pollsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No active polls</h3>
                <p>Wait for the presenter to start a poll</p>
            </div>
        `;
        return;
    }
    
    pollsList.innerHTML = activePolls.map(poll => {
        const hasVoted = poll.options.some(option => option.voters.includes(currentUser.id));
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        
        // Calculate time remaining if timer is enabled
        let timerHtml = '';
        if (poll.settings?.timer?.enabled) {
            const now = new Date();
            const endTime = new Date(poll.settings.timer.endTime);
            const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerHtml = `
                <div class="poll-timer-container">
                    <div class="poll-timer" data-poll-id="${poll.id}">
                        <span class="poll-timer-icon">⏱️</span>
                        ${minutes}:${seconds.toString().padStart(2, '0')}
                    </div>
                    <div class="poll-timer-text">Time remaining to vote</div>
                </div>
            `;
        }
        
        if (hasVoted || poll.settings.hideResults === false) {
            // Show results if already voted or results are not hidden
            return `
                <div class="poll-card">
                    <h4>${poll.question}</h4>
                    ${timerHtml}
                    <div class="poll-options">
                        ${poll.options.map(option => {
                            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                            return `
                                <div class="poll-option">
                                    <span class="option-text">${option.text}</span>
                                    <div class="option-bar">
                                        <div class="option-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="option-percent">${percentage}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="poll-meta" style="color: #00D2AA; font-weight: 600;">
                        ${hasVoted ? '✓ You voted • ' : ''}Total votes: ${totalVotes}
                    </div>
                </div>
            `;
        } else {
            // Show voting interface
            return `
                <div class="poll-card">
                    <h4>${poll.question}</h4>
                    ${timerHtml}
                    <form onsubmit="handlePollVote(event, '${poll.id}')">
                        <div class="poll-options">
                            ${poll.options.map(option => `
                                <div class="poll-option">
                                    <label>
                                        <input type="radio" name="poll-${poll.id}" value="${option.id}" required>
                                        <span>${option.text}</span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                        <button type="submit" class="btn-primary" style="margin-top: 16px;">Vote</button>
                    </form>
                </div>
            `;
        }
    }).join('');
}

function handlePollVote(event, pollId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const optionId = formData.get(`poll-${pollId}`);
    votePoll(pollId, optionId);
}

function togglePoll(pollId) {
    const poll = currentEvent.polls.find(p => p.id === pollId);
    if (poll) {
        poll.isActive = !poll.isActive;
        saveToStorage();
        renderPolls();
        renderParticipantPolls();
        showNotification(`Poll ${poll.isActive ? 'resumed' : 'paused'}`);
    }
}

function deletePoll(pollId) {
    if (confirm('Are you sure you want to delete this poll?')) {
        currentEvent.polls = currentEvent.polls.filter(p => p.id !== pollId);
        saveToStorage();
        updateDashboardBadges();
        renderPolls();
        renderParticipantPolls();
        showNotification('Poll deleted');
    }
}

// Question Functions
function submitQuestion() {
    const questionText = document.getElementById('questionInput').value.trim();
    if (!questionText) {
        showNotification('Please enter a question', 'error');
        return;
    }
    
    if (!currentEvent.qaEnabled) {
        showNotification('Q&A is not enabled for this event', 'error');
        return;
    }
    
    // Check if anonymous checkbox is checked
    const isAnonymous = document.getElementById('anonymousQuestion')?.checked || false;
    
    const questionId = generateId();
    const question = {
        id: questionId,
        text: questionText,
        author: isAnonymous ? 'Anonymous' : currentUser.name,
        authorId: currentUser.id, // Still track the author ID for filtering
        votes: 0,
        voters: [],
        isAnswered: false,
        answer: '',
        createdAt: new Date().toISOString(),
        isAnonymous: isAnonymous
    };
    
    currentEvent.questions.push(question);
    saveToStorage();
    
    document.getElementById('questionInput').value = '';
    updateDashboardBadges();
    renderQuestions();
    renderParticipantQuestions();
    
    showNotification('Question submitted successfully!');
}

function voteQuestion(questionId) {
    const question = currentEvent.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const hasVoted = question.voters.includes(currentUser.id);
    if (hasVoted) {
        // Remove vote
        question.votes--;
        question.voters = question.voters.filter(id => id !== currentUser.id);
        showNotification('Vote removed');
    } else {
        // Add vote
        question.votes++;
        question.voters.push(currentUser.id);
        showNotification('Vote added');
    }
    
    saveToStorage();
    renderQuestions();
    renderParticipantQuestions();
}

function renderQuestions() {
    const qaList = document.getElementById('qaList');
    if (!currentEvent.qaEnabled) {
        qaList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❓</div>
                <h3>Q&A is disabled</h3>
                <p>Enable Q&A to let your audience ask questions</p>
            </div>
        `;
        return;
    }
    
    if (currentEvent.questions.length === 0) {
        qaList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❓</div>
                <h3>No questions yet</h3>
                <p>Questions from your audience will appear here</p>
            </div>
        `;
        return;
    }
    
    // Sort questions by votes (descending)
    const sortedQuestions = [...currentEvent.questions].sort((a, b) => b.votes - a.votes);
    
    qaList.innerHTML = sortedQuestions.map(question => `
        <div class="question-card">
            <p>${question.text}</p>
            <div class="question-meta">
                <span>by ${question.author} • ${new Date(question.createdAt).toLocaleDateString()}</span>
                <div class="question-votes">
                    <span>👍 ${question.votes}</span>
                    <button class="btn-secondary" onclick="answerQuestion('${question.id}')" style="margin-left: 12px; padding: 4px 8px; font-size: 12px;">
                        ${question.isAnswered ? 'Edit Answer' : 'Answer'}
                    </button>
                    <button class="btn-secondary" onclick="deleteQuestion('${question.id}')" style="margin-left: 8px; padding: 4px 8px; font-size: 12px; color: #EF4444;">
                        Delete
                    </button>
                </div>
            </div>
            ${question.isAnswered ? `
                <div style="margin-top: 12px; padding: 12px; background: #F0FDF4; border-radius: 8px; border-left: 4px solid #00D2AA;">
                    <strong>Answer:</strong> ${question.answer}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderParticipantQuestions() {
    const qaList = document.getElementById('participantQAList');
    if (!currentEvent || !currentEvent.qaEnabled) {
        qaList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❓</div>
                <h3>Q&A is disabled</h3>
                <p>Q&A is not enabled for this event</p>
            </div>
        `;
        return;
    }
    
    // Get the active filter or default to 'all'
    const activeFilter = document.querySelector('.qa-filter-btn.active');
    const filterType = activeFilter ? activeFilter.dataset.filter : 'all';
    
    // Apply the filter
    filterQuestions(filterType);
}

function answerQuestion(questionId) {
    const question = currentEvent.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const answer = prompt('Enter your answer:', question.answer || '');
    if (answer !== null) {
        question.answer = answer;
        question.isAnswered = answer.trim() !== '';
        saveToStorage();
        renderQuestions();
        renderParticipantQuestions();
        showNotification(question.isAnswered ? 'Answer saved' : 'Answer removed');
    }
}

function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        currentEvent.questions = currentEvent.questions.filter(q => q.id !== questionId);
        saveToStorage();
        updateDashboardBadges();
        renderQuestions();
        renderParticipantQuestions();
        showNotification('Question deleted');
    }
}

// Poll Option Management
function addOption() {
    const pollOptions = document.getElementById('pollOptions');
    const optionCount = pollOptions.children.length + 1;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-input';
    optionDiv.innerHTML = `
        <input type="text" placeholder="Option ${optionCount}" required>
        <button type="button" class="btn-remove" onclick="removeOption(this)">×</button>
    `;
    
    pollOptions.appendChild(optionDiv);
}

function removeOption(button) {
    const pollOptions = document.getElementById('pollOptions');
    if (pollOptions.children.length > 2) {
        button.parentElement.remove();
    } else {
        showNotification('A poll must have at least 2 options!', 'error');
    }
}

// Analytics Functions
function updateAnalytics() {
    if (!currentEvent) return;
    
    const totalParticipants = currentEvent.participants.length;
    const totalPolls = currentEvent.polls.length;
    const totalQuestions = currentEvent.questions.length;
    
    // Calculate engagement rate
    const totalVotes = currentEvent.polls.reduce((sum, poll) => 
        sum + poll.options.reduce((optSum, opt) => optSum + opt.votes, 0), 0);
    const engagementRate = totalParticipants > 0 ? Math.round((totalVotes / totalParticipants) * 100) : 0;
    
    // Calculate participation rate
    const activeParticipants = currentEvent.participants.filter(p => p.isOnline).length;
    const participationRate = totalParticipants > 0 ? Math.round((activeParticipants / totalParticipants) * 100) : 0;
    
    // Calculate average response time (simulated)
    const responseTime = Math.round(Math.random() * 10 + 5);
    
    document.getElementById('engagementRate').textContent = `${engagementRate}%`;
    document.getElementById('participationRate').textContent = `${participationRate}%`;
    document.getElementById('responseTime').textContent = `${responseTime}s`;
    
    // Update charts (placeholder)
    document.getElementById('engagementChart').textContent = 'Engagement chart';
    document.getElementById('participationChart').textContent = 'Participation chart';
    document.getElementById('responseChart').textContent = 'Response time chart';
}

// Participants Functions
function renderParticipants() {
    const participantsList = document.getElementById('participantsList');
    if (!currentEvent || currentEvent.participants.length === 0) {
        participantsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>No participants yet</h3>
                <p>Share your event code to get participants</p>
            </div>
        `;
        return;
    }
    
    participantsList.innerHTML = currentEvent.participants.map(participant => `
        <div class="participant-item">
            <div class="participant-info-item">
                <div class="participant-avatar">
                    ${participant.name.charAt(0).toUpperCase()}
                </div>
                <div class="participant-details">
                    <h4>${participant.name}</h4>
                    <p>Joined ${new Date(participant.joinedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="participant-status ${participant.isOnline ? 'status-online' : 'status-offline'}">
                ${participant.isOnline ? 'Online' : 'Offline'}
            </div>
        </div>
    `).join('');
}

// Share Functions
function shareEvent() {
    if (!currentEvent) {
        showNotification('No event to share!', 'error');
        return;
    }
    
    // Update the share modal content
    document.getElementById('shareEventCode').textContent = `#${currentEvent.code}`;
    // Use slido.com style URL without the trailing slash
    document.getElementById('shareEventLink').value = `${window.location.origin}?join=${currentEvent.code}`;
    
    // Generate QR code for the event
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = ''; // Clear previous QR code
    
    try {
        console.log("Generating event QR code");
        
        // Check if QRious is available
        if (typeof QRious === 'undefined') {
            console.error("QRious library is not loaded!");
            qrContainer.innerHTML = '<div style="padding: 20px; color: red;">QR code library failed to load. Please refresh and try again.</div>';
            return;
        }
        
        // Create canvas for QR code
        const canvas = document.createElement('canvas');
        canvas.id = 'event-qr-canvas';
        qrContainer.appendChild(canvas);
        
        // Use slido.com style URL without the trailing slash
        const joinUrl = `${window.location.origin}?join=${currentEvent.code}`;
        console.log("QR code URL:", joinUrl);
        
        // Generate QR code using QRious library
        const qr = new QRious({
            element: canvas,
            value: joinUrl,
            size: 120,
            backgroundAlpha: 1,
            foreground: '#00D2AA',
            level: 'H' // High error correction
        });
        
        console.log("Event QR code generated successfully");
    } catch (error) {
        console.error("Error generating QR code:", error);
        qrContainer.innerHTML = '<div style="padding: 20px; color: red;">Failed to generate QR code: ' + error.message + '</div>';
    }
    
    // Show the modal
    showShareEventModal();
}

function copyEventCode() {
    const code = currentEvent.code;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Event code copied to clipboard!');
    });
}

function copyEventLink() {
    const link = document.getElementById('shareEventLink').value;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Event link copied to clipboard!');
    });
}

function downloadQR() {
    const canvas = document.getElementById('event-qr-canvas');
    if (!canvas) {
        showNotification('QR code not available!', 'error');
        return;
    }
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.download = `event-qr-code-${currentEvent.code}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('QR code downloaded successfully!');
}

// Template Functions
function importPollTemplate() {
    showNotification('Poll templates feature coming soon!', 'info');
}

function moderateQuestions() {
    showNotification('Question moderation feature coming soon!', 'info');
}

function exportAnalytics() {
    showNotification('Analytics export feature coming soon!', 'info');
}

function downloadParticipants() {
    showNotification('Participants download feature coming soon!', 'info');
}

/**
 * Auto-join an event with the provided code
 * @param {string} code - The event code to join
 * @param {string} name - Optional participant name (defaults to "Guest")
 */
function autoJoinEvent(code, name = "Guest") {
    console.log(`Auto-joining event with code: ${code}, name: ${name}`);
    
    // Check if the event exists
    code = code.replace('#', '');
    const event = events[code];
    if (!event) {
        showNotification('Event not found! Please check the code.', 'error');
        return false;
    }
    
    // Create participant
    const participantId = generateId();
    const participant = {
        id: participantId,
        name: name,
        joinedAt: new Date().toISOString(),
        isPresenter: false,
        isOnline: true
    };
    
    // Add to event
    event.participants.push(participant);
    participants[participantId] = participant;
    saveToStorage();
    
    // Set current context
    currentEvent = event;
    currentUser = participant;
    isPresenter = false;
    
    // Show dashboard
    showParticipantDashboard();
    showNotification(`Joined "${event.title || event.name}" successfully!`);
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize demo data
    initializeDemoData();
    
    // Check for auto-login
    const lastLoggedInUser = localStorage.getItem('lastLoggedInUser');
    if (lastLoggedInUser && users[lastLoggedInUser]) {
        currentUser = users[lastLoggedInUser];
        updateUIForLoggedInUser();
    }
    
    // Check for join parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
        console.log("Join code detected in URL:", joinCode);
        
        // For slido.com style experience, show quick join option
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            // Show quick join modal
            showQuickJoinModal(joinCode);
        } else {
            // Traditional join modal
            document.getElementById('eventCode').value = joinCode;
            showJoinModal();
        }
    }
    
    // Check for poll parameter in URL (for QR code scanning)
    const pollId = urlParams.get('poll');
    const eventCode = urlParams.get('event');
    if (pollId && eventCode) {
        console.log("Poll and event detected in URL:", pollId, eventCode);
        
        // Auto-join as guest if not already logged in
        if (!currentUser) {
            currentUser = {
                id: generateId(),
                name: 'Guest',
                email: '',
                isGuest: true
            };
        }
        
        // Show the mobile poll view
        showMobilePollView(pollId, eventCode);
    }
    
    // Initialize active events list
    renderActiveEvents();
    
    // Form event listeners
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        if (!agreeTerms) {
            showNotification('Please agree to the terms and conditions', 'error');
            return;
        }
        
        if (registerUser(fullName, email, password)) {
            closeModal('signupModal');
            this.reset();
        }
    });
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (loginUser(email, password)) {
            closeModal('loginModal');
            this.reset();
        }
    });
    
    // Handle form submissions for the join form
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
      joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const eventCode = document.getElementById('eventCode').value.trim().replace('#', '');
        const participantName = document.getElementById('participantName').value.trim();
        if (joinEvent(eventCode, participantName)) {
          window.closeModal('joinModal');
        }
      });
    }
    
    document.getElementById('createPollForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const question = document.getElementById('pollQuestion').value;
        const pollType = document.getElementById('pollType').value;
        const allowMultipleVotes = document.getElementById('allowMultipleVotes').checked;
        const hideResults = document.getElementById('hideResults').checked;
        const enableTimer = document.getElementById('enableTimer').checked;
        const timerDuration = parseInt(document.getElementById('timerDuration').value) || 30;
        const generateQR = document.getElementById('generateQR').checked;
        
        let options = [];
        if (pollType !== 'word-cloud') {
            const optionInputs = document.querySelectorAll('#pollOptions input');
            options = Array.from(optionInputs)
                .map(input => input.value.trim())
                .filter(option => option !== '');
            
            if (options.length < 2) {
                showNotification('Please provide at least 2 options!', 'error');
                return;
            }
        }
        
        createPoll(question, options, pollType, {
            allowMultipleVotes,
            hideResults,
            timer: {
                enabled: enableTimer,
                duration: timerDuration
            },
            generateQR
        });
        
        closeModal('createPollModal');
        this.reset();
        
        // Reset poll options to default
        document.getElementById('pollOptions').innerHTML = `
            <div class="option-input">
                <input type="text" placeholder="Option 1" required>
                <button type="button" class="btn-remove" onclick="removeOption(this)">×</button>
            </div>
            <div class="option-input">
                <input type="text" placeholder="Option 2" required>
                <button type="button" class="btn-remove" onclick="removeOption(this)">×</button>
            </div>
        `;
    });
    
    // Q&A Toggle
    document.getElementById('qaEnabled').addEventListener('change', function(e) {
        if (currentEvent) {
            currentEvent.qaEnabled = e.target.checked;
            saveToStorage();
            renderQuestions();
            showNotification(e.target.checked ? 'Q&A enabled' : 'Q&A disabled');
        }
    });

    // Event creation modal listeners
    document.getElementById('createEventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleCreateEvent();
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Auto-refresh for real-time updates
setInterval(() => {
    // Check if we're in mobile poll view
    const mobilePollView = document.getElementById('mobilePollView');
    const isMobileView = mobilePollView && mobilePollView.style.display !== 'none';
    
    if (isMobileView) {
        // Get the current poll ID from the timer element
        const timerElement = document.getElementById('mobilePollTimer');
        if (timerElement) {
            const pollId = timerElement.getAttribute('data-poll-id');
            if (pollId) {
                const poll = findPollById(pollId);
                if (poll && !poll.isActive) {
                    // If poll is no longer active, show results
                    showMobilePollResults(pollId);
                }
            }
        }
    } else if (currentEvent && !isPresenter) {
        // Refresh current event data for participants
        const updatedEvent = events[currentEvent.code];
        if (updatedEvent) {
            currentEvent = updatedEvent;
            renderParticipantPolls();
            renderParticipantQuestions();
        }
    } else if (currentEvent && isPresenter) {
        // Refresh presenter view
        const updatedEvent = events[currentEvent.code];
        if (updatedEvent) {
            currentEvent = updatedEvent;
            updateDashboardBadges();
            renderPolls();
            renderQuestions();
            renderParticipants();
            updateAnalytics();
        }
    }
    
    // Refresh active events list on home page
    if (document.getElementById('activeEventsList')) {
        renderActiveEvents();
    }
}, 3000);

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Initialize demo data for showcase
function initializeDemoData() {
    // Create a demo event for showcase
    const demoEventCode = 'DEMO01';
    const demoEvent = {
        id: 'demo-event-1',
        code: demoEventCode,
        title: 'Marketing Team Meeting',
        description: 'Weekly team sync and planning session',
        createdBy: 'demo-user',
        createdAt: new Date().toISOString(),
        polls: [
            {
                id: 'demo-poll-1',
                question: 'What should be our main focus for Q4?',
                type: 'multiple-choice',
                options: [
                    { id: 'opt-1', text: 'Product development', votes: 45, voters: [] },
                    { id: 'opt-2', text: 'Customer acquisition', votes: 35, voters: [] },
                    { id: 'opt-3', text: 'Market expansion', votes: 20, voters: [] }
                ],
                isActive: true,
                createdAt: new Date().toISOString(),
                settings: {
                    allowMultipleVotes: false,
                    hideResults: false
                }
            }
        ],
        questions: [
            {
                id: 'demo-q-1',
                text: 'How do we measure success for the new product launch?',
                author: 'Sarah Johnson',
                authorId: 'user-1',
                votes: 12,
                voters: [],
                isAnswered: true,
                answer: 'We will track user adoption rates, revenue growth, and customer satisfaction scores.',
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo-q-2',
                text: 'What is our budget allocation for marketing campaigns?',
                author: 'Mike Chen',
                authorId: 'user-2',
                votes: 8,
                voters: [],
                isAnswered: false,
                answer: '',
                createdAt: new Date().toISOString()
            }
        ],
        quizzes: [],
        wordClouds: [],
        participants: [
            {
                id: 'demo-participant-1',
                name: 'Sarah Johnson',
                joinedAt: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 'demo-participant-2',
                name: 'Mike Chen',
                joinedAt: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 'demo-participant-3',
                name: 'Emily Rodriguez',
                joinedAt: new Date().toISOString(),
                isOnline: false
            }
        ],
        qaEnabled: true,
        isActive: true
    };
    
    if (!events[demoEventCode]) {
        events[demoEventCode] = demoEvent;
        saveToStorage();
    }
}

// Poll Timer Functions
function startPollTimer(pollId) {
    const poll = currentEvent.polls.find(p => p.id === pollId);
    if (!poll || !poll.settings.timer.enabled) return;
    
    // Set up timer interval
    const timerId = setInterval(() => {
        updatePollTimer(pollId);
    }, 1000);
    
    // Store timer ID for cleanup
    poll.settings.timer.timerId = timerId;
    saveToStorage();
}

function updatePollTimer(pollId) {
    const poll = findPollById(pollId);
    if (!poll || !poll.settings?.timer?.enabled) return;
    
    const now = new Date();
    const endTime = new Date(poll.settings.timer.endTime);
    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    
    // Update timer display for all users
    const timerElements = document.querySelectorAll(`.poll-timer[data-poll-id="${pollId}"]`);
    timerElements.forEach(el => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // Check if this is the mobile timer which has a different structure
        const valueSpan = el.querySelector('#mobilePollTimerValue');
        if (valueSpan) {
            valueSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            el.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    });
    
    // If timer has ended
    if (timeLeft <= 0) {
        clearInterval(poll.settings.timer.timerId);
        endPoll(pollId);
    }
}

function endPoll(pollId) {
    const poll = currentEvent.polls.find(p => p.id === pollId);
    if (!poll) return;
    
    poll.isActive = false;
    saveToStorage();
    
    // Show results to everyone
    showPollResults(pollId);
    
    // Update UI
    renderPolls();
    renderParticipantPolls();
    
    showNotification(`Poll "${poll.question}" has ended`);
}

// QR Code Functions
function showPollQRCode(pollId) {
    const poll = currentEvent.polls.find(p => p.id === pollId);
    if (!poll || !currentEvent) return;
    
    // Generate a unique poll URL that will open the mobile view when scanned
    const eventCode = currentEvent.code;
    // Use slido.com style URL without the trailing slash
    const pollUrl = `${window.location.origin}?poll=${pollId}&event=${eventCode}`;
    document.getElementById('pollQRUrl').textContent = pollUrl;
    
    // Generate QR code using QRious library
    const qrContainer = document.getElementById('pollQRCode');
    qrContainer.innerHTML = ''; // Clear previous QR code
    
    try {
        console.log("Generating QR code for URL:", pollUrl);
        
        // Create canvas for QR code
        const canvas = document.createElement('canvas');
        canvas.id = 'qr-canvas';
        qrContainer.appendChild(canvas);
        
        // Check if QRious is available
        if (typeof QRious === 'undefined') {
            console.error("QRious library is not loaded!");
            qrContainer.innerHTML = '<div style="padding: 20px; color: red;">QR code library failed to load. Please refresh and try again.</div>';
            return;
        }
        
        // Generate QR code
        const qr = new QRious({
            element: canvas,
            value: pollUrl,
            size: 160,
            backgroundAlpha: 1,
            foreground: '#00D2AA',
            level: 'H' // High error correction
        });
        
        console.log("QR code generated successfully");
    } catch (error) {
        console.error("Error generating QR code:", error);
        qrContainer.innerHTML = '<div style="padding: 20px; color: red;">Failed to generate QR code: ' + error.message + '</div>';
    }
    
    // Show the QR code modal
    showModal('pollQRModal');
}

function downloadPollQR() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) {
        showNotification('QR code not available!', 'error');
        return;
    }
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.download = `poll-qr-code-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('QR code downloaded successfully!');
}

function showPollResults(pollId) {
    const poll = currentEvent.polls.find(p => p.id === pollId);
    if (!poll) return;
    
    // Set up the results modal
    document.getElementById('resultPollQuestion').textContent = poll.question;
    
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    document.getElementById('resultPollTotal').textContent = `Total votes: ${totalVotes}`;
    
    // Generate the results HTML
    const resultsContainer = document.getElementById('resultPollOptions');
    resultsContainer.innerHTML = poll.options.map(option => {
        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        return `
            <div class="poll-result-option">
                <div class="poll-result-label">${option.text}</div>
                <div class="poll-result-bar-container">
                    <div class="poll-result-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="poll-result-value">
                    ${percentage}%
                    <div class="poll-result-count">${option.votes} votes</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Show the results modal
    showModal('pollResultsModal');
}

function downloadPollResults() {
    // In a real implementation, you would generate and download the results
    showNotification('Results download feature coming soon!', 'info');
}

function toggleTimerSettings() {
    const timerEnabled = document.getElementById('enableTimer').checked;
    document.getElementById('timerDurationContainer').style.display = timerEnabled ? 'block' : 'none';
}

// Mobile Poll Functions
function showMobilePollView(pollId, eventCode) {
    const poll = findPollById(pollId);
    const event = findEventByCode(eventCode);
    
    if (!poll || !event) {
        showNotification('Poll or event not found!', 'error');
        return;
    }
    
    // Set event and poll information
    document.getElementById('mobilePollEventTitle').textContent = event.name;
    document.getElementById('mobilePollEventCode').textContent = `#${event.code}`;
    document.getElementById('mobilePollQuestion').textContent = poll.question;
    
    // Set mobile user name
    document.getElementById('mobileUserName').textContent = currentUser?.name || 'Anonymous';
    
    // Generate poll options
    const optionsContainer = document.getElementById('mobilePollOptions');
    optionsContainer.innerHTML = '';
    
    poll.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'mobile-poll-option';
        optionDiv.innerHTML = `
            <input type="radio" id="mobile-option-${option.id}" name="mobile-poll-option" value="${option.id}">
            <label for="mobile-option-${option.id}">${option.text}</label>
        `;
        optionsContainer.appendChild(optionDiv);
        
        // Add click handler for the entire div
        optionDiv.addEventListener('click', function() {
            // Find the radio button and select it
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Remove selected class from all options
            document.querySelectorAll('.mobile-poll-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to this option
            this.classList.add('selected');
        });
    });
    
    // Set up timer if enabled
    const timerContainer = document.getElementById('mobilePollTimerContainer');
    const timerElement = document.getElementById('mobilePollTimer');
    
    if (poll.settings?.timer?.enabled && poll.isActive) {
        timerContainer.style.display = 'block';
        timerElement.setAttribute('data-poll-id', poll.id);
        
        const now = new Date();
        const endTime = new Date(poll.settings.timer.endTime);
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        document.getElementById('mobilePollTimerValue').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        timerContainer.style.display = 'none';
    }
    
    // Set up form submission
    document.getElementById('mobilePollVoteForm').onsubmit = function(e) {
        e.preventDefault();
        
        const selectedOption = document.querySelector('input[name="mobile-poll-option"]:checked');
        if (!selectedOption) {
            showNotification('Please select an option!', 'error');
            return;
        }
        
        // Submit vote
        votePoll(poll.id, selectedOption.value);
        
        // Show results
        showMobilePollResults(poll.id);
    };
    
    // Hide all other views and show mobile poll view
    hideAllViews();
    document.getElementById('mobilePollView').style.display = 'block';
}

function showMobilePollResults(pollId) {
    const poll = findPollById(pollId);
    if (!poll) return;
    
    // Hide voting form
    document.getElementById('mobilePollVoteForm').style.display = 'none';
    
    // Calculate results
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    
    // Generate results HTML
    const resultsContainer = document.getElementById('mobileResultOptions');
    resultsContainer.innerHTML = poll.options.map(option => {
        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        return `
            <div class="poll-result-option">
                <div class="poll-result-label">${option.text}</div>
                <div class="poll-result-bar-container">
                    <div class="poll-result-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="poll-result-value">
                    ${percentage}%
                    <div class="poll-result-count">${option.votes} votes</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Set total votes
    document.getElementById('mobileResultTotal').textContent = `Total votes: ${totalVotes}`;
    
    // Show results container
    document.getElementById('mobilePollResults').style.display = 'block';
}

// Helper functions
function findPollById(pollId) {
    // Search through all events for the poll
    for (const eventCode in events) {
        const event = events[eventCode];
        const poll = event.polls.find(p => p.id === pollId);
        if (poll) return poll;
    }
    return null;
}

function findEventByCode(eventCode) {
    return events[eventCode] || null;
}

// Active Events Functions
function refreshActiveEvents() {
    renderActiveEvents();
    showNotification('Active events refreshed!');
}

// Fix renderActiveEvents function to show proper event names
function renderActiveEvents() {
    const container = document.getElementById('activeEventsList');
    if (!container) return;
    
    // Get all active events
    const activeEvents = [];
    for (const eventCode in events) {
        const event = events[eventCode];
        if (event.isActive && event.polls.some(poll => poll.isActive)) {
            activeEvents.push(event);
        }
    }
    
    if (activeEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No active events</h3>
                <p>Create your own event or join an existing one</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeEvents.map(event => {
        const activePolls = event.polls.filter(poll => poll.isActive).length;
        return `
            <div class="active-event-item">
                <div class="active-event-info">
                    <div class="active-event-title">${event.title || event.name || 'Untitled Event'}</div>
                    <div class="active-event-meta">
                        <span class="active-event-code">#${event.code}</span> • 
                        ${activePolls} active poll${activePolls !== 1 ? 's' : ''}
                    </div>
                </div>
                <div class="active-event-actions">
                    <button class="btn-secondary btn-sm" onclick="closeEvent('${event.code}')">Close</button>
                    <button class="active-event-join" onclick="joinEvent('${event.code}', 'Guest')">Join</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterQuestions(filterType) {
    // Update active filter button
    document.querySelectorAll('.qa-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterType) {
            btn.classList.add('active');
        }
    });
    
    if (!currentEvent || !currentEvent.questions) return;
    
    // Filter questions based on type
    let filteredQuestions = [];
    
    switch (filterType) {
        case 'popular':
            // Sort by votes (descending)
            filteredQuestions = [...currentEvent.questions].sort((a, b) => b.votes - a.votes);
            break;
        case 'answered':
            filteredQuestions = currentEvent.questions.filter(q => q.isAnswered);
            break;
        case 'my':
            filteredQuestions = currentEvent.questions.filter(q => q.authorId === currentUser.id);
            break;
        case 'all':
        default:
            // Sort by newest first
            filteredQuestions = [...currentEvent.questions].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
    }
    
    // Render the filtered questions
    renderFilteredQuestions(filteredQuestions);
}

function renderFilteredQuestions(questions) {
    const questionsList = document.getElementById('participantQAList');
    if (!questionsList) return;
    
    if (questions.length === 0) {
        questionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❓</div>
                <h3>No questions yet</h3>
                <p>Be the first to ask a question</p>
            </div>
        `;
        return;
    }
    
    questionsList.innerHTML = questions.map(question => {
        const hasVoted = question.voters.includes(currentUser.id);
        return `
            <div class="question-card">
                <p>${question.text}</p>
                <div class="question-meta">
                    <span>${question.author} • ${formatTimeAgo(question.createdAt)}</span>
                    <div class="question-votes">
                        <button class="vote-btn ${hasVoted ? 'voted' : ''}" onclick="voteQuestion('${question.id}')">
                            <span class="vote-icon">▲</span>
                            <span class="vote-count">${question.votes}</span>
                        </button>
                    </div>
                </div>
                ${question.isAnswered ? `
                    <div class="question-answer">
                        <div class="answer-label">Answer:</div>
                        <div class="answer-text">${question.answer}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    return `${Math.floor(months / 12)}y ago`;
}

// Implement showEventHistory function
function showEventHistory() {
    // Create a container for the event history modal
    const modalId = 'eventHistoryModal';
    
    // Create the modal if it doesn't exist
    if (!document.getElementById(modalId)) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Event History</h2>
                    <button class="modal-close" onclick="closeModal('${modalId}')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="event-history-filters">
                        <button class="btn-secondary active" onclick="filterEventHistory('all')">All Events</button>
                        <button class="btn-secondary" onclick="filterEventHistory('active')">Active</button>
                        <button class="btn-secondary" onclick="filterEventHistory('past')">Past</button>
                        <button class="btn-secondary" onclick="filterEventHistory('upcoming')">Upcoming</button>
                    </div>
                    <div class="event-history-list" id="eventHistoryList">
                        <!-- Events will be listed here -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show the modal and render the event history
    showModal(modalId);
    renderEventHistory('all');
}

// Implement renderEventHistory function
function renderEventHistory(filter = 'all') {
    const container = document.getElementById('eventHistoryList');
    if (!container) return;
    
    // Update active filter button
    document.querySelectorAll('.event-history-filters .btn-secondary').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.event-history-filters .btn-secondary[onclick="filterEventHistory('${filter}')"]`).classList.add('active');
    
    const now = new Date();
    let filteredEvents = [];
    
    // Get all events
    const allEvents = Object.values(events);
    
    // Filter events based on the selected filter
    switch (filter) {
        case 'active':
            filteredEvents = allEvents.filter(event => {
                const hasActivePolls = event.polls.some(poll => poll.isActive);
                return event.isActive && hasActivePolls;
            });
            break;
        case 'past':
            filteredEvents = allEvents.filter(event => {
                return !event.isActive || new Date(event.endDate) < now;
            });
            break;
        case 'upcoming':
            filteredEvents = allEvents.filter(event => {
                const startDate = new Date(event.startDate);
                return event.isActive && startDate > now;
            });
            break;
        case 'all':
        default:
            filteredEvents = allEvents;
            break;
    }
    
    // Sort events by date (newest first)
    filteredEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filteredEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No events found</h3>
                <p>No events match the selected filter</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredEvents.map(event => {
        const totalPolls = event.polls.length;
        const activePolls = event.polls.filter(poll => poll.isActive).length;
        const totalQuestions = event.questions.length;
        const isEventActive = event.isActive && activePolls > 0;
        
        return `
            <div class="event-history-item">
                <div class="event-history-info">
                    <div class="event-history-title">${event.title || event.name || 'Untitled Event'}</div>
                    <div class="event-history-meta">
                        <span class="event-history-code">#${event.code}</span> • 
                        Created ${formatTimeAgo(event.createdAt)}
                    </div>
                    <div class="event-history-stats">
                        <span>${totalPolls} poll${totalPolls !== 1 ? 's' : ''}</span> • 
                        <span>${totalQuestions} question${totalQuestions !== 1 ? 's' : ''}</span> • 
                        <span>${event.participants.length} participant${event.participants.length !== 1 ? 's' : ''}</span>
                        <span class="event-status ${event.isActive ? 'active' : 'closed'}">${event.isActive ? 'Active' : 'Closed'}</span>
                    </div>
                </div>
                <div class="event-history-actions">
                    ${isEventActive ? 
                        `<button class="btn-primary" onclick="joinEvent('${event.code}', 'Guest')">Join</button>` : 
                        `<button class="btn-secondary" onclick="viewEventDetails('${event.code}')">View</button>`
                    }
                    ${event.isActive ? 
                        `<button class="btn-outline" onclick="closeEvent('${event.code}')">Close</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Implement filterEventHistory function
function filterEventHistory(filter) {
    renderEventHistory(filter);
}

// Implement viewEventDetails function
function viewEventDetails(eventCode) {
    const event = events[eventCode];
    if (!event) {
        showNotification('Event not found!', 'error');
        return;
    }
    
    currentEvent = event;
    isPresenter = event.createdBy === currentUser?.id;
    
    if (isPresenter) {
        showPresenterDashboard();
    } else {
        // Ask for name if not already a participant
        const existingParticipant = event.participants.find(p => p.id === currentUser?.id);
        if (existingParticipant) {
            currentUser = existingParticipant;
            showParticipantDashboard();
        } else {
            showJoinModal();
            document.getElementById('eventCode').value = eventCode;
        }
    }
    
    closeModal('eventHistoryModal');
}

// Implement word cloud functionality
function showCreateWordCloudModal() {
    // Create the modal if it doesn't exist
    const modalId = 'createWordCloudModal';
    
    if (!document.getElementById(modalId)) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Create Word Cloud</h2>
                    <button class="modal-close" onclick="closeModal('${modalId}')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="createWordCloudForm" onsubmit="event.preventDefault(); createWordCloud();">
                        <div class="form-group">
                            <label>Question</label>
                            <input type="text" id="wordCloudQuestion" placeholder="What's your question?" required>
                        </div>
                        <div class="form-group">
                            <label>Maximum words per participant</label>
                            <input type="number" id="wordCloudMaxWords" min="1" max="10" value="3">
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="wordCloudTimer" onchange="toggleWordCloudTimer()">
                                <span class="checkmark"></span>
                                Enable timer
                            </label>
                        </div>
                        <div class="form-group" id="wordCloudTimerSettings" style="display: none;">
                            <label>Duration (seconds)</label>
                            <input type="number" id="wordCloudTimerDuration" min="10" max="300" value="60">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('${modalId}')">Cancel</button>
                            <button type="submit" class="btn-primary">Create word cloud</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showModal(modalId);
}

// Toggle word cloud timer settings
function toggleWordCloudTimer() {
    const timerEnabled = document.getElementById('wordCloudTimer').checked;
    document.getElementById('wordCloudTimerSettings').style.display = timerEnabled ? 'block' : 'none';
}

// Create word cloud
function createWordCloud() {
    if (!currentEvent) {
        showNotification('No active event!', 'error');
        return;
    }
    
    const question = document.getElementById('wordCloudQuestion').value;
    const maxWords = parseInt(document.getElementById('wordCloudMaxWords').value);
    const timerEnabled = document.getElementById('wordCloudTimer').checked;
    const timerDuration = parseInt(document.getElementById('wordCloudTimerDuration').value);
    
    const wordCloudId = generateId();
    const wordCloud = {
        id: wordCloudId,
        question,
        words: [],
        participants: {},
        isActive: true,
        createdAt: new Date().toISOString(),
        settings: {
            maxWordsPerParticipant: maxWords,
            timer: {
                enabled: timerEnabled,
                duration: timerDuration,
                endTime: timerEnabled ? new Date(Date.now() + timerDuration * 1000).toISOString() : null
            }
        }
    };
    
    // Initialize word clouds array if it doesn't exist
    currentEvent.wordClouds = currentEvent.wordClouds || [];
    currentEvent.wordClouds.push(wordCloud);
    saveToStorage();
    
    closeModal('createWordCloudModal');
    renderWordClouds();
    
    // Start timer if enabled
    if (timerEnabled) {
        startWordCloudTimer(wordCloudId);
    }
    
    showNotification('Word cloud created successfully!');
}

// Render word clouds
function renderWordClouds() {
    const container = document.getElementById('wordCloudList');
    if (!container || !currentEvent) return;
    
    if (!currentEvent.wordClouds || currentEvent.wordClouds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">☁️</div>
                <h3>No word clouds yet</h3>
                <p>Create your first word cloud to visualize audience responses</p>
                <button class="btn-primary" onclick="showCreateWordCloudModal()">Create word cloud</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentEvent.wordClouds.map(wordCloud => {
        const totalWords = wordCloud.words.length;
        const uniqueWords = [...new Set(wordCloud.words.map(w => w.text))].length;
        const participantCount = Object.keys(wordCloud.participants).length;
        
        return `
            <div class="word-cloud-card">
                <div class="word-cloud-header">
                    <h4>${wordCloud.question}</h4>
                    <div class="word-cloud-status ${wordCloud.isActive ? 'active' : 'ended'}">
                        ${wordCloud.isActive ? 'Active' : 'Ended'}
                    </div>
                </div>
                <div class="word-cloud-stats">
                    <span>${uniqueWords} unique words</span> • 
                    <span>${totalWords} total submissions</span> • 
                    <span>${participantCount} participants</span>
                </div>
                ${wordCloud.isActive && wordCloud.settings.timer.enabled ? `
                    <div class="word-cloud-timer" data-id="${wordCloud.id}">
                        Time remaining: <span class="timer-value">calculating...</span>
                    </div>
                ` : ''}
                <div class="word-cloud-actions">
                    ${wordCloud.isActive ? `
                        <button class="btn-secondary" onclick="toggleWordCloud('${wordCloud.id}')">End</button>
                        <button class="btn-primary" onclick="showWordCloudResults('${wordCloud.id}')">View live</button>
                    ` : `
                        <button class="btn-primary" onclick="showWordCloudResults('${wordCloud.id}')">View results</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
    
    // Update timers
    currentEvent.wordClouds.forEach(wordCloud => {
        if (wordCloud.isActive && wordCloud.settings.timer.enabled) {
            updateWordCloudTimer(wordCloud.id);
        }
    });
}

// Start word cloud timer
function startWordCloudTimer(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud || !wordCloud.settings.timer.enabled) return;
    
    // Set up timer interval
    const timerId = setInterval(() => {
        updateWordCloudTimer(wordCloudId);
    }, 1000);
    
    // Store timer ID for cleanup
    wordCloud.settings.timer.timerId = timerId;
    saveToStorage();
}

// Update word cloud timer
function updateWordCloudTimer(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud || !wordCloud.settings?.timer?.enabled) return;
    
    const now = new Date();
    const endTime = new Date(wordCloud.settings.timer.endTime);
    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    
    // Update timer display
    const timerElements = document.querySelectorAll(`.word-cloud-timer[data-id="${wordCloudId}"] .timer-value`);
    timerElements.forEach(el => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        el.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });
    
    // If timer has ended
    if (timeLeft <= 0) {
        clearInterval(wordCloud.settings.timer.timerId);
        endWordCloud(wordCloudId);
    }
}

// End word cloud
function endWordCloud(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud) return;
    
    wordCloud.isActive = false;
    saveToStorage();
    
    // Update UI
    renderWordClouds();
    renderParticipantWordClouds();
    
    showNotification(`Word cloud "${wordCloud.question}" has ended`);
}

// Toggle word cloud active state
function toggleWordCloud(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud) return;
    
    if (wordCloud.isActive) {
        endWordCloud(wordCloudId);
    } else {
        wordCloud.isActive = true;
        saveToStorage();
        renderWordClouds();
        renderParticipantWordClouds();
        showNotification(`Word cloud "${wordCloud.question}" is now active`);
    }
}

// Show word cloud results
function showWordCloudResults(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud) return;
    
    // Create the modal if it doesn't exist
    const modalId = 'wordCloudResultsModal';
    
    if (!document.getElementById(modalId)) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Word Cloud Results</h2>
                    <button class="modal-close" onclick="closeModal('${modalId}')">&times;</button>
                </div>
                <div class="modal-body">
                    <h3 id="wordCloudResultsQuestion"></h3>
                    <div class="word-cloud-visualization" id="wordCloudVisualization"></div>
                    <div class="word-cloud-results-stats" id="wordCloudResultsStats"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show the modal and render the word cloud
    showModal(modalId);
    document.getElementById('wordCloudResultsQuestion').textContent = wordCloud.question;
    
    // Generate word cloud stats
    const totalWords = wordCloud.words.length;
    const uniqueWords = [...new Set(wordCloud.words.map(w => w.text))].length;
    const participantCount = Object.keys(wordCloud.participants).length;
    
    document.getElementById('wordCloudResultsStats').innerHTML = `
        <div class="results-stats">
            <div class="stat">
                <div class="stat-value">${uniqueWords}</div>
                <div class="stat-label">Unique Words</div>
            </div>
            <div class="stat">
                <div class="stat-value">${totalWords}</div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat">
                <div class="stat-value">${participantCount}</div>
                <div class="stat-label">Participants</div>
            </div>
        </div>
    `;
    
    // Generate word cloud visualization
    generateWordCloudVisualization(wordCloud);
}

// Generate word cloud visualization
function generateWordCloudVisualization(wordCloud) {
    const container = document.getElementById('wordCloudVisualization');
    if (!container) return;
    
    // Count word frequencies
    const wordFrequency = {};
    wordCloud.words.forEach(word => {
        const text = word.text.toLowerCase();
        wordFrequency[text] = (wordFrequency[text] || 0) + 1;
    });
    
    // Sort words by frequency
    const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([text, count]) => ({ text, count }));
    
    // Generate HTML for the word cloud
    if (sortedWords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">☁️</div>
                <h3>No words submitted yet</h3>
                <p>Wait for participants to submit their words</p>
            </div>
        `;
        return;
    }
    
    // Find the maximum frequency for scaling
    const maxCount = Math.max(...sortedWords.map(w => w.count));
    
    // Generate the word cloud HTML
    container.innerHTML = `<div class="word-cloud-container">
        ${sortedWords.map(word => {
            const size = 1 + (word.count / maxCount) * 2; // Scale from 1x to 3x
            const fontSize = 16 * size;
            const opacity = 0.5 + (word.count / maxCount) * 0.5; // Scale from 0.5 to 1
            
            return `<span class="word-cloud-word" style="font-size: ${fontSize}px; opacity: ${opacity};">
                ${word.text}
            </span>`;
        }).join(' ')}
    </div>`;
}

// Render participant word clouds
function renderParticipantWordClouds() {
    const container = document.getElementById('participantWordCloudList');
    if (!container || !currentEvent) return;
    
    // Find active word clouds
    const activeWordClouds = currentEvent.wordClouds?.filter(wc => wc.isActive) || [];
    
    if (activeWordClouds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">☁️</div>
                <h3>No active word cloud</h3>
                <p>Wait for the presenter to start a word cloud</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeWordClouds.map(wordCloud => {
        const participantId = currentUser.id;
        const submittedWords = wordCloud.participants[participantId]?.words || [];
        const maxWords = wordCloud.settings.maxWordsPerParticipant;
        const wordsLeft = maxWords - submittedWords.length;
        
        return `
            <div class="participant-word-cloud">
                <h3>${wordCloud.question}</h3>
                ${wordCloud.settings.timer.enabled ? `
                    <div class="word-cloud-timer" data-id="${wordCloud.id}">
                        Time remaining: <span class="timer-value">calculating...</span>
                    </div>
                ` : ''}
                <div class="word-cloud-input">
                    <p>Enter up to ${maxWords} words or phrases (${wordsLeft} left)</p>
                    <div class="word-input-container">
                        <input type="text" id="wordInput-${wordCloud.id}" placeholder="Type a word or phrase" 
                            ${wordsLeft <= 0 ? 'disabled' : ''}>
                        <button class="btn-primary" onclick="submitWord('${wordCloud.id}')"
                            ${wordsLeft <= 0 ? 'disabled' : ''}>Submit</button>
                    </div>
                </div>
                ${submittedWords.length > 0 ? `
                    <div class="submitted-words">
                        <h4>Your submissions:</h4>
                        <div class="word-tags">
                            ${submittedWords.map(word => `
                                <span class="word-tag">
                                    ${word}
                                    <button class="word-tag-remove" onclick="removeWord('${wordCloud.id}', '${word}')">×</button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="word-cloud-preview">
                    <h4>Live Preview:</h4>
                    <div class="word-cloud-container" id="wordCloudPreview-${wordCloud.id}"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Update timers and previews
    activeWordClouds.forEach(wordCloud => {
        if (wordCloud.settings.timer.enabled) {
            updateWordCloudTimer(wordCloud.id);
        }
        updateWordCloudPreview(wordCloud.id);
    });
}

// Submit word to word cloud
function submitWord(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud || !wordCloud.isActive) {
        showNotification('Word cloud is no longer active', 'error');
        return;
    }
    
    const inputElement = document.getElementById(`wordInput-${wordCloudId}`);
    const word = inputElement.value.trim();
    
    if (!word) {
        showNotification('Please enter a word or phrase', 'error');
        return;
    }
    
    const participantId = currentUser.id;
    
    // Initialize participant's words if needed
    wordCloud.participants[participantId] = wordCloud.participants[participantId] || { words: [] };
    
    // Check if max words reached
    if (wordCloud.participants[participantId].words.length >= wordCloud.settings.maxWordsPerParticipant) {
        showNotification('You have reached the maximum number of words', 'error');
        return;
    }
    
    // Add word
    wordCloud.participants[participantId].words.push(word);
    wordCloud.words.push({
        text: word,
        participantId: participantId,
        submittedAt: new Date().toISOString()
    });
    
    saveToStorage();
    inputElement.value = '';
    
    // Update UI
    renderParticipantWordClouds();
    showNotification('Word submitted successfully!');
}

// Remove word from word cloud
function removeWord(wordCloudId, wordText) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud || !wordCloud.isActive) {
        showNotification('Word cloud is no longer active', 'error');
        return;
    }
    
    const participantId = currentUser.id;
    
    // Remove from participant's words
    if (wordCloud.participants[participantId]) {
        wordCloud.participants[participantId].words = wordCloud.participants[participantId].words.filter(w => w !== wordText);
    }
    
    // Remove from word cloud words
    wordCloud.words = wordCloud.words.filter(w => !(w.participantId === participantId && w.text === wordText));
    
    saveToStorage();
    
    // Update UI
    renderParticipantWordClouds();
    showNotification('Word removed successfully!');
}

// Update word cloud preview
function updateWordCloudPreview(wordCloudId) {
    const wordCloud = currentEvent.wordClouds.find(wc => wc.id === wordCloudId);
    if (!wordCloud) return;
    
    const container = document.getElementById(`wordCloudPreview-${wordCloudId}`);
    if (!container) return;
    
    // Count word frequencies
    const wordFrequency = {};
    wordCloud.words.forEach(word => {
        const text = word.text.toLowerCase();
        wordFrequency[text] = (wordFrequency[text] || 0) + 1;
    });
    
    // Sort words by frequency
    const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30) // Limit to top 30 words
        .map(([text, count]) => ({ text, count }));
    
    // Generate HTML for the word cloud preview
    if (sortedWords.length === 0) {
        container.innerHTML = `<p class="no-words">No words submitted yet</p>`;
        return;
    }
    
    // Find the maximum frequency for scaling
    const maxCount = Math.max(...sortedWords.map(w => w.count));
    
    // Generate the word cloud HTML
    container.innerHTML = sortedWords.map(word => {
        const size = 0.8 + (word.count / maxCount) * 1.2; // Scale from 0.8x to 2x
        const fontSize = 14 * size;
        const opacity = 0.6 + (word.count / maxCount) * 0.4; // Scale from 0.6 to 1
        
        return `<span class="word-cloud-word" style="font-size: ${fontSize}px; opacity: ${opacity};">
            ${word.text}
        </span>`;
    }).join(' ');
}

// Add closeEvent function to allow closing events
function closeEvent(eventCode) {
    const event = events[eventCode];
    if (!event) {
        showNotification('Event not found!', 'error');
        return;
    }
    
    // Ask for confirmation
    if (!confirm(`Are you sure you want to close the event "${event.title || event.name || 'Untitled Event'}"? This will end all active polls and word clouds.`)) {
        return;
    }
    
    // End all active polls
    event.polls.forEach(poll => {
        if (poll.isActive) {
            poll.isActive = false;
            if (poll.settings?.timer?.timerId) {
                clearInterval(poll.settings.timer.timerId);
            }
        }
    });
    
    // End all active word clouds
    if (event.wordClouds) {
        event.wordClouds.forEach(wordCloud => {
            if (wordCloud.isActive) {
                wordCloud.isActive = false;
                if (wordCloud.settings?.timer?.timerId) {
                    clearInterval(wordCloud.settings.timer.timerId);
                }
            }
        });
    }
    
    // Mark event as inactive
    event.isActive = false;
    
    saveToStorage();
    
    // If this is the current event, go back to home
    if (currentEvent && currentEvent.code === eventCode) {
        goHome();
    }
    
    showNotification(`Event "${event.title || event.name || 'Untitled Event'}" has been closed.`);
    
    // Refresh active events list if on home page
    if (document.getElementById('activeEventsList')) {
        renderActiveEvents();
    }
}

function showQuickJoinModal(eventCode) {
    // Set the event code in the modal
    document.getElementById('quickJoinEventCode').textContent = eventCode;
    
    // Setup form submission
    const quickJoinForm = document.getElementById('quickJoinForm');
    if (quickJoinForm) {
        quickJoinForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('quickJoinName').value.trim() || 'Guest';
            if (autoJoinEvent(eventCode, name)) {
                closeModal('quickJoinModal');
            }
        };
    }
    
    showModal('quickJoinModal');
}