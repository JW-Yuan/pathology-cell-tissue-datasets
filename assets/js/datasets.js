// 数据集列表页 - 根据当前页面路径动态计算 JSON 地址，兼容 Live Server 任意根目录
(function () {
    var path = window.location.pathname || '';
    var base = path.replace(/\/[^/]*$/, '/');
    if (!base.endsWith('/')) base += '/';
    window.DATASETS_BASE_PATH = base + 'datasets/';
    window.DATASETS_INDEX_PATH = window.DATASETS_BASE_PATH + '_datasets.json';
})();

let allDatasets = [];
let filteredDatasets = [];

/**
 * 将原始器官类型规范为合并后的选项：同类合并（如 Colon/Colorectal/Colon 转移性结肠癌 -> Colon），
 * 所有 multiple 变体统一为 Multiple。
 */
function normalizeOrgan(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var s = raw.trim();
    if (!s) return '';
    var lower = s.toLowerCase();
    if (/multiple|multiple organ/.test(lower)) return 'Multiple';
    if (/colon|colorectal/.test(lower)) return 'Colon';
    if (/lymph node/.test(lower)) return 'Lymph node';
    if (/breast/.test(lower)) return 'Breast';
    if (/skin/.test(lower)) return 'Skin';
    if (/lung/.test(lower)) return 'Lung';
    if (/liver/.test(lower)) return 'Liver';
    if (/brain/.test(lower)) return 'Brain';
    if (/prostate/.test(lower)) return 'Prostate';
    if (/melanoma/.test(lower)) return 'Melanoma';
    if (/blood/.test(lower)) return 'Blood';
    if (/lymphocyte/.test(lower)) return 'Lymphocyte';
    if (/kidney/.test(lower)) return 'Kidney';
    if (/pancreas/.test(lower)) return 'Pancreas';
    if (/adrenal/.test(lower)) return 'Adrenal';
    if (/stomach/.test(lower)) return 'Stomach';
    if (/thyroid/.test(lower)) return 'Thyroid';
    if (/bladder/.test(lower)) return 'Bladder';
    if (/ovarian|ovary/.test(lower)) return 'Ovary';
    if (/uterus/.test(lower)) return 'Uterus';
    if (/testis|testes/.test(lower)) return 'Testis';
    if (/cervix/.test(lower)) return 'Cervix';
    if (/esophagus/.test(lower)) return 'Esophagus';
    if (/bile-duct/.test(lower)) return 'Bile-duct';
    if (/headneck/.test(lower)) return 'Head & neck';
    if (/larynx/.test(lower)) return 'Larynx';
    if (/pleura/.test(lower)) return 'Pleura';
    if (/thymus/.test(lower)) return 'Thymus';
    if (/mediastinum/.test(lower)) return 'Mediastinum';
    // 其余保持首字母大写的首词（如 "skin" -> "Skin"）
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/\s+.*$/, '').trim() || s;
}

/**
 * 将原始染色类型规范为合并后的选项：同类合并，Multiple(IHC,H&E)、multiple (most H&E) 等统一为 Multiple。
 * 具体染色种类细节可在各数据集对应的 .md 详情页中查看。
 */
function normalizeStaining(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var s = raw.trim();
    if (!s) return '';
    var lower = s.toLowerCase();
    if (/multiple|多种|模态/.test(lower)) return 'Multiple';
    if (/^h\s*&\s*e$/i.test(s) || (lower.indexOf('h&e') !== -1 && !/multiple|ihc|giemsa/.test(lower))) return 'H&E';
    if (/ihc/i.test(lower) && lower.indexOf('multiple') === -1) return 'IHC';
    if (/jenner-giemsa|giemsa/i.test(lower)) return 'Jenner-Giemsa';
    if (lower.indexOf('h&e') !== -1) return 'H&E';
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/\s+.*$/, '').trim() || s;
}

