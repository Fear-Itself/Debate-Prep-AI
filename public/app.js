async function analyzeDebate() {
    const topic = document.getElementById('topic').value;
    const question = document.getElementById('question').value;
    const side = document.getElementById('side').value;
    const loading = document.querySelector('.loading');
    const response = document.getElementById('response');

    if (!topic || !question) {
        alert('Please fill in both topic and question fields.');
        return;
    }

    loading.style.display = 'block';
    response.textContent = '';

    try {
        const res = await fetch('/.netlify/functions/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                question,
                side
            }),
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        
        if (data.success) {
            response.innerHTML = formatResponse(data.response);
        } else {
            response.innerHTML = `<div class="error">Error: ${data.error}</div>`;
        }
    } catch (error) {
        response.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
        loading.style.display = 'none';
    }
}

function formatResponse(text) {
    return text
        .replace(/Argument:/g, '<strong class="section-header">Argument:</strong>')
        .replace(/Reasoning:/g, '<strong class="section-header">Reasoning:</strong>')
        .replace(/Evidence:/g, '<strong class="section-header">Evidence:</strong>')
        .replace(/Impact:/g, '<strong class="section-header">Impact:</strong>')
        .split('\n').join('<br>');
}

// Add keyboard shortcut (Ctrl/Cmd + Enter) to submit
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        analyzeDebate();
    }
});
