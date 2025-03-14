// API Configuration
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeBtns = document.querySelectorAll('.close');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const requestForm = document.getElementById('requestForm');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const donorsList = document.getElementById('donorsList');
const donorSearchForm = document.getElementById('donorSearchForm');

// Sample data for donors (in a real application, this would come from a backend)
let donors = [
    {
        id: 1,
        name: 'Rajesh Patel',
        bloodType: 'A+',
        location: 'India',
        availability: 'Weekends',
        lastDonation: '2024-01-15'
    },
    {
        id: 2,
        name: 'steve Smith',
        bloodType: 'O-',
        location: 'Australia',
        availability: 'After 5 PM',
        lastDonation: '2024-02-01'
    }
];

// Modal Functions
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Event Listeners for Modals
loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(signupModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === signupModal) closeModal(signupModal);
});

// Mobile Navigation
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Form Validation
function validateForm(formData) {
    const errors = [];
    
    for (const [key, value] of formData.entries()) {
        if (!value) {
            errors.push(`${key} is required`);
        }
        
        if (key === 'email' && !isValidEmail(value)) {
            errors.push('Please enter a valid email address');
        }
        
        if (key === 'phone' && !isValidPhone(value)) {
            errors.push('Please enter a valid phone number');
        }
        
        if (key === 'password' && value.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
    }
    
    return errors;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

// Authentication Functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage('Login successful!', 'success');
            window.location.href = 'dashboard.html';
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Error logging in', 'error');
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            showMessage('Registration successful!', 'success');
            window.location.href = 'index.html';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Error registering user', 'error');
    }
}   

// Blood Request Functions
async function createBloodRequest(requestData) {
    try {
        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Blood request created successfully!', 'success');
            requestForm.reset();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Error creating blood request', 'error');
    }
}

// Donor Search Functions
async function searchDonors(bloodType, location) {
    try {
        let url = `${API_URL}/donors`;
        if (bloodType) {
            url = `${API_URL}/donors/blood-type/${bloodType}`;
        } else if (location) {
            url = `${API_URL}/donors/location/${location}`;
        }

        const response = await fetch(url);
        const donors = await response.json();
        
        displayDonors(donors);
    } catch (error) {
        showMessage('Error searching donors', 'error');
    }
}

// UI Functions
function displayDonors(donors) {
    const donorsGrid = document.querySelector('.donors-grid');
    if (!donorsGrid) return;

    donorsGrid.innerHTML = donors.map(donor => `
        <div class="donor-card">
            <img src="https://via.placeholder.com/150" alt="Donor" class="donor-image">
            <h3>${donor.fullName}</h3>
            <p>Blood Type: ${donor.bloodType}</p>
            <p>Location: ${donor.location}</p>
            <p>Last Donation: ${donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}</p>
        </div>
    `).join('');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await login(email, password);
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            fullName: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value,
            bloodType: document.getElementById('signupBloodType').value,
            location: document.getElementById('signupLocation').value,
            phoneNumber: document.getElementById('signupPhone').value
        };
        await register(userData);
    });
}

if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const requestData = {
            bloodType: document.getElementById('requestBloodType').value,
            urgency: document.getElementById('urgency').value,
            location: document.getElementById('requestLocation').value,
            message: document.getElementById('requestMessage').value
        };
        await createBloodRequest(requestData);
    });
}

if (donorSearchForm) {
    donorSearchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bloodType = document.getElementById('searchBloodType').value;
        const location = document.getElementById('searchLocation').value;
        await searchDonors(bloodType, location);
    });
}

// Check authentication status
function checkAuth() {
    const currentPage = window.location.pathname;
    const publicPages = ['/login.html', '/signup.html', '/index.html'];
    const isPublicPage = publicPages.some(page => currentPage.includes(page));
    
    if (!token && !isPublicPage) {
        window.location.href = 'login.html';
    } else if (token && isPublicPage && !currentPage.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Update navigation based on auth status
function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    
    if (token && user) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const userName = userMenu.querySelector('.user-name');
            if (userName) userName.textContent = user.fullName;
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Run auth check and update navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavigation();
});

// Initialize donors list
function updateDonorsList() {
    displayDonors(donors);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateDonorsList();
});

// Donation Process Steps
document.addEventListener('DOMContentLoaded', function() {
    const processSteps = document.querySelectorAll('.process-step');
    let currentStep = 0;

    // Function to update active step
    function updateActiveStep() {
        processSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Add click event to steps
    processSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            currentStep = index;
            updateActiveStep();
        });
    });

    // Eligibility Checker
    const eligibilityQuestions = document.querySelectorAll('.eligibility-questions .question');
    const eligibilityResult = document.querySelector('.eligibility-result');
    let answers = new Array(eligibilityQuestions.length).fill(null);

    // Function to check eligibility
    function checkEligibility() {
        const allAnswered = answers.every(answer => answer !== null);
        if (!allAnswered) return;

        const isEligible = answers.every(answer => answer === 'yes');
        eligibilityResult.textContent = isEligible 
            ? 'You are eligible to donate blood! Please proceed with registration.'
            : 'Based on your answers, you may not be eligible to donate at this time. Please consult with our medical staff for more information.';
        
        eligibilityResult.className = `eligibility-result ${isEligible ? 'eligible' : 'not-eligible'}`;
    }

    // Add click events to option buttons
    eligibilityQuestions.forEach((question, questionIndex) => {
        const options = question.querySelectorAll('.option-btn');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options in this question
                options.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
                // Store answer
                answers[questionIndex] = option.dataset.value;
                // Check eligibility
                checkEligibility();
            });
        });
    });
});

// Time and Frequency Selection
document.addEventListener('DOMContentLoaded', function() {
    // Time selection
    const timeOptions = document.querySelectorAll('.time-option');
    const timeInput = document.getElementById('donationTime');

    timeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            timeOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            // Update hidden input
            timeInput.value = this.dataset.time;
        });
    });

    // Frequency selection
    const frequencyOptions = document.querySelectorAll('.frequency-option');
    const frequencyInput = document.getElementById('donationFrequency');

    frequencyOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            frequencyOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            // Update hidden input
            frequencyInput.value = this.dataset.frequency;
        });
    });

    // Form validation
    const donorForm = document.getElementById('donorForm');
    if (donorForm) {
        donorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if time and frequency are selected
            if (!timeInput.value || !frequencyInput.value) {
                alert('Please select both preferred donation time and frequency.');
                return;
            }

            // Here you would typically send the form data to your server
            console.log('Form submitted successfully!');
            alert('Thank you for registering as a blood donor!');
            this.reset();
            
            // Reset selected states
            timeOptions.forEach(opt => opt.classList.remove('selected'));
            frequencyOptions.forEach(opt => opt.classList.remove('selected'));
        });
    }
}); 