/** 结构类型：仅 Cell、Tissue。若 JSON 有 structure 字段则用其值，否则根据描述/任务推断。 */
function inferStructureCanonical(dataset) {
    if (dataset.structure && Array.isArray(dataset.structure) && dataset.structure.length > 0) {
        return dataset.structure.map(function (s) {
            return String(s).toLowerCase() === 'cell' ? 'Cell' : 'Tissue';
        });
    }
    var text = [dataset.description, dataset.size, dataset.data, dataset.type].filter(Boolean).join(' ').toLowerCase();
    var tasks = dataset.tasks || [];
    var hasCell = /nuclei|nucleus|cell/.test(text) || tasks.indexOf('detection') !== -1 || tasks.indexOf('seg') !== -1;
    var hasTissue = /tissue|gland|wsi|segment/.test(text) || tasks.indexOf('classi') !== -1 || tasks.indexOf('registration') !== -1;
    if (hasCell && hasTissue) return ['Cell', 'Tissue'];
    if (hasCell) return ['Cell'];
    if (hasTissue) return ['Tissue'];
    return ['Cell', 'Tissue'];
}

/** 任务类型规范为：Detection, Segmentation, Classification, Registration，其余归为 Other。 */
var TASK_CANONICAL_ORDER = ['Detection', 'Segmentation', 'Classification', 'Registration', 'Other'];

function normalizeTask(raw) {
    if (!raw || typeof raw !== 'string') return 'Other';
    var s = raw.trim().toLowerCase();
    if (!s) return 'Other';
    if (/^seg$|segmentation|分割/.test(s)) return 'Segmentation';
    if (/^classi$|classification|分类/.test(s)) return 'Classification';
    if (/^detection$|cell detection|检测/.test(s)) return 'Detection';
    if (/^registration$|配准/.test(s)) return 'Registration';
    return 'Other';
}

function parseTasks(task) {
    if (!task) return [];
    if (Array.isArray(task)) {
        return task.map(t => String(t).trim().toLowerCase()).filter(t => t.length > 0);
    }
    if (typeof task === 'string') {
        return task.split(/[+,\|]/).map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    }
    return [];
}

function fetchWithTimeout(url, timeoutMs) {
    timeoutMs = timeoutMs || 15000;
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
        controller.abort();
    }, timeoutMs);
    return fetch(url, { signal: controller.signal }).then(
        function (r) {
            clearTimeout(timeoutId);
            return r;
        },
        function (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error('加载超时（' + (timeoutMs / 1000) + ' 秒）。请确认用 Live Server 打开的是本仓库内的 index.html，且 datasets/_datasets.json 存在。');
            }
            throw err;
        }
    );
}

async function loadDatasetsList() {
    var url = window.DATASETS_INDEX_PATH || 'datasets/_datasets.json';
    var response = await fetchWithTimeout(url);
    if (!response.ok) {
        throw new Error('无法加载数据: ' + response.status + ' ' + response.statusText + '，请求地址: ' + url);
    }
    const list = await response.json();
    if (!Array.isArray(list)) {
        throw new Error('_datasets.json 格式错误：应为数组');
    }
    return list.map(dataset => {
        if (!dataset.id) return null;
        dataset.tasks = parseTasks(dataset.task);
        if (Array.isArray(dataset.task)) {
            dataset.task = dataset.task.join(' + ');
        }
        return dataset;
    }).filter(ds => ds !== null);
}

async function loadAllDatasets() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const container = document.getElementById('datasets-table-container');

    if (window.location.protocol === 'file:') {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = '请通过本地服务器或 GitHub Pages 访问，直接打开 file:// 无法加载数据。';
        return;
    }

    loading.style.display = 'block';
    error.style.display = 'none';
    container.style.display = 'none';

    try {
        allDatasets = await loadDatasetsList();
        if (allDatasets.length === 0) throw new Error('没有加载到任何数据集');

        allDatasets.forEach(function (d) {
            d.organsCanonical = normalizeOrgan(d.organs);
            d.stainingCanonical = normalizeStaining(d.staining);
            d.structureCanonical = inferStructureCanonical(d);
            var canon = [];
            if (d.tasks && d.tasks.length) {
                d.tasks.forEach(function (t) {
                    var c = normalizeTask(t);
                    if (canon.indexOf(c) === -1) canon.push(c);
                });
            }
            d.tasksCanonical = canon;
        });
        allDatasets.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'zh-CN'));
        initializeFilters();

        loading.style.display = 'none';
        error.style.display = 'none';
        container.style.display = 'block';
        applyFilters();
    } catch (e) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.querySelector('.error-text').textContent = '加载失败: ' + e.message;
    }
}

