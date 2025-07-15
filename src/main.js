import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminLogin from './AdminLogin.js';
import UserLogin from './UserLogin.js';
import UserSignup from './UserSignup.js';
// Don't import app.js here, it's loaded directly in HTML

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Create containers for React components
  setupLoginComponent();
  setupSignupComponent();
  
  // Add event listeners to the navigation buttons
  setupNavigationHandlers();
  
  // Restore original modal functions to window
  restoreWindowFunctions();
});

function setupLoginComponent() {
  // Create a container for the login component
  const loginContainer = document.createElement('div');
  loginContainer.id = 'react-login-container';
  
  // Get the login modal and replace its form
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    const loginForm = loginModal.querySelector('#loginForm');
    if (loginForm) {
      loginForm.style.display = 'none';
      loginForm.parentNode.insertBefore(loginContainer, loginForm);
      
      // Render the React component
      const root = createRoot(loginContainer);
      root.render(
        <UserLogin onLogin={() => {
          // Close the modal after successful login
          window.closeModal('loginModal');
          // Update UI for logged in user
          if (window.updateUIForLoggedInUser) {
            window.updateUIForLoggedInUser();
          }
        }} />
      );
    }
  }
}

function setupSignupComponent() {
  // Create a container for the signup component
  const signupContainer = document.createElement('div');
  signupContainer.id = 'react-signup-container';
  
  // Get the signup modal and replace its form
  const signupModal = document.getElementById('signupModal');
  if (signupModal) {
    const signupForm = signupModal.querySelector('#signupForm');
    if (signupForm) {
      signupForm.style.display = 'none';
      signupForm.parentNode.insertBefore(signupContainer, signupForm);
      
      // Render the React component
      const root = createRoot(signupContainer);
      root.render(
        <UserSignup onSignup={() => {
          // Close the modal after successful signup
          window.closeModal('signupModal');
        }} />
      );
    }
  }
}

function setupNavigationHandlers() {
  // Find the login and signup buttons in the navigation
  const loginButtons = document.querySelectorAll('[onclick="showLoginModal()"]');
  const signupButtons = document.querySelectorAll('[onclick="showSignupModal()"]');
}

function restoreWindowFunctions() {
  // Restore all the original window functions
  
  // Modal functions
  if (!window.showModal) {
    window.showModal = function(modalId) {
      document.getElementById(modalId).style.display = 'block';
      document.body.style.overflow = 'hidden';
    };
  }
  
  if (!window.closeModal) {
    window.closeModal = function(modalId) {
      document.getElementById(modalId).style.display = 'none';
      document.body.style.overflow = 'auto';
    };
  }
  
  // Specific modal functions
  if (!window.showLoginModal) {
    window.showLoginModal = function() {
      window.showModal('loginModal');
    };
  }
  
  if (!window.showSignupModal) {
    window.showSignupModal = function() {
      window.showModal('signupModal');
    };
  }
  
  if (!window.showJoinModal) {
    window.showJoinModal = function() {
      window.showModal('joinModal');
    };
  }

  // Initialize the application events from the original code
  window.addEventListener('load', function() {
    if (window.initializeDemoData) {
      window.initializeDemoData();
    }
    
    // Check URL for join parameter
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      document.getElementById('eventCode').value = joinCode;
      window.showJoinModal();
    }
    
    // Handle form submissions for the join form
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
      joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const eventCode = document.getElementById('eventCode').value.trim().replace('#', '');
        const participantName = document.getElementById('participantName').value.trim();
        if (window.joinEvent && window.joinEvent(eventCode, participantName)) {
          window.closeModal('joinModal');
        }
      });
    }
  });
} 