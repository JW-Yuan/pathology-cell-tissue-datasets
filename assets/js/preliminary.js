/**
 * 前置知识页：从指定 Markdown 文件拉取内容，用 marked 词法分析提取标题，
 * 自动生成左侧目录锚点导航；正文渲染在右侧。
 * 修改 MD 路径：下方 CONFIG.MARKDOWN_PATH
 */
(function () {
    'use strict';

    var CONFIG = {
        MARKDOWN_PATH: 'Preliminary.md',
        /** 仅将 depth 在此范围内的标题加入目录（1=# 最大 … 6=######） */
        TOC_MIN_DEPTH: 1,
        TOC_MAX_DEPTH: 6,
        /**
         * 是否为标题自动加层级编号：一级 1、2、3…，二级 1.1、1.2、2.1…，三级 1.1.1…，与 Word 大纲类似。
         * 编号加在解析后的标题前，不改变原始 .md 文件。
         */
        NUMBER_HEADINGS: true
    };

    function stripHtml(s) {
        var d = document.createElement('div');
        d.innerHTML = s;
        return (d.textContent || d.innerText || '').trim();
    }

    /**
     * 将标题里的行内 Markdown（**粗体**、`代码`、[链接](url) 等）转为纯文本，供目录与 slug 使用。
     * lexer 的 heading.text 是源码而非 HTML，不能仅靠 stripHtml。
     */
    function markdownInlineToPlain(text) {
        if (!text) return '';
        var s = String(text).trim();
        if (typeof marked !== 'undefined') {
            try {
                if (typeof marked.parseInline === 'function') {
                    return stripHtml(marked.parseInline(s));
                }
                return stripHtml(marked.parse(s));
            } catch (e) {
                /* fall through */
            }
        }
        return stripMarkdownSyntaxFallback(s);
    }

    function stripMarkdownSyntaxFallback(s) {
        var t = s;
        t = t.replace(/`([^`]+)`/g, '$1');
        t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
        t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
        while (/\*\*[^*]+\*\*/.test(t)) {
            t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
        }
        while (/__[^_]+__/.test(t)) {
            t = t.replace(/__([^_]+)__/g, '$1');
        }
        while (/\*[^*]+\*/.test(t)) {
            t = t.replace(/\*([^*]+)\*/g, '$1');
        }
        return t.replace(/\s+/g, ' ').trim();
    }

    function slugify(text, usedIds) {
        usedIds = usedIds || new Set();
        var plain = markdownInlineToPlain(String(text)).replace(/\s+/g, ' ').trim();
        var base = plain
            .toLowerCase()
            .replace(/[`"'「」『』]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        if (!base) base = 'section';
        var id = base;
        var n = 0;
        while (usedIds.has(id)) {
            id = base + '-' + ++n;
        }
        usedIds.add(id);
        return id;
    }

    function extractHeadingsFromLexer(tokens) {
        var out = [];
        if (!tokens || !tokens.length) return out;
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.type === 'heading') {
                out.push({ depth: t.depth, text: t.text, raw: t.raw });
            }
        }
        return out;
    }

    /**
     * 按标题出现顺序生成多级编号（#→1,2 / ##→1.1,1.2 / ###→1.1.1…）。
     * 若文档以 #### 等开头、上级计数仍为 0，则把更浅层自动补为 1，避免出现 0.0.0.1。
     */
    function computeHeadingNumberPrefixes(headings) {
        var nums = [0, 0, 0, 0, 0, 0];
        var out = [];
        for (var i = 0; i < headings.length; i++) {
            var d = headings[i].depth;
            if (d < 1 || d > 6) {
                out.push('');
                continue;
            }
            nums[d - 1]++;
            for (var j = d; j < 6; j++) {
                nums[j] = 0;
            }
            for (var p = 0; p < d - 1; p++) {
                if (nums[p] === 0) {
                    nums[p] = 1;
                }
            }
            var parts = [];
            for (var k = 0; k < d; k++) {
                parts.push(nums[k]);
            }
            out.push(parts.join('.'));
        }
        return out;
    }

    /**
     * 必须使用与目录相同的 ids 数组。
     * 若在此处再次 slugify(h, usedIds)，usedIds 已被第一次生成 id 时占满，会得到 xxx-1、xxx-2，
     * 与左侧 href 不一致，锚点跳转会失效。
     */
    function applyHeadingIdsAndNumbers(html, ids, numberPrefixes) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var nodes = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6');
        var useNum = CONFIG.NUMBER_HEADINGS && numberPrefixes && numberPrefixes.length;
        for (var i = 0; i < nodes.length && i < ids.length; i++) {
            nodes[i].id = ids[i];
            if (useNum && numberPrefixes[i]) {
                var span = doc.createElement('span');
                span.className = 'heading-number';
                span.textContent = numberPrefixes[i];
                nodes[i].insertBefore(span, nodes[i].firstChild);
                nodes[i].insertBefore(doc.createTextNode('\u00a0'), span.nextSibling);
            }
        }
        return doc.body.innerHTML;
    }

    function buildTocHtml(headings, ids, numberPrefixes) {
        if (!headings.length) {
            return '<p class="preliminary-empty-toc">未检测到 Markdown 标题（# …）。可在 .md 中用 # / ## / ### 等标记章节。</p>';
        }
        var items = [];
        var count = 0;
        for (var i = 0; i < headings.length; i++) {
            var h = headings[i];
            if (h.depth < CONFIG.TOC_MIN_DEPTH || h.depth > CONFIG.TOC_MAX_DEPTH) continue;
            var id = ids[i];
            var label = markdownInlineToPlain(h.text);
            var num =
                CONFIG.NUMBER_HEADINGS && numberPrefixes && numberPrefixes[i]
                    ? '<span class="toc-num">' + numberPrefixes[i] + '</span> '
                    : '';
            var short = label.length > 42 ? label.slice(0, 40) + '…' : label;
            items.push(
                '<li><a class="toc-depth-' +
                    h.depth +
                    '" href="#' +
                    id +
                    '" title="' +
                    (numberPrefixes && numberPrefixes[i] ? numberPrefixes[i] + ' ' : '') +
                    label.replace(/"/g, '&quot;') +
                    '">' +
                    num +
                    short +
                    '</a></li>'
            );
            count++;
        }
        if (count === 0) {
            return '<p class="preliminary-empty-toc">没有符合目录层级的标题（当前为 H' + CONFIG.TOC_MIN_DEPTH + '–H' + CONFIG.TOC_MAX_DEPTH + '）。</p>';
        }
        return '<ul class="preliminary-toc">' + items.join('') + '</ul>';
    }

    function initScrollSpy(tocContainer, contentEl) {
        var links = tocContainer.querySelectorAll('a[href^="#"]');
        if (!links.length || !contentEl) return;

        var navOffset = 88;

        var headingEntries = [];
        for (var i = 0; i < links.length; i++) {
            var id = links[i].getAttribute('href').slice(1);
            var el = document.getElementById(id);
            if (el) headingEntries.push({ id: id, el: el, link: links[i] });
        }

        function setActive(id) {
            for (var j = 0; j < headingEntries.length; j++) {
                headingEntries[j].link.classList.toggle('active', headingEntries[j].id === id);
            }
        }

        for (var c = 0; c < links.length; c++) {
            links[c].addEventListener('click', function (ev) {
                var href = this.getAttribute('href');
                if (!href || href.charAt(0) !== '#') return;
                var target = document.getElementById(href.slice(1));
                if (!target) return;
                ev.preventDefault();
                var y = target.getBoundingClientRect().top + window.scrollY - navOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
                if (history.replaceState) {
                    history.replaceState(null, '', href);
                }
            });
        }

        var observer = new IntersectionObserver(
            function (entries) {
                for (var k = 0; k < entries.length; k++) {
                    var e = entries[k];
                    if (e.isIntersecting) {
                        setActive(e.target.id);
                        break;
                    }
                }
            },
            { rootMargin: '-88px 0px -70% 0px', threshold: [0, 0.1, 0.5, 1] }
        );

        for (var m = 0; m < headingEntries.length; m++) {
            observer.observe(headingEntries[m].el);
        }
    }

    function loadScript(url) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = url;
            s.async = true;
            s.onload = function () {
                resolve();
            };
            s.onerror = function () {
                reject(new Error('脚本加载失败: ' + url));
            };
            document.head.appendChild(s);
        });
    }

    async function ensureMarkedLoaded() {
        if (typeof marked !== 'undefined') return;

        // 先走 CDN，不可达时回退到仓库本地固定版本。
        var candidates = [
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
            'assets/vendor/marked.min.js'
        ];

        var lastErr = null;
        for (var i = 0; i < candidates.length; i++) {
            try {
                await loadScript(candidates[i]);
                if (typeof marked !== 'undefined') return;
            } catch (e) {
                lastErr = e;
            }
        }

        throw lastErr || new Error('未加载 marked 库');
    }

    async function load() {
        var loading = document.getElementById('preliminary-loading');
        var errEl = document.getElementById('preliminary-error');
        var main = document.getElementById('preliminary-main');
        var toc = document.getElementById('preliminary-toc');

        try {
            var res = await fetch(CONFIG.MARKDOWN_PATH);
            if (!res.ok) throw new Error('无法加载 ' + CONFIG.MARKDOWN_PATH + '（HTTP ' + res.status + '）');
            var md = await res.text();

            await ensureMarkedLoaded();

            marked.setOptions({ breaks: true, gfm: true });

            var tokens = marked.lexer(md);
            var allHeadings = extractHeadingsFromLexer(tokens);
            var usedIds = new Set();
            var ids = allHeadings.map(function (h) {
                return slugify(h.text, usedIds);
            });

            var numberPrefixes = CONFIG.NUMBER_HEADINGS
                ? computeHeadingNumberPrefixes(allHeadings)
                : [];

            var rawHtml = marked.parse(md);
            var htmlWithIds = applyHeadingIdsAndNumbers(rawHtml, ids, numberPrefixes);

            toc.innerHTML = buildTocHtml(allHeadings, ids, numberPrefixes);

            var mdDiv = document.getElementById('preliminary-md');
            mdDiv.innerHTML = htmlWithIds;

            loading.style.display = 'none';
            main.style.display = '';
            errEl.style.display = 'none';

            initScrollSpy(toc, mdDiv);
        } catch (e) {
            loading.style.display = 'none';
            main.style.display = 'none';
            errEl.style.display = 'block';
            var msg = errEl.querySelector('.error-text');
            if (msg) msg.textContent = e.message || String(e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