function initializeFilters() {
    const organsSet = new Set();
    const stainingSet = new Set();
    const structureSet = new Set();
    const taskSet = new Set();
    const yearSet = new Set();

    allDatasets.forEach(dataset => {
        if (dataset.organsCanonical) organsSet.add(dataset.organsCanonical);
        if (dataset.stainingCanonical) stainingSet.add(dataset.stainingCanonical);
        if (dataset.structureCanonical && dataset.structureCanonical.length > 0) {
            dataset.structureCanonical.forEach(function (c) { structureSet.add(c); });
        }
        if (dataset.tasksCanonical && dataset.tasksCanonical.length > 0) {
            dataset.tasksCanonical.forEach(function (c) { taskSet.add(c); });
        }
        if (dataset.year) yearSet.add(dataset.year);
    });

    var organOpts = Array.from(organsSet).sort(function (a, b) {
        if (a === 'Multiple') return 1;
        if (b === 'Multiple') return -1;
        return a.localeCompare(b, 'zh-CN');
    });
    populateSelect('filter-organs', organOpts);
    var stainingOpts = Array.from(stainingSet).sort(function (a, b) {
        if (a === 'Multiple') return 1;
        if (b === 'Multiple') return -1;
        return (a || '').localeCompare(b || '', 'zh-CN');
    });
    populateSelect('filter-staining', stainingOpts);
    var structureOpts = ['Cell', 'Tissue'].filter(function (s) { return structureSet.has(s); });
    if (structureOpts.length === 0) structureOpts = ['Cell', 'Tissue'];
    initializeStructureFilter(structureOpts);
    populateSelect('filter-year', Array.from(yearSet).sort().reverse());
    var taskOpts = Array.from(taskSet).sort(function (a, b) {
        var i = TASK_CANONICAL_ORDER.indexOf(a);
        var j = TASK_CANONICAL_ORDER.indexOf(b);
        if (i !== -1 && j !== -1) return i - j;
        if (i !== -1) return -1;
        if (j !== -1) return 1;
        return (a || '').localeCompare(b || '', 'zh-CN');
    });
    initializeTaskFilter(taskOpts);
}

function initializeStructureFilter(options) {
    var container = document.getElementById('filter-structure-container');
    var toggle = document.getElementById('filter-structure-toggle');
    var selectedEl = document.getElementById('filter-structure-selected');
    if (!container || !toggle) return;
    container.innerHTML = '';
    options.forEach(function (opt) {
        var item = document.createElement('div');
        item.className = 'task-checkbox-item';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'structure-' + opt;
        checkbox.value = opt;
        checkbox.addEventListener('change', function () {
            updateStructureFilterDisplay();
            applyFilters();
        });
        var label = document.createElement('label');
        label.htmlFor = 'structure-' + opt;
        label.textContent = opt;
        item.appendChild(checkbox);
        item.appendChild(label);
        container.appendChild(item);
    });
    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isActive = toggle.classList.contains('active');
        toggle.classList.toggle('active', !isActive);
        container.classList.toggle('show', !isActive);
    });
    document.addEventListener('click', function (e) {
        if (!toggle.contains(e.target) && !container.contains(e.target)) {
            toggle.classList.remove('active');
            container.classList.remove('show');
        }
    });
    updateStructureFilterDisplay();
}

function updateStructureFilterDisplay() {
    var selected = Array.from(document.querySelectorAll('#filter-structure-container input[type="checkbox"]:checked')).map(function (cb) { return cb.value; });
    var el = document.getElementById('filter-structure-selected');
    if (el) el.textContent = selected.length === 0 ? '全部' : selected.length === 1 ? selected[0] : '已选择 ' + selected.length + ' 项';
}

