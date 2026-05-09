document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generator-form');
    const imageInput = document.getElementById('image-input');
    const fileNameSpan = document.getElementById('file-name');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('image-preview-container');
    const generateBtn = document.getElementById('generate-btn');
    const btnLoader = document.getElementById('btn-loader');
    const outputSection = document.getElementById('output-section');
    const errorBox = document.getElementById('error-message');

    // Display elements
    const outCaption = document.getElementById('out-caption');
    const outAltCaption = document.getElementById('out-alt-caption');
    const outPost = document.getElementById('out-post');
    const outHashtags = document.getElementById('out-hashtags');

    // Handle File Selection Preview
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Validation
        if (!imageInput.files[0]) {
            showError("Please upload an image first.");
            return;
        }

        // 2. Loading State
        setLoading(true);
        hideError();
        outputSection.classList.add('hidden');

        // 3. Prepare Data
        const formData = new FormData(form);

        // Ensure checkboxes are explicitly handled if needed 
        // (default HTML behavior: only sends if checked)
        if (!formData.has('emoji_option')) formData.append('emoji_option', 'No');
        if (!formData.has('hashtag_option')) formData.append('hashtag_option', 'No');

        try {
            // 4. Fetch Response from Backend
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate content.");
            }

            // 5. Display Results
            displayResults(data);

        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    // Helper functions
    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnLoader.classList.remove('hidden');
            generateBtn.querySelector('.btn-text').textContent = "Analyzing Image...";
        } else {
            generateBtn.disabled = false;
            btnLoader.classList.add('hidden');
            generateBtn.querySelector('.btn-text').textContent = "Generate Content";
        }
    }

    function displayResults(data) {
        outCaption.textContent = data.caption || "N/A";
        outAltCaption.textContent = data.alternative_caption || "N/A";
        outPost.textContent = data.post || "N/A";

        // Clear and add hashtags
        outHashtags.innerHTML = '';
        if (data.hashtags && Array.isArray(data.hashtags)) {
            data.hashtags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'hashtag';
                span.textContent = tag.startsWith('#') ? tag : `#${tag}`;
                outHashtags.appendChild(span);
            });
        }

        outputSection.classList.remove('hidden');
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(msg) {
        errorBox.innerHTML = `<strong>Error:</strong> ${msg}`;
        errorBox.classList.remove('hidden');
        errorBox.scrollIntoView({ behavior: 'smooth' });
    }

    function hideError() {
        errorBox.classList.add('hidden');
    }

    // Copy to Clipboard Functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const element = document.getElementById(targetId);
            let textToCopy = '';

            if (targetId === 'out-hashtags') {
                textToCopy = Array.from(element.querySelectorAll('.hashtag'))
                    .map(s => s.textContent).join(' ');
            } else {
                textToCopy = element.textContent;
            }

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.textContent;
                btn.textContent = "Copied!";
                btn.style.borderColor = "#10b981";
                btn.style.color = "#10b981";

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.borderColor = "#e2e8f0";
                    btn.style.color = "";
                }, 2000);
            });
        });
    });

});
