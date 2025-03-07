// API Constants
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const WEATHER_API_KEY = "2257389ddfcc95c4bba0408d5eb71b46"; // Replace with your actual API key

// Weather Update
async function updateWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const response = await fetch(
            `${WEATHER_API_URL}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();

        document.getElementById('weather-info').innerHTML = `
            <p><i class="fas fa-temperature-high"></i> ${Math.round(data.main.temp)}°C</p>
            <p><i class="fas fa-tint"></i> ${data.main.humidity}% Humidity</p>
            <p><i class="fas fa-wind"></i> ${data.wind.speed} m/s</p>
        `;
    } catch (error) {
        console.error('Weather fetch failed:', error);
    }
}

// Static Data
const seasonalTips = [
    "Rotate crops to maintain soil health",
    "Use companion planting to deter pests",
    "Start composting kitchen waste",
    "Plant cover crops in winter",
    "Save seeds from your best plants"
];

const organicFacts = [
    "Organic farming reduces groundwater pollution",
    "Organic soils capture more carbon",
    "Organic farms support 50% more wildlife",
    "No synthetic pesticides used",
    "Better for soil microorganisms"
];

const cropCalendar = {
    Spring: ["Tomatoes", "Peppers", "Lettuce"],
    Summer: ["Corn", "Cucumbers", "Beans"],
    Fall: ["Pumpkins", "Carrots", "Kale"],
    Winter: ["Garlic", "Cover Crops", "Planning"]
};

// Utility Functions
function updateSection(elementId, items, iconClass) {
    const sectionHTML = items
        .map(item => `<p><i class="${iconClass}"></i> ${item}</p>`)
        .join('');
    document.getElementById(elementId).innerHTML = sectionHTML;
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
}

function updateCropCalendar() {
    const season = getCurrentSeason();
    const cropsHTML = `
        <p><strong>Current Season: ${season}</strong></p>
        <p>Recommended Crops:</p>
        ${cropCalendar[season]
            .map(crop => `<p><i class="fas fa-seedling"></i> ${crop}</p>`)
            .join('')}
    `;
    document.getElementById('crop-calendar').innerHTML = cropsHTML;
}

// Community Post Management
class PostManager {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('posts')) || [];
    }

    addPost(content, imageData = null) {
        const post = {
            id: Date.now(),
            content,
            imageData,
            likes: 0,
            comments: [],
            timestamp: new Date().toISOString(),
            isLiked: false
        };
        this.posts.unshift(post);
        this.savePosts();
        return post;
    }

    toggleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            this.savePosts();
        }
        return post;
    }

    addComment(postId, comment) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.comments.push({
                id: Date.now(),
                text: comment,
                timestamp: new Date().toISOString()
            });
            this.savePosts();
        }
        return post;
    }

    savePosts() {
        localStorage.setItem('posts', JSON.stringify(this.posts));
    }

    getAllPosts() {
        return this.posts;
    }
}

class UI {
    constructor(postManager) {
        this.postManager = postManager;
        this.postsContainer = document.getElementById('posts-container');
        this.modal = document.getElementById('post-modal');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('create-post-btn').addEventListener('click', () => this.openModal());
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('submit-post').addEventListener('click', () => this.handlePostSubmit());
        document.getElementById('post-image').addEventListener('change', e => this.handleImagePreview(e));
    }

    openModal() {
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.getElementById('post-content').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('post-image').value = '';
    }

    handleImagePreview(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                document.getElementById('image-preview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    async handlePostSubmit() {
        const content = document.getElementById('post-content').value.trim();
        if (!content) return;

        const imageInput = document.getElementById('post-image');
        const imageData = imageInput.files[0] ? await this.getBase64(imageInput.files[0]) : null;

        const post = this.postManager.addPost(content, imageData);
        this.addPostToDOM(post);
        this.closeModal();
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    addPostToDOM(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = this.createPostHTML(post);
        this.postsContainer.prepend(postElement);
        this.setupPostInteractions(postElement, post);
    }

    createPostHTML(post) {
        return `
            <div class="post-content">${post.content}</div>
            ${post.imageData ? `<img src="${post.imageData}" alt="Post image" class="post-image">` : ''}
            <div class="post-actions">
                <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i>
                    <span class="likes-count">${post.likes}</span> Likes
                </button>
                <button class="action-btn comment-btn" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    <span class="comments-count">${post.comments.length}</span> Comments
                </button>
            </div>
            <div class="comments-section" style="display: none;">
                <div class="comments-list">${this.renderComments(post.comments)}</div>
                <div class="comment-input">
                    <input type="text" placeholder="Add a comment..." class="comment-text">
                    <button class="submit-comment" data-post-id="${post.id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderComments(comments) {
        return comments.map(comment => `
            <div class="comment">
                <p>${comment.text}</p>
                <small>${new Date(comment.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
    }

    setupPostInteractions(postElement, post) {
        postElement.querySelector('.like-btn').addEventListener('click', () => {
            const updatedPost = this.postManager.toggleLike(post.id);
            postElement.querySelector('.like-btn').classList.toggle('liked');
            postElement.querySelector('.likes-count').textContent = updatedPost.likes;
        });

        postElement.querySelector('.comment-btn').addEventListener('click', () => {
            const commentsSection = postElement.querySelector('.comments-section');
            commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
        });

        postElement.querySelector('.submit-comment').addEventListener('click', () => {
            const commentText = postElement.querySelector('.comment-text').value.trim();
            if (commentText) {
                const updatedPost = this.postManager.addComment(post.id, commentText);
                postElement.querySelector('.comments-list').innerHTML = this.renderComments(updatedPost.comments);
                postElement.querySelector('.comments-count').textContent = updatedPost.comments.length;
                postElement.querySelector('.comment-text').value = '';
            }
        });
    }

    renderAllPosts() {
        this.postsContainer.innerHTML = '';
        this.postManager.getAllPosts().forEach(post => this.addPostToDOM(post));
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const postManager = new PostManager();
    const ui = new UI(postManager);

    updateWeather();
    updateSection('seasonal-tips', seasonalTips, 'fas fa-check');
    updateSection('organic-facts', organicFacts, 'fas fa-leaf');
    updateCropCalendar();
    ui.renderAllPosts();
});