function initializeTaskFilter(tasks) {
    const container = document.getElementById('filter-task-container');
    const toggle = document.getElementById('filter-task-toggle');
    container.innerHTML = '';

    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-checkbox-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'task-' + task;
        checkbox.value = task;
        checkbox.addEventListener('change', () => {
            updateTaskFilterDisplay();
            applyFilters();
        });
        const label = document.createElement('label');
        label.htmlFor = 'task-' + task;
        label.textContent = task;
        item.appendChild(checkbox);
        item.appendChild(label);
        container.appendChild(item);
    });

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const isActive = toggle.classList.contains('active');
        toggle.classList.toggle('active', !isActive);
        container.classList.toggle('show', !isActive);
    });
    document.addEventListener('click', function (e) {
        if (!toggle.contains(e.target) && !container.contains(e.target)) {
            toggle.classList.remove('active');
            container.classList.remove('show');
        }
    });
    updateTaskFilterDisplay();
}

function updateTaskFilterDisplay() {
    const selected = Array.from(document.querySelectorAll('#filter-task-container input[type="checkbox"]:checked')).map(cb => cb.value);
    const el = document.getElementById('filter-task-selected');
    el.textContent = selected.length === 0 ? '全部' : selected.length === 1 ? selected[0] : '已选择 ' + selected.length + ' 项';
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const first = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (first) select.appendChild(first);
    options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        select.appendChild(o);
    });
}

