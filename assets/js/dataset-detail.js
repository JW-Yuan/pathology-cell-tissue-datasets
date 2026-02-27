// 数据集详情页 - 站点根目录
const DATASETS_BASE_PATH = 'datasets/';
const DATASETS_LIST_PATH = DATASETS_BASE_PATH + '_datasets.json';

function getDatasetIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

async function loadDatasetBasicInfo(datasetId) {
    const response = await fetch(DATASETS_LIST_PATH);
    if (!response.ok) throw new Error('无法加载数据集列表');
    const list = await response.json();
    if (!Array.isArray(list)) throw new Error('_datasets.json 格式错误');
    const dataset = list.find(ds => ds.id === datasetId);
    if (!dataset) throw new Error('未找到数据集: ' + datasetId);
    return dataset;
}

async function loadMarkdownFile(datasetId) {
    try {
        const res = await fetch(DATASETS_BASE_PATH + datasetId + '.md');
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('无法加载 Markdown');
        return await res.text();
    } catch (e) {
        return null;
    }
}

function processMarkdownImages(markdown, datasetId) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    return markdown.replace(imageRegex, function (match, alt, src) {
        if (/^https?:\/\//.test(src) || /^\/\//.test(src) || src.startsWith('/')) return match;
        return '![' + alt + '](' + DATASETS_BASE_PATH + datasetId + '/img/' + src + ')';
    });
}

function renderBasicInfo(dataset) {
    const basicInfoDiv = document.getElementById('basic-info');
    const items = [];

    if (dataset.year) items.push({ label: '年份', value: dataset.year, icon: 'fas fa-calendar' });
    if (dataset.organs) items.push({ label: '器官类型', value: dataset.organs, icon: 'fas fa-lungs' });
    if (dataset.staining) items.push({ label: '染色类型', value: dataset.staining, icon: 'fas fa-palette' });
    if (dataset.task) {
        const taskVal = Array.isArray(dataset.task) ? dataset.task.join(', ') : dataset.task;
        items.push({ label: '任务类型', value: taskVal, icon: 'fas fa-tasks' });
    }
    if (dataset.size) items.push({ label: '数据集大小', value: dataset.size, icon: 'fas fa-hdd' });
    if (dataset.data) items.push({ label: '数据格式', value: dataset.data, icon: 'fas fa-file' });
    if (dataset.type) items.push({ label: '数据类型', value: dataset.type, icon: 'fas fa-image' });
    if (dataset.other) items.push({ label: '其他信息', value: dataset.other, icon: 'fas fa-info-circle' });

    if (items.length > 0) {
        basicInfoDiv.innerHTML =
            '<div class="info-grid">' +
            items.map(function (item) {
                return '<div class="info-item"><div class="info-label"><i class="' + item.icon + '"></i> ' + item.label + '</div><div class="info-value">' + item.value + '</div></div>';
            }).join('') +
            '</div>';
    } else {
        basicInfoDiv.innerHTML = '<p>暂无基本信息</p>';
    }
}

function renderMarkdown(markdownText, datasetId) {
    const markdownDiv = document.getElementById('markdown-content');
    if (!markdownText || !markdownText.trim()) {
        markdownDiv.innerHTML = '<p class="no-content">暂无详细信息</p>';
        return;
    }
    const processed = processMarkdownImages(markdownText, datasetId);
    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true, sanitize: false });
        markdownDiv.innerHTML = marked.parse(processed);
    } else {
        const div = document.createElement('div');
        div.textContent = markdownText;
        markdownDiv.innerHTML = '<pre class="markdown-raw">' + div.innerHTML + '</pre>';
    }
}

async function loadAndRenderDatasetDetail() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('detail-content');
    const datasetId = getDatasetIdFromURL();

    if (!datasetId) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = '未指定数据集 ID';
        return;
    }

    try {
        if (window.location.protocol === 'file:') {
            throw new Error('请使用本地服务器或 GitHub Pages 访问');
        }

        const basicInfo = await loadDatasetBasicInfo(datasetId);
        const markdownText = await loadMarkdownFile(datasetId);

        document.getElementById('dataset-name').textContent = basicInfo.name;
        document.getElementById('dataset-year').textContent = basicInfo.year ? '(' + basicInfo.year + ')' : '';

        const metaHeader = document.getElementById('dataset-meta-header');
        const metaTags = [];
        if (basicInfo.organs) metaTags.push('<span class="meta-badge"><i class="fas fa-lungs"></i> ' + basicInfo.organs + '</span>');
        if (basicInfo.staining) metaTags.push('<span class="meta-badge"><i class="fas fa-palette"></i> ' + basicInfo.staining + '</span>');
        if (basicInfo.task) {
            const t = Array.isArray(basicInfo.task) ? basicInfo.task.join(', ') : basicInfo.task;
            metaTags.push('<span class="meta-badge"><i class="fas fa-tasks"></i> ' + t + '</span>');
        }
        if (basicInfo.type) metaTags.push('<span class="meta-badge"><i class="fas fa-image"></i> ' + basicInfo.type + '</span>');
        metaHeader.innerHTML = metaTags.join('');

        renderBasicInfo(basicInfo);
        renderMarkdown(markdownText, datasetId);

        document.title = basicInfo.name + ' - 数据集详情 | Pathology Datasets';

        loading.style.display = 'none';
        error.style.display = 'none';
        content.style.display = 'block';
    } catch (e) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = '加载失败: ' + e.message;
    }
}

window.addEventListener('DOMContentLoaded', loadAndRenderDatasetDetail);