function applyFilters() {
    const organsFilter = document.getElementById('filter-organs').value;
    const stainingFilter = document.getElementById('filter-staining').value;
    const yearFilter = document.getElementById('filter-year').value;
    const searchName = document.getElementById('search-name').value.toLowerCase().trim();
    const selectedStructure = Array.from(document.querySelectorAll('#filter-structure-container input[type="checkbox"]:checked')).map(function (cb) { return cb.value; });
    const selectedTasks = Array.from(document.querySelectorAll('#filter-task-container input[type="checkbox"]:checked')).map(cb => cb.value);

    filteredDatasets = allDatasets.filter(dataset => {
        if (organsFilter && dataset.organsCanonical !== organsFilter) return false;
        if (stainingFilter && dataset.stainingCanonical !== stainingFilter) return false;
        if (selectedStructure.length > 0) {
            var sc = dataset.structureCanonical || [];
            if (!selectedStructure.every(function (s) { return sc.indexOf(s) !== -1; })) return false;
        }
        if (selectedTasks.length > 0) {
            const dt = dataset.tasksCanonical || [];
            if (!selectedTasks.every(function (st) { return dt.indexOf(st) !== -1; })) return false;
        }
        if (yearFilter && String(dataset.year) !== yearFilter) return false;
        if (searchName && !dataset.name.toLowerCase().includes(searchName)) return false;
        return true;
    });

    filteredDatasets.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'zh-CN'));
    document.getElementById('dataset-count').innerHTML = '共 <strong>' + filteredDatasets.length + '</strong> 个数据集';
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('datasets-tbody');
    tbody.innerHTML = '';

    if (filteredDatasets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">没有找到匹配的数据集</td></tr>';
        return;
    }

    filteredDatasets.forEach(dataset => {
        const row = document.createElement('tr');
        const id = dataset.id || dataset.name.toLowerCase().replace(/\s+/g, '-');
        var taskDisplay = (dataset.tasksCanonical && dataset.tasksCanonical.length) ? dataset.tasksCanonical.join(' + ') : '';
        var detailUrl = 'dataset-detail.html?id=' + encodeURIComponent(id);

        const nameCell = document.createElement('td');
        nameCell.className = 'dataset-name-cell';
        nameCell.innerHTML =
            '<div class="dataset-name">' +
            '<a href="' + detailUrl + '" class="dataset-name-link">' +
            '<strong>' + (dataset.name || '') + '</strong>' +
            (dataset.year ? '<span class="dataset-year">(' + dataset.year + ')</span>' : '') +
            ' <i class="fas fa-external-link-alt link-icon"></i></a></div>' +
            '<div class="dataset-meta">' +
            (dataset.organsCanonical ? '<span class="meta-tag" title="器官类型"><i class="fas fa-lungs" aria-hidden="true"></i> ' + dataset.organsCanonical + '</span>' : '') +
            (dataset.structureCanonical && dataset.structureCanonical.length ? '<span class="meta-tag" title="结构类型"><i class="fas fa-microscope" aria-hidden="true"></i> ' + dataset.structureCanonical.join(' + ') + '</span>' : '') +
            (taskDisplay ? '<span class="meta-tag" title="任务类型"><i class="fas fa-tasks" aria-hidden="true"></i> ' + taskDisplay + '</span>' : '') +
            (dataset.stainingCanonical ? '<span class="meta-tag" title="染色类型"><i class="fas fa-palette" aria-hidden="true"></i> ' + dataset.stainingCanonical + '</span>' : '') +
            '</div>';

        const linksCell = document.createElement('td');
        linksCell.className = 'dataset-links-cell';
        const links = dataset.links || {};
        const linkHtml = [];
        if (links.data) linkHtml.push('<a href="' + links.data + '" target="_blank" class="link-btn"><i class="fas fa-database"></i> 数据</a>');
        if (links.paper) linkHtml.push('<a href="' + links.paper + '" target="_blank" class="link-btn"><i class="fas fa-file-pdf"></i> 论文</a>');
        if (links.github) linkHtml.push('<a href="' + links.github + '" target="_blank" class="link-btn"><i class="fab fa-github"></i> GitHub</a>');
        linksCell.innerHTML = linkHtml.length ? linkHtml.join(' ') : '<span class="no-link">暂无链接</span>';

        const infoCell = document.createElement('td');
        infoCell.className = 'dataset-info-cell';
        const info = [];
        if (dataset.size) info.push('<div class="info-row"><i class="fas fa-hdd"></i> <strong>大小:</strong> ' + dataset.size + '</div>');
        if (dataset.data) info.push('<div class="info-row"><i class="fas fa-file"></i> <strong>数据:</strong> ' + dataset.data + '</div>');
        if (dataset.type) info.push('<div class="info-row"><i class="fas fa-image"></i> <strong>类型:</strong> ' + dataset.type + '</div>');
        if (dataset.other) info.push('<div class="info-row"><i class="fas fa-info-circle"></i> <strong>其他:</strong> ' + dataset.other + '</div>');
        if (dataset.description) info.push('<div class="info-row description"><i class="fas fa-align-left"></i> ' + dataset.description + '</div>');
        infoCell.innerHTML = info.length ? info.join('') : '<span class="no-info">暂无信息</span>';

        row.appendChild(nameCell);
        row.appendChild(linksCell);
        row.appendChild(infoCell);
        tbody.appendChild(row);
    });
}

function resetFilters() {
    document.getElementById('filter-organs').value = '';
    document.getElementById('filter-staining').value = '';
    document.getElementById('filter-year').value = '';
    document.getElementById('search-name').value = '';
    document.querySelectorAll('#filter-structure-container input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    document.querySelectorAll('#filter-task-container input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    updateStructureFilterDisplay();
    updateTaskFilterDisplay();
    var st = document.getElementById('filter-structure-toggle');
    var sc = document.getElementById('filter-structure-container');
    if (st) st.classList.remove('active');
    if (sc) sc.classList.remove('show');
    document.getElementById('filter-task-toggle').classList.remove('active');
    document.getElementById('filter-task-container').classList.remove('show');
    applyFilters();
}

document.addEventListener('DOMContentLoaded', function () {
    loadAllDatasets();
    document.getElementById('filter-organs').addEventListener('change', applyFilters);
    document.getElementById('filter-staining').addEventListener('change', applyFilters);
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    document.getElementById('search-name').addEventListener('input', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
});
